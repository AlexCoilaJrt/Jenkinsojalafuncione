import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NavbarComponent } from '../../sidebar/navbar/navbar.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ReservasService } from '../../../core/services/reservas.service'; // Cambio el servicio a Reservas
import { SupabaseService } from '../../../core/services/supabase.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { AuthService } from '../../../core/services/auth.service';
declare let L: any;

@Component({
  selector: 'app-form-reservas',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './form-reserva.component.html',  // Asegúrate de tener este archivo de plantilla
  styleUrls: ['./form-reserva.component.css']   // Asegúrate de tener este archivo de estilos
})
export class FormReservaComponent implements OnInit {

  reservaForm!: FormGroup;
  isEdit = false;
  reservaIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private authService: AuthService, // Inyección del servicio de autenticación
    private route: ActivatedRoute,
    private router: Router,
    private emprendimientoService: EmprendimientoService
  ) { }

  ngOnInit(): void {
    // Obtener usuario logueado
    const usuarioId = this.authService.getUsuarioId();

    this.reservaForm = this.fb.group({
      tipoReserva: ['tiporeserva', Validators.required],
      usuarioId: [usuarioId, Validators.required],
      fechaReserva: [new Date().toISOString().split('T')[0]], // <-- Fecha actual en formato YYYY-MM-DD
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      cantidadPersonas: [0, Validators.required],
      precioTotal: [0, Validators.required],
      moneda: ['', Validators.required],
      metodoPago: ['efectivo'], // <-- Valor por defecto "efectivo", sin validadores
      estado: ['pendiente', Validators.required],
      notas: [''],
      motivoCancelacion: [''],
      fechaCancelacion: [''], // <-- Quitar Validators.required si no es obligatorio
    });


    // Si estamos en modo edición, cargar la reserva
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.reservaIdEdit = +id;
      this.reservasService.obtenerReserva(this.reservaIdEdit)
        .subscribe({
          next: (res) => {
            this.reservaForm.patchValue({
              tipoReserva: res.tipoReserva, // Asignar tipoReserva
              usuarioId: res.usuarioId, // Asignar usuarioId si está presente
              fechaReserva: res.fechaReserva,
              fechaInicio: res.fechaInicio,
              fechaFin: res.fechaFin,
              cantidadPersonas: res.cantidadPersonas,
              precioTotal: res.precioTotal,
              moneda: res.moneda,
              metodoPago: res.metodoPago,
              estado: res.estado,
              notas: res.notas,
              motivoCancelacion: res.motivoCancelacion,
              fechaCancelacion: res.fechaCancelacion,
            });
          },
          error: () => Swal.fire('Error', 'No se pudo cargar la reserva', 'error')
        });
    }
  }

  async guardarReserva(): Promise<void> {
    if (this.reservaForm.invalid) {
      const inv = Object.keys(this.reservaForm.controls)
        .filter(k => this.reservaForm.get(k)?.invalid);
      Swal.fire('Error', 'Completa: ' + inv.join(', '), 'error');
      return;
    }

    const fv = this.reservaForm.getRawValue();
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading(), allowOutsideClick: false, showConfirmButton: false });

    const payload = {
      tipoReserva: fv.tipoReserva, // Se guarda el tipoReserva
      usuarioId: fv.usuarioId, // Se guarda el usuarioId
      fechaReserva: fv.fechaReserva,
      fechaInicio: fv.fechaInicio,
      fechaFin: fv.fechaFin,
      cantidadPersonas: fv.cantidadPersonas,
      precioTotal: fv.precioTotal,
      moneda: fv.moneda,
      metodoPago: fv.metodoPago,
      estado: fv.estado,
      notas: fv.notas,
      motivoCancelacion: fv.motivoCancelacion,
      fechaCancelacion: fv.fechaCancelacion,
    };

    const obs$ = this.isEdit && this.reservaIdEdit
      ? this.reservasService.actualizarReserva(this.reservaIdEdit, payload)
      : this.reservasService.crearReserva(payload);

    obs$.subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Éxito', 'Reserva guardada', 'success');
        this.router.navigate(['/reserva']);
      },
      error: (e) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo guardar', 'error');
        console.error(e);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/reservas']);
  }
}
