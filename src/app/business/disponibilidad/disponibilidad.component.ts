import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [ SidebarComponent,CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './disponibilidad.component.html',
  styleUrls: ['./disponibilidad.component.css']
})
export class DisponibilidadComponent implements OnInit {
  disponibilidadForm: FormGroup;
  disponibilidades: any[] = [];
  disponibilidadData: any = {};  // Para mostrar detalles de una disponibilidad específica
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private disponibilidadService: DisponibilidadService,
    private fb: FormBuilder
  ) {
    this.disponibilidadForm = this.fb.group({
      servicioId: [null, Validators.required],
      fecha: ['', Validators.required],
      cuposDisponibles: [null, [Validators.required, Validators.min(1)]],
      precioEspecial: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const servicioId = 1; // Asigna el id de servicio que necesitas
    this.obtenerDisponibilidad(servicioId); // Obtiene los detalles de una disponibilidad
    this.obtenerDisponibilidades(servicioId); // Obtiene la lista de disponibilidades
    
  }

  // Obtener todas las disponibilidades
  obtenerDisponibilidades(servicioId: number): void {
    this.isLoading = true;
    this.disponibilidadService.getDisponibilidad(servicioId).subscribe(
      (data) => {
        this.disponibilidades = data;  // Almacena la lista de disponibilidades
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener disponibilidades:', error);
        this.isLoading = false;
      }
    );
  }

  // Obtener disponibilidad por servicio
  obtenerDisponibilidad(servicioId: number): void {
    this.isLoading = true;
    this.disponibilidadService.getDisponibilidad(servicioId).subscribe(
      (data) => {
        this.disponibilidadData = data; // Almacena los datos de disponibilidad
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener disponibilidad:', error);
        this.isLoading = false;
      }
    );
  }
  editar(id: number): void {
    console.log('Editar disponibilidad con ID:', id);
    // Aquí puedes implementar lógica para editar, por ejemplo, cargar los datos al formulario
  }
  
  eliminar(id: number): void {
    console.log('Eliminar disponibilidad con ID:', id);
    this.disponibilidadService.eliminarDisponibilidad(id).subscribe({
      next: () => {
        this.obtenerDisponibilidades(1); // Actualiza la lista
      },
      error: (error) => {
        console.error('Error al eliminar disponibilidad:', error);
      }
    });
  }
  

  // Enviar el formulario para crear una nueva disponibilidad
  onSubmit(): void {
    if (this.disponibilidadForm.invalid) {
      return;
    }

    const nuevaDisponibilidad = this.disponibilidadForm.value;

    this.isLoading = true;
    this.disponibilidadService.createDisponibilidad(nuevaDisponibilidad).subscribe(
      (response) => {
        this.isLoading = false;
        this.obtenerDisponibilidades(nuevaDisponibilidad.servicioId); // Actualiza la lista
        this.disponibilidadForm.reset(); // Resetea el formulario
      },
      (error) => {
        console.error('Error al crear disponibilidad:', error);
        this.isLoading = false;
      }
    );
  }
}
