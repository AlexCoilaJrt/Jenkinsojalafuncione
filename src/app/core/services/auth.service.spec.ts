import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  const API_LOGIN = 'https://capachica-app-back-production.up.railway.app/auth/login';
  const API_USERS = 'https://capachica-app-back-production.up.railway.app/users';

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resetPassword & requestPasswordReset', () => {
    it('resetPassword debe hacer POST al endpoint correcto con withCredentials', () => {
      service.resetPassword('token123', 'newPass').subscribe();
      const req = httpMock.expectOne(service['RESET_PASSWORD_URL']);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      expect(req.request.body).toEqual({ token: 'token123', newPassword: 'newPass' });
      req.flush({});
    });

    it('requestPasswordReset debe hacer POST al endpoint correcto con withCredentials', () => {
      service.requestPasswordReset('email@test.com').subscribe();
      const req = httpMock.expectOne(service['REQUEST_PASSWORD_URL']);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      expect(req.request.body).toEqual({ email: 'email@test.com' });
      req.flush({});
    });
  });

  describe('register', () => {
    it('debe enviar POST con Content-Type JSON', () => {
      const userData = { name: 'Juan' };
      service.register(userData).subscribe();
      const req = httpMock.expectOne(service['REGISTER_URL']);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(userData);
      req.flush({ id: 1 });
    });
  });

  describe('login', () => {
    it('debe navegar a /dashboard si recibe access_token', fakeAsync(() => {
      service.login('a@b.com', 'pwd').subscribe();
      const req = httpMock.expectOne(API_LOGIN);
      expect(req.request.method).toBe('POST');
      req.flush({ access_token: 'abc123' });
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('no navega si no hay token en respuesta', fakeAsync(() => {
      service.login('a@b.com', 'pwd').subscribe();
      const req = httpMock.expectOne(API_LOGIN);
      req.flush({ foo: 'bar' });
      tick();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('getUsuarios & getUsuarioById', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'tok');
    });

    it('getUsuarios hace GET con header Authorization', () => {
      service.getUsuarios().subscribe();
      const req = httpMock.expectOne(API_USERS);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
      req.flush([]);
    });

    it('getUsuarioById hace GET a /{id} y hace tap en consola', () => {
      spyOn(console, 'log');
      service.getUsuarioById(5).subscribe();
      const req = httpMock.expectOne(`${API_USERS}/5`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
      req.flush({ id: 5 });
      expect(console.log).toHaveBeenCalledWith('Usuario obtenido desde la API:', { id: 5 });
    });
  });

  describe('getUsuarioId & getUsuarioRol', () => {
    it('getUsuarioId devuelve id del localStorage', () => {
      localStorage.setItem('usuario', JSON.stringify({ id: 77 }));
      expect(service.getUsuarioId()).toBe(77);
    });

    it('getUsuarioRol devuelve roles o arreglo vacío', () => {
      localStorage.setItem('usuario', JSON.stringify({ roles: ['admin'] }));
      expect(service.getUsuarioRol()).toEqual(['admin']);
      localStorage.setItem('usuario', JSON.stringify({ }));
      expect(service.getUsuarioRol()).toEqual([]);
    });
  });

  describe('actualizarUsuario, eliminarUsuario, asignarRol, quitarRol, crearUsuarioComoAdmin', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'tok');
    });

    it('actualizarUsuario hace PATCH a /{id}', () => {
      service.actualizarUsuario(3, { name: 'X' }).subscribe();
      const req = httpMock.expectOne(`${API_USERS}/3`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
      req.flush({});
    });

    it('eliminarUsuario hace DELETE a /{id}', () => {
      service.eliminarUsuario(4).subscribe();
      const req = httpMock.expectOne(`${API_USERS}/4`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('asignarRol hace POST a /{userId}/roles/{roleId}', () => {
      service.asignarRol(8, 2).subscribe();
      const req = httpMock.expectOne(`${API_USERS}/8/roles/2`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('quitarRol hace DELETE a /{userId}/roles/{roleId}', () => {
      service.quitarRol(8, 2).subscribe();
      const req = httpMock.expectOne(`${API_USERS}/8/roles/2`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('crearUsuarioComoAdmin hace POST a base /users', () => {
      const data = { foo: 'bar' };
      service.crearUsuarioComoAdmin(data).subscribe();
      const req = httpMock.expectOne(`${API_USERS}`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('logout', () => {
    it('logout navega a root', () => {
      service.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});