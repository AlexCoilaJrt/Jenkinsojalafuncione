import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { EmprendimientoService } from './emprendimiento.service';

describe('EmprendimientoService', () => {
  let service: EmprendimientoService;
  let httpMock: HttpTestingController;

  const BASE = 'https://capachica-app-back-production.up.railway.app/emprendimientos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmprendimientoService]
    });
    service = TestBed.inject(EmprendimientoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería listar emprendimientos (sin params)', () => {
    const mock = [{ id: 1, nombre: 'E1' }];
    service.listarEmprendimientos().subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('debería listar emprendimientos paginados y con filtros', () => {
    const mock = [{ id: 2 }];
    service.listarEmprendimientosa(2, 5, { foo: 'bar' }).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(r =>
      r.url === BASE &&
      r.params.get('page') === '2' &&
      r.params.get('limit') === '5' &&
      r.params.get('foo') === 'bar'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('debería obtener un emprendimiento por ID', () => {
    const mock = { id: 3, nombre: 'E3' };
    service.verEmprendimiento(3).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${BASE}/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('debería crear un emprendimiento con token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('tk');
    const data = { nombre: 'Nuevo' };
    const mock = { id: 4, ...data };
    service.crearEmprendimiento(data).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tk');
    req.flush(mock);
  });

  it('debería actualizar un emprendimiento con token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('tk2');
    const data = { nombre: 'Upd' };
    service.actualizarEmprendimiento(5, data).subscribe(res => expect(res).toEqual({}));

    const req = httpMock.expectOne(`${BASE}/5`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tk2');
    expect(req.request.body).toEqual(data);
    req.flush({});
  });

  it('debería eliminar un emprendimiento con token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('tk3');
    service.eliminarEmprendimiento(6).subscribe(res => expect(res).toEqual({ deleted: true }));

    const req = httpMock.expectOne(`${BASE}/6`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tk3');
    req.flush({ deleted: true });
  });

  it('debería listar emprendimientos por usuario con token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('tokUs');
    const mock = [{ id: 7 }];
    service.listarEmprendimientosPorUsuario(10).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${BASE}/usuario/10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tokUs');
    req.flush(mock);
  });

  it('debería devolver misEmprendimientos (withCredentials)', () => {
    const mock = [{ id: 8 }];
    service.misEmprendimientos().subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${BASE}/my/list`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mock);
  });

  it('debería cambiar estado de emprendimiento (withCredentials)', () => {
    const mock = { id: 9, estado: 'X' };
    service.cambiarEstadoEmprendimiento(9, 'X').subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${BASE}/9/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'X' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mock);
  });

  it('debería listar pendientes (withCredentials)', () => {
    const mock = [{ id: 11 }];
    service.verPendientes().subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${BASE}/admin/pending`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mock);
  });

  it('debería buscar con filtros', () => {
    const mock = [{ id: 12 }];
    service.buscarConFiltros({ lugar: 'A', fecha: '2025-01-01' })
      .subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(r =>
      r.url === BASE &&
      r.params.get('lugar') === 'A' &&
      r.params.get('fecha') === '2025-01-01'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('debería obtener lugar turístico por ID', () => {
    const mock = { id: 13, nombre: 'Lugar13' };
    service.getLugarTuristico(13).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`https://capachica-app-back-production.up.railway.app/lugares-turisticos/13`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
