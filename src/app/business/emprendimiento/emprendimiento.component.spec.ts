import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { EmprendimientoComponent } from './emprendimiento.component';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { LugaresService } from '../../core/services/lugar.service';
import { BusquedaGlobalService, FiltrosBusqueda } from '../../core/services/busqueda-global.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError, Subject } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../sidebar/navbar/navbar.component';
import { CommonModule } from '@angular/common';

describe('EmprendimientoComponent', () => {
  let component: EmprendimientoComponent;
  let fixture: ComponentFixture<EmprendimientoComponent>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoService>;
  let lugarService: jasmine.SpyObj<LugaresService>;
  let busquedaService: jasmine.SpyObj<BusquedaGlobalService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let swalFireSpy: jasmine.Spy;

  beforeEach(async () => {
    emprendimientoService = jasmine.createSpyObj('EmprendimientoService', [
      'listarEmprendimientos',
      'listarEmprendimientosa',
      'buscarConFiltros',
      'eliminarEmprendimiento'
    ]);
    lugarService = jasmine.createSpyObj('LugaresService', ['listarLugares']);
    busquedaService = jasmine.createSpyObj('BusquedaGlobalService', ['getFiltros']);
    authService = jasmine.createSpyObj('AuthService', ['getUsuarioRol', 'getUsuarioId']);

    // Stubear métodos utilizados en ngOnInit para evitar undefined.subscribe
    emprendimientoService.listarEmprendimientos.and.returnValue(of([]));
    emprendimientoService.listarEmprendimientosa.and.returnValue(of([]));
    lugarService.listarLugares.and.returnValue(of([]));
    busquedaService.getFiltros.and.returnValue(of({
      tipo: 'lugares',
      nombre: '',
      lugar: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined
    }));
    authService.getUsuarioRol.and.returnValue(['User']);

    // Spy a Swal.fire
    swalFireSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        NavbarComponent,
        CommonModule,
        EmprendimientoComponent,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: EmprendimientoService, useValue: emprendimientoService },
        { provide: LugaresService,       useValue: lugarService },
        { provide: BusquedaGlobalService, useValue: busquedaService },
        { provide: AuthService,          useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmprendimientoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y carga inicial', () => {
    it('debe suscribirse a filtros y cargar lugares antes de emprendimientos', fakeAsync(() => {
      // Overwrite getFiltros para este test
      const filtrosSubj = new Subject<FiltrosBusqueda>();
      busquedaService.getFiltros.and.returnValue(filtrosSubj.asObservable());
      // Simular listarLugares exitoso
      const lugaresMock = [{ id: 1, nombre: 'Lugar A' }, { id: 2, nombre: 'Lugar B' }];
      lugarService.listarLugares.and.returnValue(of(lugaresMock));
      // Simular listarEmprendimientosa
      const emprsMock = [
        { id: 10, nombre: 'Emp A', lugarTuristicoId: 1 },
        { id: 20, nombre: 'Emp B', lugarTuristicoId: 2 }
      ];
      emprendimientoService.listarEmprendimientosa.and.returnValue(of(emprsMock));

      fixture.detectChanges(); // dispara ngOnInit()
      tick();

      expect((component as any).lugaresMap[1]).toBe('Lugar A');
      expect((component as any).lugaresMap[2]).toBe('Lugar B');
      expect(emprendimientoService.listarEmprendimientosa).toHaveBeenCalledWith(1, 10);
      tick();
      expect(component.emprendimientos.length).toBe(2);
      expect(component.emprendimientos[0].lugarNombre).toBe('Lugar A');
      expect(component.emprendimientos[1].lugarNombre).toBe('Lugar B');
      expect(component.isLoading).toBeFalse();

      // Emitir filtro con tipo distinto a "emprendimientos"
      filtrosSubj.next({ tipo: 'lugares', nombre: '', lugar: undefined, fechaDesde: undefined, fechaHasta: undefined });
      tick();
      expect(emprendimientoService.buscarConFiltros).not.toHaveBeenCalled();
    }));

    it('si listarLugares falla, aún así llama a cargarEmprendimientos', fakeAsync(() => {
      busquedaService.getFiltros.and.returnValue(of({
        tipo: 'lugares',
        nombre: '',
        lugar: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined
      }));
      lugarService.listarLugares.and.returnValue(throwError(() => new Error('fail lugares')));
      emprendimientoService.listarEmprendimientosa.and.returnValue(of([]));

      fixture.detectChanges(); // ngOnInit
      tick();

      expect(emprendimientoService.listarEmprendimientosa).toHaveBeenCalledWith(1, 10);
      tick();
      expect(component.emprendimientos).toEqual([]);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('cargarEmprendimientos()', () => {
    it('debe cargar emprendimientos y mapear lugarNombre', fakeAsync(() => {
      (component as any).lugaresMap = { 1: 'Lugar Uno' };
      const emprsMock = [
        { id: 5, nombre: 'Emp 5', lugarTuristicoId: 1 },
        { id: 6, nombre: 'Emp 6', lugarTuristicoId: 99 }
      ];
      emprendimientoService.listarEmprendimientosa.and.returnValue(of(emprsMock));
      component.paginaActual = 2;
      component.limitePorPagina = 5;

      component.cargarEmprendimientos();
      tick();

      expect(emprendimientoService.listarEmprendimientosa).toHaveBeenCalledWith(2, 5);
      expect(component.emprendimientos.length).toBe(2);
      expect(component.emprendimientos[0].lugarNombre).toBe('Lugar Uno');
      expect(component.emprendimientos[1].lugarNombre).toBe('Sin asignar');
      expect(component.isLoading).toBeFalse();
    }));

    it('si falla listarEmprendimientosa, muestra Swal de error y isLoading false', fakeAsync(() => {
      emprendimientoService.listarEmprendimientosa.and.returnValue(throwError(() => new Error('error rnd')));
      (component as any).lugaresMap = { 1: 'Lugar One' };

      component.cargarEmprendimientos();
      tick();

      expect(swalFireSpy).toHaveBeenCalledWith(
        'Error',
        'No se pudieron cargar los emprendimientos. Intenta nuevamente.',
        'error'
      );
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('getEmprendimientosPaginados()', () => {
    it('debe devolver el slice correcto según paginaActual y limitePorPagina', () => {
      component.emprendimientos = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      component.paginaActual = 2;
      component.limitePorPagina = 10;

      const paginados = component.getEmprendimientosPaginados();
      expect(paginados.length).toBe(10);
      expect(paginados[0].id).toBe(11);
      expect(paginados[9].id).toBe(20);
    });

    it('si hay menos elementos que el slice, retorna lo que haya', () => {
      component.emprendimientos = [{ id: 1 }, { id: 2 }, { id: 3 }];
      component.paginaActual = 1;
      component.limitePorPagina = 5;
      const paginados = component.getEmprendimientosPaginados();
      expect(paginados).toEqual(component.emprendimientos);
    });
  });

  describe('paginación', () => {
    beforeEach(() => {
      component.emprendimientos = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));
      component.limitePorPagina = 5;
      component.paginaActual = 1;
    });

    it('paginaSiguiente incrementa paginaActual y llama a cargarEmprendimientos si no es última página', fakeAsync(() => {
      spyOn(component, 'cargarEmprendimientos');
      component.paginaSiguiente();
      expect(component.paginaActual).toBe(2);
      expect(component.cargarEmprendimientos).toHaveBeenCalled();

      component.paginaSiguiente();
      expect(component.paginaActual).toBe(3);
      expect(component.cargarEmprendimientos).toHaveBeenCalledTimes(2);

      component.paginaSiguiente();
      expect(component.paginaActual).toBe(3);
      expect(component.cargarEmprendimientos).toHaveBeenCalledTimes(2);
    }));

    it('paginaAnterior decrementa paginaActual y llama a cargarEmprendimientos si páginaActual > 1', fakeAsync(() => {
      component.paginaActual = 3;
      spyOn(component, 'cargarEmprendimientos');

      component.paginaAnterior();
      expect(component.paginaActual).toBe(2);
      expect(component.cargarEmprendimientos).toHaveBeenCalled();

      component.paginaAnterior();
      expect(component.paginaActual).toBe(1);
      expect(component.cargarEmprendimientos).toHaveBeenCalledTimes(2);

      component.paginaAnterior();
      expect(component.paginaActual).toBe(1);
      expect(component.cargarEmprendimientos).toHaveBeenCalledTimes(2);
    }));
  });

  describe('editar()', () => {
    it('debe navegar a /emprendimientos/editar/:id', () => {
      spyOn(router, 'navigate');
      component.editar('123');
      expect(router.navigate).toHaveBeenCalledWith(['/emprendimientos/editar/123']);
    });
  });

  describe('aplicarFiltros()', () => {
    it('ignora filtros si tipo !== "emprendimientos"', fakeAsync(() => {
      // Hacemos que lugarService.listarLugares no emita para evitar sobreescritura
      lugarService.listarLugares.and.returnValue(new Subject<any[]>());
      busquedaService.getFiltros.and.returnValue(of({
        tipo: 'lugares',
        nombre: '',
        lugar: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined
      }));
      fixture.detectChanges();
      tick();
      expect(emprendimientoService.buscarConFiltros).not.toHaveBeenCalled();
    }));

    it('si tipo === "emprendimientos", llama a buscarConFiltros y asigna resultados', fakeAsync(() => {
      // Hacemos que lugarService.listarLugares no emita para evitar sobreescritura
      lugarService.listarLugares.and.returnValue(new Subject<any[]>());
      const filtros: FiltrosBusqueda = {
        tipo: 'emprendimientos',
        nombre: 'Test',
        lugar: '2',
        fechaDesde: '2025-01-01',
        fechaHasta: '2025-12-31'
      };
      const resultadoMock = [
        { id: 7, nombre: 'Filtrado', lugarTuristicoId: 2 }
      ];
      busquedaService.getFiltros.and.returnValue(of(filtros));
      emprendimientoService.buscarConFiltros.and.returnValue(of(resultadoMock));

      fixture.detectChanges(); // dispara ngOnInit
      tick();

      expect(emprendimientoService.buscarConFiltros).toHaveBeenCalledWith({
        nombre: 'Test',
        lugar: '2',
        fechaDesde: '2025-01-01',
        fechaHasta: '2025-12-31'
      });
      expect(component.emprendimientos).toEqual(resultadoMock);
    }));
  });

  describe('eliminar()', () => {
    beforeEach(() => {
      component.emprendimientos = [
        { id: 11, nombre: 'E1' },
        { id: 22, nombre: 'E2' }
      ];
    });

    it('si el usuario cancela no llama a eliminarEmprendimiento', fakeAsync(() => {
      emprendimientoService.eliminarEmprendimiento.and.returnValue(of(void 0));
      component.eliminar(11);
      tick();
      expect(emprendimientoService.eliminarEmprendimiento).not.toHaveBeenCalled();
    }));

    it('si confirma, remueve el emprendimiento y muestra Swal de éxito', fakeAsync(() => {
      swalFireSpy.and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      emprendimientoService.eliminarEmprendimiento.and.returnValue(of(void 0));
      spyOn(component, 'cargarEmprendimientos');

      component.eliminar(11);
      tick();

      expect(emprendimientoService.eliminarEmprendimiento).toHaveBeenCalledWith(11);
      tick();

      expect(component.emprendimientos.length).toBe(1);
      expect(component.emprendimientos[0].id).toBe(22);
      expect(swalFireSpy).toHaveBeenCalledWith('Eliminado', 'El emprendimiento ha sido eliminado.', 'success');
      expect(component.cargarEmprendimientos).not.toHaveBeenCalled();
    }));

    it('si eliminarEmprendimiento falla, muestra Swal de error', fakeAsync(() => {
      swalFireSpy.and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      emprendimientoService.eliminarEmprendimiento.and.returnValue(throwError(() => new Error('err')));

      component.eliminar(22);
      tick();

      expect(emprendimientoService.eliminarEmprendimiento).toHaveBeenCalledWith(22);
      tick();

      expect(swalFireSpy).toHaveBeenCalledWith('Error', 'No se pudo eliminar el emprendimiento. Intenta nuevamente.', 'error');
    }));
  });
});
