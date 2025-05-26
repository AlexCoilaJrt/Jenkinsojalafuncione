import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BusquedaGlobalService } from '../../core/services/busqueda-global.service';
import { FormsModule } from '@angular/forms';  // IMPORTANTE para ngModel

@Component({
  selector: 'app-prinemprendimiento',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterModule, FormsModule], // agregar FormsModule
  templateUrl: './prinemprendimiento.component.html',
  styleUrls: ['./prinemprendimiento.component.css']
})
export class PrinemprendimientoComponent implements OnInit {
  emprendimientosOriginal: any[] = [];
  emprendimientosFiltrados: any[] = []; // para filtro local
  emprendimientos: any[] = [];
  isLoading: boolean = false;

  // filtros bind con ngModel
  filtroNombre: string = '';
  filtroLugar: string = '';
  filtroFecha: string = '';

  constructor(
    private emprendimientoService: EmprendimientoService,
    private router: Router,
    private route: ActivatedRoute,
    private busquedaService: BusquedaGlobalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const filtros = {
        nombre: params['nombre'],
        lugar: params['lugar'],
        fechaDesde: params['fechaDesde'],
        tipo: 'emprendimientos'
      };

      if (filtros.nombre || filtros.lugar || filtros.fechaDesde) {
        this.buscarConFiltros(filtros);
      } else {
        this.cargarEmprendimientosOriginales();
      }
    });
  }

  cargarEmprendimientosOriginales() {
    this.isLoading = true;
    this.emprendimientoService.listarEmprendimientos().subscribe((data: any[]) => {
      this.emprendimientosOriginal = data;
      this.emprendimientos = data.map(emp => ({
        ...emp,
        currentImageIndex: 0
      }));

      this.emprendimientosFiltrados = [...this.emprendimientos]; // inicializamos filtrados
      this.isLoading = false;
    });
  }

  buscarConFiltros(filtros: any) {
    this.isLoading = true;
    this.busquedaService.buscarConFiltros(filtros).subscribe((data: any[]) => {
      this.emprendimientos = data.map(emp => ({
        ...emp,
        currentImageIndex: 0
      }));
      this.emprendimientosFiltrados = [...this.emprendimientos]; // para filtrar localmente si quieres
      this.isLoading = false;
    });
  }

  verDetallesEmprendimiento(id: number) {
    this.router.navigate([`/emprendimientodetalle/${id}`]);
  }

  aplicarFiltrosLocal(filtros: { nombre: string; lugar: string; fecha: string }) {
    this.emprendimientos = this.emprendimientosOriginal.filter(emp => {
      const coincideNombre = filtros.nombre
        ? emp.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
        : true;
      const coincideLugar = filtros.lugar
        ? emp.direccion?.toLowerCase().includes(filtros.lugar.toLowerCase())
        : true;
      const coincideFecha = filtros.fecha ? emp.fechaDisponible === filtros.fecha : true;
      return coincideNombre && coincideLugar && coincideFecha;
    });
  }
  
}
