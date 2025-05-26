import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { EmprendimientoService } from './emprendimiento.service';
import { LugaresService } from './lugar.service';
import { Router } from '@angular/router';
import { ServiciosService } from './servicios.service';

export interface FiltrosBusqueda {
  nombre?: string;
  lugar?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: 'emprendimientos' | 'lugares' | 'servicios' | 'paquetes' | 'alojamiento' | 'transporte' | 'restaurante' | 'experiencia';
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaGlobalService {
  private resultados: any[] = [];
  private filtros$ = new BehaviorSubject<FiltrosBusqueda>({});

  constructor(
    private emprendimientoService: EmprendimientoService,
    private lugarService: LugaresService,
    private serviciosService: ServiciosService,
    private router: Router
  ) {}

  setFiltros(f: FiltrosBusqueda): void {
    this.filtros$.next(f);
  }

  getFiltros(): Observable<FiltrosBusqueda> {
    return this.filtros$.asObservable();
  }
  getResultados(): any[] {
    return this.resultados;
  }

  /**
   * Filtrado local de datos, según el tipo (emprendimientos, lugares, etc.)
   */
  buscarConFiltros(filtros: FiltrosBusqueda): Observable<any[]> {
    switch (filtros.tipo) {
      case 'emprendimientos':
        return this.emprendimientoService.listarEmprendimientos().pipe(
          switchMap((data: any[]) => {
            const filtrados = data.filter(emp => {
              const coincideNombre = filtros.nombre ? emp.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase()) : true;
              const coincideLugar = filtros.lugar ? emp.direccion?.toLowerCase().includes(filtros.lugar.toLowerCase()) : true;
              const coincideFecha = filtros.fechaDesde ? emp.fechaDisponible === filtros.fechaDesde : true; // Ajusta lógica si usas rango
              return coincideNombre && coincideLugar && coincideFecha;
            });
            return of(filtrados);
          })
        );

      case 'lugares':
        return this.lugarService.listarLugares().pipe(
          switchMap((data: any[]) => {
            const filtrados = data.filter(lugar => {
              const coincideNombre = filtros.nombre ? lugar.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase()) : true;
              const coincideLugar = filtros.lugar ? lugar.ubicacion?.toLowerCase().includes(filtros.lugar.toLowerCase()) : true;
              return coincideNombre && coincideLugar;
            });
            return of(filtrados);
          })
        );
        case 'servicios':
          return this.serviciosService.listarServicios().pipe(
            switchMap((data: any[]) => {
              const filtrados = data.filter(servicio => {
                const coincideNombre = filtros.nombre ? servicio.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase()) : true;
                const coincideLugar = filtros.lugar ? servicio.ubicacion?.toLowerCase().includes(filtros.lugar.toLowerCase()) : true;
                const coincideFecha = filtros.fechaDesde ? servicio.fechaDisponible === filtros.fechaDesde : true;
                return coincideNombre && coincideLugar && coincideFecha;
              });
              return of(filtrados);
            })
          );
      // Puedes agregar más tipos aquí (servicios, paquetes, etc.)

      default:
        return of([]);
    }
  }
}
