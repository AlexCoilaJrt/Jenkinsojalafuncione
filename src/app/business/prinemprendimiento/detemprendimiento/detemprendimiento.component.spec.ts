import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetprinEmprendimientoComponent } from './detemprendimiento.component';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { LugaresService } from '../../../core/services/lugar.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../navbar/navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DetprinEmprendimientoComponent', () => {
  let empService: jasmine.SpyObj<EmprendimientoService>;
  let lugarService: jasmine.SpyObj<LugaresService>;
  let serviciosService: jasmine.SpyObj<ServiciosService>;

  beforeEach(() => {
    empService = jasmine.createSpyObj('EmprendimientoService', ['verEmprendimiento']);
    lugarService = jasmine.createSpyObj('LugaresService', ['getLugar', 'getLugares']);
    serviciosService = jasmine.createSpyObj('ServiciosService', ['listarServicios']);
  });

  describe('ngOnInit with missing ID', () => {
    let component: DetprinEmprendimientoComponent;
    let fixture: ComponentFixture<DetprinEmprendimientoComponent>;

    beforeEach(async () => {
      // Prevent NavbarComponent logic
      spyOn(NavbarComponent.prototype, 'ngOnInit').and.callFake(() => {});

      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          ReactiveFormsModule,
          NavbarComponent,
          DetprinEmprendimientoComponent,
          RouterTestingModule.withRoutes([]),
          HttpClientTestingModule
        ],
        providers: [
          { provide: EmprendimientoService, useValue: empService },
          { provide: LugaresService,       useValue: lugarService },
          { provide: ServiciosService,     useValue: serviciosService },
          { provide: FormBuilder,          useValue: new FormBuilder() },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: (_key: string) => null } } }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DetprinEmprendimientoComponent);
      component = fixture.componentInstance;
    });

    it('sets errorMessage and isLoading false when no id in route', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.errorMessage).toBe('ID de emprendimiento no proporcionado');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('ngOnInit with valid ID', () => {
    let component: DetprinEmprendimientoComponent;
    let fixture: ComponentFixture<DetprinEmprendimientoComponent>;
    let sanitizer: DomSanitizer;
    let router: Router;

    const mockDetalle = {
      id: '123',
      lugarTuristicoId: '5',
      latitud: 10,
      longitud: 20,
      precioBase: 100,
      imagenes: ['img1', 'img2']
    };
    const mockLugar = {
      id: '5',
      nombre: 'Lugar X',
      descripcion: '',
      direccion: '',
      latitud: 0,
      longitud: 0,
      precioBase: 0,
      imagenes: [],
      fechaDisponible: '2025-01-01',
      horarioApertura: '08:00',
      horarioCierre: '18:00',
      costoEntrada: 0,
      recomendaciones: '',
      contacto: ''
    };
    const allServicios = [
      { id: 's1', tipoServicioId: 1, serviciosEmprendedores: [{ emprendimientoId: '123' }] },
      { id: 's2', tipoServicioId: 2, serviciosEmprendedores: [{ emprendimientoId: '999' }] }
    ];
    const mockLugaresList = [
      { id: 'A', nombre: 'L1', descripcion: '', direccion: '', latitud: 0, longitud: 0, precioBase: 0, imagenes: [], fechaDisponible: '2025-01-01', horarioApertura: '08:00', horarioCierre: '18:00', costoEntrada: 0, recomendaciones: '', contacto: '' },
      { id: 'B', nombre: 'L2', descripcion: '', direccion: '', latitud: 0, longitud: 0, precioBase: 0, imagenes: [], fechaDisponible: '2025-01-01', horarioApertura: '08:00', horarioCierre: '18:00', costoEntrada: 0, recomendaciones: '', contacto: '' }
    ];

    beforeEach(async () => {
      spyOn(NavbarComponent.prototype, 'ngOnInit').and.callFake(() => {});

      empService.verEmprendimiento.and.returnValue(of(mockDetalle as any));
      lugarService.getLugar.and.returnValue(of(mockLugar as any));
      lugarService.getLugares.and.returnValue(of(mockLugaresList as any));
      serviciosService.listarServicios.and.returnValue(of(allServicios as any));

      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          ReactiveFormsModule,
          NavbarComponent,
          DetprinEmprendimientoComponent,
          RouterTestingModule.withRoutes([]),
          HttpClientTestingModule
        ],
        providers: [
          { provide: EmprendimientoService, useValue: empService },
          { provide: LugaresService,       useValue: lugarService },
          { provide: ServiciosService,     useValue: serviciosService },
          { provide: FormBuilder,          useValue: new FormBuilder() },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: (_key: string) => '123' } } }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DetprinEmprendimientoComponent);
      component = fixture.componentInstance;
      sanitizer = TestBed.inject(DomSanitizer);
      router = TestBed.inject(Router);
    });

    it('loads emprendimiento, lugar, mapUrl, and related services', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.emprendimiento).toEqual(
        jasmine.objectContaining({
          id: '123',
          lugarTuristicoId: '5',
          latitud: 10,
          longitud: 20,
          precioBase: 100
        })
      );
      expect(component.isLoading).toBeFalse();

      expect(lugarService.getLugar).toHaveBeenCalledWith('5');
      expect(component.emprendimiento.lugarTuristico).toEqual(mockLugar);

      const expectedUrl = `https://maps.google.com/maps?q=10,20&z=13&output=embed`;
      const actual = (component.mapUrl as any).changingThisBreaksApplicationSecurity;
      expect(actual).toBe(expectedUrl);

      expect(serviciosService.listarServicios).toHaveBeenCalled();
      expect(component.servicios.length).toBe(1);
      expect(component.servicios[0].id).toBe('s1');
      expect(component.serviciosFiltrados.length).toBe(1);

      expect(component.lugaresTuristicos).toEqual(mockLugaresList);
    }));

    it('handles error from verEmprendimiento', fakeAsync(() => {
      empService.verEmprendimiento.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      tick();

      expect(component.errorMessage).toBe('No se pudo cargar el emprendimiento.');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('dateForm valueChanges -> calculates nights & totalPrice', () => {
    let component: DetprinEmprendimientoComponent;

    beforeEach(() => {
      // Create custom instance, skip ngOnInit entirely
      component = new DetprinEmprendimientoComponent(
        { snapshot: { paramMap: { get: (_: string) => '123' } } } as any,
        {} as any,
        {} as any,
        {} as any,
        new FormBuilder(),
        {} as DomSanitizer,
        {} as Router
      );
      component.emprendimiento = { precioBase: 50 };
      // Do not call fixture.detectChanges(), so ngOnInit won't run
    });

    it('updates nights and totalPrice when valid dates entered', () => {
      component.dateForm.setValue({
        startDate: '2025-01-01',
        endDate: '2025-01-06',
        numeroPersonas: 1
      });
      // No need for fakeAsync/tick: valueChanges fires synchronously
      expect(component['nights']).toBe(5);
      expect(component['totalPrice']).toBe(5 * 50);
    });

    it('clears nights & totalPrice when one date is missing', () => {
      component.dateForm.setValue({
        startDate: '',
        endDate: '',
        numeroPersonas: 1
      });
      expect(component['nights']).toBeNull();
      expect(component['totalPrice']).toBeNull();
    });
  });

  describe('slide navigation', () => {
    let component: DetprinEmprendimientoComponent;

    beforeEach(() => {
      component = new DetprinEmprendimientoComponent(
        { snapshot: { paramMap: { get: (_: string) => '123' } } } as any,
        {} as any,
        {} as any,
        {} as any,
        new FormBuilder(),
        {} as DomSanitizer,
        {} as Router
      );
      component.emprendimiento = { imagenes: ['i1', 'i2', 'i3'] } as any;
      component.currentSlide = 0;
    });

    it('prevSlide cycles to last index when at zero', () => {
      component.currentSlide = 0;
      component.prevSlide();
      expect(component.currentSlide).toBe(2);
    });

    it('nextSlide cycles to zero after last', () => {
      component.currentSlide = 2;
      component.nextSlide();
      expect(component.currentSlide).toBe(0);
    });

    it('prevSlide and nextSlide move correctly within bounds', () => {
      component.currentSlide = 1;
      component.prevSlide();
      expect(component.currentSlide).toBe(0);
      component.nextSlide();
      expect(component.currentSlide).toBe(1);
    });
  });

  describe('utility methods', () => {
    let component: DetprinEmprendimientoComponent;

    beforeEach(() => {
      component = new DetprinEmprendimientoComponent(
        { snapshot: { paramMap: { get: (_: string) => '123' } } } as any,
        {} as any,
        {} as any,
        {} as any,
        new FormBuilder(),
        {} as DomSanitizer,
        {} as Router
      );
    });

    it('isArray returns true for arrays', () => {
      expect(component.isArray([1, 2, 3])).toBeTrue();
    });
    it('isArray returns false for non-arrays', () => {
      expect(component.isArray('not an array')).toBeFalse();
    });

    it('getIterable returns array when passed array, empty otherwise', () => {
      const arr = ['x'];
      expect(component.getIterable(arr)).toEqual(arr);
      expect(component.getIterable(null)).toEqual([]);
    });

    it('getServiciosPorTipo filters by tipoServicioId', () => {
      component.serviciosFiltrados = [
        { id: 'a', tipoServicioId: 1 },
        { id: 'b', tipoServicioId: 2 },
        { id: 'c', tipoServicioId: 1 }
      ] as any[];
      const result = component.getServiciosPorTipo(1);
      expect(result.length).toBe(2);
      expect(result.every(s => s.tipoServicioId === 1)).toBeTrue();
    });
  });

  describe('navigation methods', () => {
    let component: DetprinEmprendimientoComponent;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
      router = jasmine.createSpyObj('Router', ['navigate']);
      component = new DetprinEmprendimientoComponent(
        { snapshot: { paramMap: { get: (_: string) => '123' } } } as any,
        {} as any,
        {} as any,
        {} as any,
        new FormBuilder(),
        {} as DomSanitizer,
        router as any
      );
    });

    it('goToLugarTuristico navigates to correct route', () => {
      component.goToLugarTuristico('42');
      expect(router.navigate).toHaveBeenCalledWith(['/prinlugares', '42']);
    });

    it('goToServicio navigates to correct route', () => {
      const servicioMock = { id: '99' };
      component.goToServicio(servicioMock as any);
      expect(router.navigate).toHaveBeenCalledWith(['/prinservicios/1', '99']);
    });
  });
});
