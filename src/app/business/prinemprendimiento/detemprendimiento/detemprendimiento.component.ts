import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { NavbarComponent } from '../../navbar/navbar.component';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { LugaresService } from '../../../core/services/lugar.service';
import { ServiciosService } from '../../../core/services/servicios.service'; // <-- Importa el servicio que maneja los servicios

@Component({
  selector: 'app-detprin-emprendimiento',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './detemprendimiento.component.html',
  styleUrls: ['./detemprendimiento.component.css']
})
export class DetprinEmprendimientoComponent implements OnInit {
  mapUrl!: SafeResourceUrl;
  emprendimiento: any = {};
  lugaresTuristicos: any[] = [];
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  isLoading = true;
  errorMessage = '';
  dateForm: FormGroup;
  nights: number | null = null;
  totalPrice: number | null = null;
  currentSlide = 0;

  constructor(
    private route: ActivatedRoute,
    private empService: EmprendimientoService,
    private lugarService: LugaresService,
    private serviciosService: ServiciosService,  // <-- Inyecta el servicio de servicios
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      numeroPersonas: [1]
    });

    this.dateForm.valueChanges.subscribe(values => {
      this.calculateNights(values.startDate, values.endDate);
    });
  }

  ngOnInit(): void {
    initFlowbite();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de emprendimiento no proporcionado';
      this.isLoading = false;
      return;
    }

    // 1) Traemos el detalle del emprendimiento
    this.empService.verEmprendimiento(id).subscribe({
      next: detalle => {
        this.emprendimiento = detalle;
        this.isLoading = false;

        // Cargar lugar turístico relacionado
        if (detalle.lugarTuristicoId) {
          this.lugarService.getLugar(detalle.lugarTuristicoId).subscribe({
            next: lugar => {
              this.emprendimiento.lugarTuristico = lugar;
            },
            error: err => console.error('Error cargando lugar turístico', err)
          });
        }

        // Construimos el mapa si tiene coordenadas
        if (detalle.latitud && detalle.longitud) {
          this.buildMapUrl(detalle.latitud, detalle.longitud);
        }

        // Cargar servicios relacionados al emprendimiento
        this.cargarServiciosRelacionados(detalle.id);
      },
      error: err => {
        console.error('Error cargando emprendimiento:', err);
        this.errorMessage = 'No se pudo cargar el emprendimiento.';
        this.isLoading = false;
      }
    });
    

    // 2) Traemos TODOS los lugares turísticos
    this.lugarService.getLugares().subscribe({
      next: lugares => {
        this.lugaresTuristicos = lugares;
      },
      error: err => {
        console.error('Error al cargar todos los lugares turísticos', err);
      }
    });
  }

  private cargarServiciosRelacionados(emprendimientoId: string) {
    this.serviciosService.listarServicios().subscribe({
      next: servicios => {
        // Filtrar servicios que pertenezcan al emprendimiento actual
        this.servicios = servicios.filter((servicio: any) =>
          servicio.serviciosEmprendedores?.some((emp: any) =>
            emp.emprendimientoId === emprendimientoId
          )
        );
        this.serviciosFiltrados = [...this.servicios];
      },
      error: err => {
        console.error('Error al cargar servicios:', err);
        Swal.fire('Error', 'No se pudieron cargar los servicios relacionados', 'error');
      }
    });
  }

  private calculateNights(startDate: string, endDate: string): void {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      this.nights = diff / (1000 * 3600 * 24);
      if (this.nights !== null && this.emprendimiento.precioBase) {
        this.totalPrice = this.nights * this.emprendimiento.precioBase;
      }
    } else {
      this.nights = null;
      this.totalPrice = null;
    }
  }

  prevSlide(): void {
    const len = this.emprendimiento.imagenes?.length || 0;
    this.currentSlide = len
      ? (this.currentSlide - 1 + len) % len
      : 0;
  }

  nextSlide(): void {
    const len = this.emprendimiento.imagenes?.length || 0;
    this.currentSlide = len
      ? (this.currentSlide + 1) % len
      : 0;
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  goToLugarTuristico(id: string): void {
    this.router.navigate(['/prinlugares', id]);
  }
  goToServicio(servicio: any): void {
    this.router.navigate(['/prinservicios/1', servicio.id]);
  }


  getIterable(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }
  getServiciosPorTipo(tipoId: number) {
    return this.serviciosFiltrados.filter(s => s.tipoServicioId === tipoId);
  }

  private buildMapUrl(lat: number, lng: number): void {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}