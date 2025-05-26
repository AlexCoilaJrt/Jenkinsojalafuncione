import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LugaresService } from '../../core/services/lugar.service';
import { ResenaService } from '../../core/services/resenas.service';
import { forkJoin } from 'rxjs';
import { BusquedaGlobalService } from '../../core/services/busqueda-global.service';

@Component({
  selector: 'app-prinlugares',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './prinlugares.component.html',
  styleUrls: ['./prinlugares.component.css']
})
export class PrinlugaresComponent implements OnInit {
  lugaresOriginal: any[] = [];       // Datos originales sin filtrar
  lugares: any[] = [];               // Datos para operaciones (puede ser igual que originales al inicio)
  lugaresFiltrados: any[] = [];     // Datos filtrados que se muestran en el template
  isLoading: boolean = false;

  filtroNombre: string = '';
  filtroLugar: string = '';
  filtroFecha: string = '';

  constructor(
    private lugaresService: LugaresService,
    private resenaService: ResenaService,
    private busquedaService: BusquedaGlobalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filtroNombre = params['nombre'] || '';
      this.filtroLugar = params['lugar'] || '';
      this.filtroFecha = params['fechaDesde'] || '';

      const filtros = {
        nombre: this.filtroNombre,
        lugar: this.filtroLugar,
        fechaDesde: this.filtroFecha,
        tipo: 'lugaresturisticos'
      };

      if (this.filtroNombre || this.filtroLugar || this.filtroFecha) {
        this.buscarConFiltros(filtros);
      } else {
        this.cargarLugaresOriginales();
      }
    });
  }

  cargarLugaresOriginales(): void {
    this.isLoading = true;
    this.lugaresService.listarLugares().subscribe((res: any[]) => {
      this.lugaresOriginal = res;
      this.lugares = [...res];

      // Cargar reseñas y promedios en paralelo para cada lugar
      const observables = this.lugares.map(lugar =>
        forkJoin({
          promedio: this.resenaService.obtenerPromedioDeCalificacion(lugar.id),
          resenas: this.resenaService.obtenerReseñas()
        })
      );

      forkJoin(observables).subscribe(results => {
        results.forEach((result, i) => {
          this.lugares[i].promedioCalificacion = result.promedio.promedioCalificacion;
          this.lugares[i].totalResenas = result.promedio.totalResenas;
          this.lugares[i].reseñas = result.resenas.filter((r: any) => r.lugarId === this.lugares[i].id);
        });

        this.lugaresFiltrados = [...this.lugares];
        this.aplicarFiltrosLocal({
          nombre: this.filtroNombre,
          lugar: this.filtroLugar,
          fecha: this.filtroFecha
        });

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      });
    });
  }

  buscarConFiltros(filtros: any): void {
    this.isLoading = true;
    this.busquedaService.buscarConFiltros(filtros).subscribe((data: any[]) => {
      this.lugaresOriginal = data;
      this.lugares = [...data];

      const observables = this.lugares.map(lugar =>
        forkJoin({
          promedio: this.resenaService.obtenerPromedioDeCalificacion(lugar.id),
          resenas: this.resenaService.obtenerReseñas()
        })
      );

      forkJoin(observables).subscribe(results => {
        results.forEach((result, i) => {
          this.lugares[i].promedioCalificacion = result.promedio.promedioCalificacion;
          this.lugares[i].totalResenas = result.promedio.totalResenas;
          this.lugares[i].reseñas = result.resenas.filter((r: any) => r.lugarId === this.lugares[i].id);
        });

        this.lugaresFiltrados = [...this.lugares];
        this.aplicarFiltrosLocal({
          nombre: this.filtroNombre,
          lugar: this.filtroLugar,
          fecha: this.filtroFecha
        });

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      });
    });
  }

  aplicarFiltrosLocal(filtros: { nombre?: string; lugar?: string; fecha?: string }): void {
    this.lugaresFiltrados = this.lugaresOriginal.filter(lugar => {
      const coincideNombre = filtros.nombre
        ? lugar.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
        : true;
      const coincideLugar = filtros.lugar
        ? lugar.direccion?.toLowerCase().includes(filtros.lugar.toLowerCase())
        : true;
      const coincideFecha = filtros.fecha
        ? lugar.fecha === filtros.fecha
        : true;

      return coincideNombre && coincideLugar && coincideFecha;
    });
  }

  verDetallesLugar(id: number): void {
    this.router.navigate([`lugardetalle/${id}`]);
  }
}
