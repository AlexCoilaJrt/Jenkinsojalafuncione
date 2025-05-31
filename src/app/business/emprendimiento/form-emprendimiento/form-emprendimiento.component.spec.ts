import { ComponentFixture, TestBed, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { FormEmprendimientoComponent } from './form-emprendimiento.component';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { LugaresService } from '../../../core/services/lugar.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

class FakeFileReader {
  result: string = '';
  onload!: (event: any) => void;
  readAsDataURL(_file: any) {
    this.result = 'data:url';
    if (this.onload) {
      this.onload({ target: this });
    }
  }
}

describe('FormEmprendimientoComponent', () => {
  let component: FormEmprendimientoComponent;
  let fixture: ComponentFixture<FormEmprendimientoComponent>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoService>;
  let lugarService: jasmine.SpyObj<LugaresService>;
  let supabaseService: jasmine.SpyObj<SupabaseService>;
  let authService: jasmine.SpyObj<AuthService>;
  let route: ActivatedRoute;
  let router: Router;
  let swalFire: jasmine.Spy;
  let swalClose: jasmine.Spy;

  beforeEach(async () => {
    // 1) Creamos el spy de AuthService con AMBOS métodos que necesita SidebarComponent 
    //    y el propio FormEmprendimientoComponent: getUsuarios() y getUsuarioRol().
    authService = jasmine.createSpyObj('AuthService', ['getUsuarios', 'getUsuarioRol']);

    emprendimientoService = jasmine.createSpyObj('EmprendimientoService', [
      'verEmprendimiento',
      'crearEmprendimiento',
      'actualizarEmprendimiento'
    ]);
    lugarService         = jasmine.createSpyObj('LugaresService', ['getLugares']);
    supabaseService      = jasmine.createSpyObj('SupabaseService', ['getClient']);

    // Simulamos ruta sin parámetro (modo creación)
    route = {
      snapshot: { paramMap: { get: () => null } },
      routeConfig: { path: '' }
    } as any;

    // 2) Espiamos SweetAlert2
    swalFire  = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: undefined } as any));
    swalClose = spyOn(Swal, 'close').and.callThrough();

    // 3) Asegurarnos de que ngOnInit interno de FormEmprendimientoComponent se ejecute 
    //    (no es estrictamente necesario “prevenirlo”, lo dejamos real)
    //    En nuestro caso, SidebarComponent realizará getUsuarioRol() sin problema, 
    //    porque ya estuvimos generando el spy con ese método.
    // spyOn(FormEmprendimientoComponent.prototype, 'ngOnInit').and.callThrough();

    // 4) Reemplazar FileReader global para pruebas de onFileChange
    (window as any).FileReader = FakeFileReader;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormEmprendimientoComponent,            // Como es standalone, se importa directamente
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: EmprendimientoService, useValue: emprendimientoService },
        { provide: LugaresService,        useValue: lugarService },
        { provide: SupabaseService,       useValue: supabaseService },
        { provide: AuthService,           useValue: authService },
        { provide: ActivatedRoute,        useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormEmprendimientoComponent);
    component = fixture.componentInstance;
    router    = TestBed.inject(Router);

    // 5) Configuramos respuestas “por defecto”:
    //    - getUsuarios devuelve un observable vacío (arroja lista de usuarios vacía).
    authService.getUsuarios.and.returnValue(of([]));
    //    - getUsuarioRol devuelve un array de roles (por ejemplo, ['User']) que SidebarComponent necesita
    authService.getUsuarioRol.and.returnValue(['User']);

    //    - getLugares devuelve un observable vacío (lista vacía de lugares)
    lugarService.getLugares.and.returnValue(of([]));

    //    - getClient simula un cliente de Supabase que siempre sube sin error y devuelve URL
    supabaseService.getClient.and.returnValue({
      storage: {
        from: () => ({
          upload: (_path: string, _file: File) => Promise.resolve({ error: null }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: 'http://url' } })
        })
      }
    } as any);

    fixture.detectChanges(); // Dispara ngOnInit() de FormEmprendimientoComponent y, a su vez, ngOnInit() de SidebarComponent
  });

  it('should create y cargar usuarios y lugares sin que Sidebar falle', () => {
    expect(component).toBeTruthy();

    // SidebarComponent.ngOnInit() habrá llamado a authService.getUsuarioRol()
    expect(authService.getUsuarioRol).toHaveBeenCalled();

    // FormEmprendimientoComponent.ngOnInit() habrá llamado a authService.getUsuarios() y lugarService.getLugares()
    expect(authService.getUsuarios).toHaveBeenCalled();
    expect(lugarService.getLugares).toHaveBeenCalled();

    // El formulario reactivo debe existir
    expect(component.emprendimientoForm).toBeDefined();

    // Los arreglos iniciales asignados (vacíos, según nuestros spies)
    expect(component.usuarios).toEqual([]);
    expect(component.lugaresTuristicos).toEqual([]);
  });

  it('onFileChange debe generar previewUrls y añadir a selectedFiles', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file], value: 'x' } } as any;

    component.onFileChange(event);

    expect(component.selectedFiles.length).toBe(1);
    expect(component.previewUrls).toEqual(['data:url']);
    // El input debe resetear su value
    expect(event.target.value).toBe('');
  });

  it('removeImage elimina correctamente el archivo y la URL', () => {
    component.selectedFiles = [{} as any, {} as any];
    component.previewUrls   = ['url1', 'url2'];

    component.removeImage(0);

    expect(component.selectedFiles.length).toBe(1);
    expect(component.previewUrls).toEqual(['url2']);
  });

  describe('guardarEmprendimiento()', () => {
    it('muestra error si el formulario es inválido', fakeAsync(() => {
      // Invalidamos puntos críticos del formulario
      component.emprendimientoForm.patchValue({
        nombre: '',
        lugarTuristicoId: null,
        descripcion: '',
        tipo: '',
        direccion: '',
        estado: '',
        usuarioId: null,
        contactoTelefono: '',
        contactoEmail: ''
      });

      component.guardarEmprendimiento();
      flushMicrotasks();

      expect(swalFire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Formulario incompleto',
        html: jasmine.stringMatching(/Completa:/)
      });
      expect(emprendimientoService.crearEmprendimiento).not.toHaveBeenCalled();
      expect(emprendimientoService.actualizarEmprendimiento).not.toHaveBeenCalled();
    }));

    it('muestra error si subirImagen falla para alguna imagen', fakeAsync(() => {
      // Datos válidos en el formulario
      component.emprendimientoForm.patchValue({
        nombre: 'Test',
        lugarTuristicoId: 1,
        descripcion: 'Desc',
        tipo: 'Turismo',
        direccion: 'Dir',
        estado: 'Activo',
        usuarioId: 2,
        contactoTelefono: '1234',
        contactoEmail: 'test@example.com'
      });
      // Agregamos un archivo para que intente subir
      const file = new File([''], 'fail.png', { type: 'image/png' });
      component.selectedFiles = [file];

      // Esta vez supabase.upload siempre regresa error
      supabaseService.getClient.and.returnValue({
        storage: {
          from: () => ({
            upload: (_path: string, _file: File) => Promise.resolve({ error: { message: 'upload failed' } })
          })
        }
      } as any);

      component.guardarEmprendimiento();
      flush(); // Resuelve todas las promesas internas (readAsDataURL + upload)

      expect(swalClose).toHaveBeenCalled();
      expect(swalFire).toHaveBeenCalledWith('Error', 'No se pudieron subir todas las imágenes', 'error');
      expect(emprendimientoService.crearEmprendimiento).not.toHaveBeenCalled();
      expect(emprendimientoService.actualizarEmprendimiento).not.toHaveBeenCalled();
    }));

    it('crea emprendimiento sin imágenes y navega en success', fakeAsync(() => {
      component.emprendimientoForm.patchValue({
        nombre: 'Test',
        lugarTuristicoId: 1,
        descripcion: 'Desc',
        tipo: 'Turismo',
        direccion: 'Dir',
        estado: 'Activo',
        usuarioId: 2,
        contactoTelefono: '1234',
        contactoEmail: 'test@example.com'
      });
      component.selectedFiles = [];

      emprendimientoService.crearEmprendimiento.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.guardarEmprendimiento();
      flushMicrotasks(); // Resuelve la llamada a Swal.fire()
      tick();             // Avanza el then() del Swal.fire de éxito

      expect(swalFire).toHaveBeenCalledWith('¡Éxito!', 'Emprendimiento guardado correctamente', 'success');
      expect(router.navigate).toHaveBeenCalledWith(['/emprendimiento']);
    }));

    it('actualiza emprendimiento en modo edición y navega en success', fakeAsync(() => {
      // Forzamos modo edición
      (component as any).isEdit    = true;
      (component as any).currentId = 42;

      component.emprendimientoForm.patchValue({
        nombre: 'Edit',
        lugarTuristicoId: 3,
        descripcion: 'DescE',
        tipo: 'Turismo',
        direccion: 'DirE',
        estado: 'Activo',
        usuarioId: 4,
        contactoTelefono: '5678',
        contactoEmail: 'edit@example.com'
      });
      component.selectedFiles = [];

      emprendimientoService.actualizarEmprendimiento.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.guardarEmprendimiento();
      flushMicrotasks();
      tick();

      expect(emprendimientoService.actualizarEmprendimiento).toHaveBeenCalledWith(42, jasmine.any(Object));
      expect(swalFire).toHaveBeenCalledWith('¡Éxito!', 'Emprendimiento guardado correctamente', 'success');
      expect(router.navigate).toHaveBeenCalledWith(['/emprendimiento']);
    }));

    it('maneja error si crear/actualizar falla', fakeAsync(() => {
      component.emprendimientoForm.patchValue({
        nombre: 'Err',
        lugarTuristicoId: 2,
        descripcion: 'DescErr',
        tipo: 'Turismo',
        direccion: 'DirErr',
        estado: 'Activo',
        usuarioId: 3,
        contactoTelefono: '0000',
        contactoEmail: 'err@example.com'
      });
      component.selectedFiles = [];

      // Forzamos excepción en crearEmprendimiento
      emprendimientoService.crearEmprendimiento.and.returnValue(throwError(() => new Error('API error')));
      spyOn(console, 'error');

      component.guardarEmprendimiento();
      flushMicrotasks();

      expect(console.error).toHaveBeenCalled();
      expect(swalFire).toHaveBeenCalledWith('Error', 'Ocurrió un error guardando el emprendimiento', 'error');
    }));
  });

  it('cancelar() debe navegar a /emprendimiento', () => {
    spyOn(router, 'navigate');
    component.cancelar();
    expect(router.navigate).toHaveBeenCalledWith(['/emprendimiento']);
  });

  describe('ngOnInit en modo edición', () => {
    it('carga datos existentes y asigna previewUrls', fakeAsync(() => {
      // Configurar ruta para modo edición
      const fakeId = '10';
      (route.snapshot.paramMap as any).get = () => fakeId;
      (route.routeConfig as any).path = 'editar/:id';

      const returnedData = {
        nombre: 'Ex',
        lugarTuristicoId: 7,
        descripcion: 'DescEx',
        tipo: 'Turismo',
        direccion: 'DirEx',
        estado: 'Activo',
        fechaAprobacion: '2025-05-01T00:00:00.000Z',
        usuarioId: 8,
        contactoTelefono: '9999',
        contactoEmail: 'ex@example.com',
        latitud: -12,
        longitud: -77,
        imagenes: [{ url: 'http://img1' }, { url: 'http://img2' }]
      };
      emprendimientoService.verEmprendimiento.and.returnValue(of(returnedData));

      // Recreamos el componente para forzar ngOnInit en modo edición
      fixture = TestBed.createComponent(FormEmprendimientoComponent);
      component = fixture.componentInstance;
      (component as any).route              = route;
      (component as any).emprendimientoService = emprendimientoService;
      (component as any).authService         = authService;
      (component as any).lugarService        = lugarService;
      fixture.detectChanges(); // Dispara ngOnInit()

      tick(); // Espera a que termine el subscribe de verEmprendimiento

      // Verificamos que el formulario se haya parcheado correctamente
      expect(component.emprendimientoForm.get('nombre')?.value).toBe('Ex');
      expect(component.emprendimientoForm.get('lugarTuristicoId')?.value).toBe(7);
      // Verificamos que las URLs de imágenes se hayan asignado a previewUrls
      expect(component.previewUrls).toEqual(['http://img1', 'http://img2']);
    }));
  });
});
