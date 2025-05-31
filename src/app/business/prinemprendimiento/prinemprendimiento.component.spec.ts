import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PrinemprendimientoComponent } from './prinemprendimiento.component';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { BusquedaGlobalService } from '../../core/services/busqueda-global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PrinemprendimientoComponent', () => {
  let component: PrinemprendimientoComponent;
  let fixture: ComponentFixture<PrinemprendimientoComponent>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoService>;
  let busquedaService: jasmine.SpyObj<BusquedaGlobalService>;
  let routeQueryParams$: Subject<any>;
  let router: Router;

  beforeEach(async () => {
    // Espiar ngOnInit de NavbarComponent para que no ejecute su lógica de suscripción
    spyOn(NavbarComponent.prototype, 'ngOnInit').and.callFake(() => {});

    emprendimientoService = jasmine.createSpyObj('EmprendimientoService', ['listarEmprendimientos']);
    busquedaService = jasmine.createSpyObj('BusquedaGlobalService', ['buscarConFiltros']);
    routeQueryParams$ = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        NavbarComponent,
        PrinemprendimientoComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule  // Provee HttpClient para cualquier servicio que lo requiera
      ],
      providers: [
        { provide: EmprendimientoService, useValue: emprendimientoService },
        { provide: BusquedaGlobalService,  useValue: busquedaService },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: routeQueryParams$.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrinemprendimientoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit with no filters (cargarEmprendimientosOriginales)', () => {
    it('calls cargarEmprendimientosOriginales when no queryParams filters', fakeAsync(() => {
      const mockData = [
        { id: 1, nombre: 'E1', direccion: 'Dir1', fechaDisponible: '2025-01-01' },
        { id: 2, nombre: 'E2', direccion: 'Dir2', fechaDisponible: '2025-02-02' }
      ];
      emprendimientoService.listarEmprendimientos.and.returnValue(of(mockData));

      fixture.detectChanges(); // dispara ngOnInit del componente

      routeQueryParams$.next({});
      tick();

      expect(emprendimientoService.listarEmprendimientos).toHaveBeenCalled();
      expect(component.emprendimientosOriginal.length).toBe(2);
      expect(component.emprendimientos[0].currentImageIndex).toBe(0);
      expect(component.emprendimientos[1].currentImageIndex).toBe(0);
      expect(component.emprendimientosFiltrados.length).toBe(2);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('ngOnInit with filters (buscarConFiltros)', () => {
    it('calls buscarConFiltros when queryParams contain filters', fakeAsync(() => {
      const mockFiltered = [
        { id: 3, nombre: 'FE', direccion: 'DirF', fechaDisponible: '2025-03-03' }
      ];
      busquedaService.buscarConFiltros.and.returnValue(of(mockFiltered));

      fixture.detectChanges(); // dispara ngOnInit

      routeQueryParams$.next({ nombre: 'X' });
      tick();

      expect(busquedaService.buscarConFiltros).toHaveBeenCalledWith(
        jasmine.objectContaining({
          nombre: 'X',
          lugar: undefined,
          fechaDesde: undefined,
          tipo: 'emprendimientos'
        })
      );
      expect(component.emprendimientos.length).toBe(1);
      expect(component.emprendimientos[0].currentImageIndex).toBe(0);
      expect(component.emprendimientosFiltrados.length).toBe(1);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('cargarEmprendimientosOriginales()', () => {
    it('loads and maps data correctly', fakeAsync(() => {
      const mockData = [
        { id: 10, nombre: 'A', direccion: 'LocA', fechaDisponible: '2025-05-05' }
      ];
      emprendimientoService.listarEmprendimientos.and.returnValue(of(mockData));

      component.cargarEmprendimientosOriginales();
      tick();

      expect(component.emprendimientosOriginal).toEqual(mockData);
      expect(component.emprendimientos[0].currentImageIndex).toBe(0);
      expect(component.emprendimientosFiltrados).toEqual(component.emprendimientos);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('buscarConFiltros()', () => {
    it('loads filtered data and maps currentImageIndex', fakeAsync(() => {
      const mockFiltered = [
        { id: 20, nombre: 'BF', direccion: 'LocB', fechaDisponible: '2025-05-06' }
      ];
      busquedaService.buscarConFiltros.and.returnValue(of(mockFiltered));

      const filtrosArg = { nombre: 'BF', lugar: 'LocB', fechaDesde: '2025-05-06', tipo: 'emprendimientos' };
      component.buscarConFiltros(filtrosArg);
      tick();

      expect(busquedaService.buscarConFiltros).toHaveBeenCalledWith(
        jasmine.objectContaining(filtrosArg)
      );
      expect(component.emprendimientos[0].currentImageIndex).toBe(0);
      expect(component.emprendimientosFiltrados).toEqual(component.emprendimientos);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('verDetallesEmprendimiento()', () => {
    it('navigates to detail route', () => {
      spyOn(router, 'navigate');
      component.verDetallesEmprendimiento(42);
      expect(router.navigate).toHaveBeenCalledWith([`/emprendimientodetalle/42`]);
    });
  });

  describe('aplicarFiltrosLocal()', () => {
    beforeEach(() => {
      component.emprendimientosOriginal = [
        { id: 1, nombre: 'Alpha', direccion: 'Loc1', fechaDisponible: '2025-01-01' },
        { id: 2, nombre: 'Beta',  direccion: 'LocX', fechaDisponible: '2025-02-02' },
        { id: 3, nombre: 'Gamma', direccion: 'Loc1', fechaDisponible: '2025-03-03' }
      ];
    });

    it('filters by nombre only', () => {
      component.aplicarFiltrosLocal({ nombre: 'Alp', lugar: '', fecha: '' });
      expect(component.emprendimientos.length).toBe(1);
      expect(component.emprendimientos[0].id).toBe(1);
    });

    it('filters by lugar only', () => {
      component.aplicarFiltrosLocal({ nombre: '', lugar: 'loc1', fecha: '' });
      expect(component.emprendimientos.length).toBe(2);
      expect(component.emprendimientos.map(e => e.id)).toEqual([1, 3]);
    });

    it('filters by fecha only', () => {
      component.aplicarFiltrosLocal({ nombre: '', lugar: '', fecha: '2025-02-02' });
      expect(component.emprendimientos.length).toBe(1);
      expect(component.emprendimientos[0].id).toBe(2);
    });

    it('combines multiple filters', () => {
      component.aplicarFiltrosLocal({ nombre: 'a', lugar: 'loc1', fecha: '2025-03-03' });
      expect(component.emprendimientos.length).toBe(1);
      expect(component.emprendimientos[0].id).toBe(3);
    });

    it('returns all when no filters', () => {
      component.aplicarFiltrosLocal({ nombre: '', lugar: '', fecha: '' });
      expect(component.emprendimientos).toEqual(component.emprendimientosOriginal);
    });
  });
});
