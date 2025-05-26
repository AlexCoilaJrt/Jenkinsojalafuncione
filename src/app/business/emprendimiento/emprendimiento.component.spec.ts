import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmprendimientoComponent } from './emprendimiento.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { delay, of, Subject } from 'rxjs';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { LugaresService } from '../../core/services/lugar.service';
import { BusquedaGlobalService } from '../../core/services/busqueda-global.service';
import { AuthService } from '../../core/services/auth.service';

// Stubs de los hijos
@Component({ 
  selector: 'app-sidebar', 
  template: '',
  standalone: true // Agregar standalone si es necesario
})
class MockSidebarComponent {}

@Component({ 
  selector: 'app-navbar', 
  template: '',
  standalone: true // Agregar standalone si es necesario
})
class MockNavbarComponent {}

// Spies de servicios
const emprendimientoSpy = jasmine.createSpyObj('EmprendimientoService', [
  'listarEmprendimientos',
  'listarEmprendimientosa',
  'buscarConFiltros',
  'eliminarEmprendimiento'
]);
const lugarSpy = jasmine.createSpyObj('LugaresService', ['listarLugares']);
const filtros$ = new Subject<any>();
const busquedaSpy = jasmine.createSpyObj('BusquedaGlobalService', ['getFiltros']);

// AuthService stub completo
const authStub = {
  getUsuarioRol: () => 'ROLE_USER',
  getUsuarios: () => of([]),
  // Agregar otros métodos que pueda necesitar
};

describe('EmprendimientoComponent', () => {
  let component: EmprendimientoComponent;
  let fixture: ComponentFixture<EmprendimientoComponent>;

  beforeEach(async () => {
    // Configura retornos
    emprendimientoSpy.listarEmprendimientos.and.returnValue(of([]));
    emprendimientoSpy.listarEmprendimientosa.and.returnValue(of([]));
    emprendimientoSpy.buscarConFiltros.and.returnValue(of([]));
    emprendimientoSpy.eliminarEmprendimiento.and.returnValue(of(void 0));
    lugarSpy.listarLugares.and.returnValue(of([]));
    busquedaSpy.getFiltros.and.returnValue(filtros$.asObservable());

    await TestBed.configureTestingModule({
      // CAMBIO PRINCIPAL: Usar imports en lugar de declarations para componentes standalone
      imports: [
        EmprendimientoComponent, // Componente standalone va en imports
        CommonModule,
        RouterTestingModule,
        MockSidebarComponent,    // Si son standalone
        MockNavbarComponent      // Si son standalone
      ],
      declarations: [
        // Solo si los mocks NO son standalone
        // MockSidebarComponent,
        // MockNavbarComponent
      ],
      providers: [
        { provide: EmprendimientoService, useValue: emprendimientoSpy },
        { provide: LugaresService, useValue: lugarSpy },
        { provide: BusquedaGlobalService, useValue: busquedaSpy },
        { provide: AuthService, useValue: authStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmprendimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit debe llamar a servicios de lista y filtros', () => {
    expect(emprendimientoSpy.listarEmprendimientos).toHaveBeenCalled();
    expect(busquedaSpy.getFiltros).toHaveBeenCalled();
    expect(lugarSpy.listarLugares).toHaveBeenCalled();
  });

  it('cargarEmprendimientos con delay', fakeAsync(() => {
    emprendimientoSpy.listarEmprendimientosa.and.returnValue(
      of([{ id: 1, lugarTuristicoId: 100 }]).pipe(delay(100)) // Si hay delay
    );
    component.lugaresMap = { 100: 'Lugar100' };
    component.isLoading = false;
  
    component.cargarEmprendimientos();
    expect(component.isLoading).toBeTrue();
  
    tick(100); // Esperar el delay
    expect(component.isLoading).toBeFalse();
  }));
});