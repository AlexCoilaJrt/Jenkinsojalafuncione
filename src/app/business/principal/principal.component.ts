import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { SlidersService } from '../../core/services/sliders.service';

import { initFlowbite } from 'flowbite';
import { register } from 'swiper/element/bundle';
import { ServiciosService } from '../../core/services/servicios.service';
import { PaqueteTuristicoService } from '../../core/services/paquetes-turisticos.service';
import { ResenaService } from '../../core/services/resenas.service';
import Swal from 'sweetalert2';

// Registrar componentes personalizados de Swiper (solo si los usas en HTML)
register();

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit {
  sliders: any[] = [];
  paquetesTuristicos: any[] = []; // Aquí almacenamos la lista de paquetes turísticos
  isLoading: boolean = false;
  serviciosAlojamiento: any[] = [];  // Variable para almacenar los servicios de alojamiento
  serviciosExperiencia: any[] = [];
  tipoServicioId: string = '';

  constructor(
    private slidersService: SlidersService,
    private servicioService: ServiciosService,
    private paqueteTuristicoService: PaqueteTuristicoService,
    private resenaService: ResenaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSliders();
    this.obtenerServiciosConReseñas();
    this.obtenerServiciosPorTipoExperiencia();
    this.obtenerPaquetesTuristicos();
  }


  cargarSliders(): void {
    this.slidersService.listarSliders().subscribe({
      next: (res) => {
        this.sliders = res.data ?? res;
  
        // Esperar a que Angular renderice los elementos del DOM
        setTimeout(() => {
          initFlowbite(); // Inicializa carrusel correctamente
        }, 0);
      },
      error: (err) => {
        console.error('Error al cargar sliders:', err);
      }
    });
  }
  obtenerServiciosConReseñas(): void {
    this.tipoServicioId = '3';
    this.isLoading = true; // Indicamos que estamos cargando los datos
    this.servicioService.listarServiciosPorTipo(this.tipoServicioId).subscribe((res: any) => {
      this.serviciosAlojamiento = res;

      // Para cada servicio, obtenemos el promedio de calificación y las reseñas
      this.serviciosAlojamiento.forEach(servicio => {
        // Obtener el promedio de calificación
        this.resenaService.obtenerPromedioDeCalificacion(servicio.id).subscribe((promedio: any) => {
          servicio.promedioCalificacion = promedio.promedioCalificacion; // Asignamos el promedio
          servicio.totalResenas = promedio.totalResenas; // Asignamos el total de reseñas
        });

        // Obtener las reseñas
        this.resenaService.obtenerReseñas().subscribe((reseñas: any) => {
          servicio.reseñas = reseñas.filter((resena: any) => resena.servicioId === servicio.id);
        });
      });

      this.isLoading = false; // Terminamos de cargar los datos
    });
  }
  
  obtenerServiciosPorTipoExperiencia(): void {
    this.tipoServicioId = '8';
    this.servicioService.listarServiciosPorTipo(this.tipoServicioId).subscribe(
      (res: any) => {
        console.log('Servicios por tipo Experiencia:', res);
        if (res) {
          this.serviciosExperiencia = res;  // Guarda los servicios de experiencia obtenidos
        } else {
          console.error('Error al obtener los servicios de Experiencia', res);
        }
      },
      error => {
        console.error('Error en la solicitud de servicios por tipo Experiencia', error);
      }
    );
  }
  obtenerPaquetesTuristicos(): void {
    this.isLoading = true; // Indicamos que la solicitud está en proceso
    this.paqueteTuristicoService.listarPaquetesTuristicos().subscribe(
      (res: any) => {
        this.paquetesTuristicos = res; // Guardamos la respuesta en la variable
        console.log('Paquetes turísticos obtenidos:', res);
      },
      (error) => {
        console.error('Error al obtener paquetes turísticos:', error);
      },
      () => {
        this.isLoading = false; // Indicamos que la solicitud ha finalizado
      }
    );
  }

  verDetallesPaquete(id: number): void {
    this.router.navigate([`/paquetesdetalle/${id}`]); 
  }
    verDetallesServicios(id: number): void {
    this.router.navigate([`/serviciosdetalle/${id}`]); 
  }

}
