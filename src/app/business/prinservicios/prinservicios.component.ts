import { Component, OnInit } from '@angular/core';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { NavbarComponent } from "../navbar/navbar.component";
import {ActivatedRoute, Router } from '@angular/router';
import { ServiciosService } from '../../core/services/servicios.service';
import { ResenaService } from '../../core/services/resenas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prinservicios',
  standalone: true,
  imports: [NavbarComponent,CommonModule],
  templateUrl: './prinservicios.component.html',
  styleUrl: './prinservicios.component.css'
})

export class PrinserviciosComponent implements OnInit{
  isLoading: boolean = false;
  servicios: any[] = [];
  tipoServicioId: string = "";

  constructor(
    private servicioService: ServiciosService,
    private resenaService: ResenaService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.obtenerServiciosConReseñas();
    
  }
  obtenerServiciosConReseñas(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log("Tipo de Servicio ID:", id);
    this.tipoServicioId = id ? String(id) : '';
    this.isLoading = true; // Indicamos que estamos cargando los datos
    this.servicioService.listarServiciosPorTipo(this.tipoServicioId).subscribe((res: any) => {
      this.servicios = res;
      this.servicios.forEach(servicio => {
        this.resenaService.obtenerPromedioDeCalificacion(servicio.id).subscribe((promedio: any) => {
          servicio.promedioCalificacion = promedio.promedioCalificacion;
          servicio.totalResenas = promedio.totalResenas;
        });
        this.resenaService.obtenerReseñas().subscribe((reseñas: any) => {
          servicio.reseñas = reseñas.filter((resena: any) => resena.servicioId === servicio.id);
        });
      });

      this.isLoading = false;
    });
  }
  verDetallesServicios(id: number): void {
    this.router.navigate([`/serviciosdetalle/${id}`]); 
  }
}
