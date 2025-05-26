import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { ItinerarioService } from '../../core/services/itinerario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-misreservas',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './misreservas.component.html',
  styleUrl: './misreservas.component.css'
})
export class MisreservasComponent implements OnInit {
  expandedIndex: number | null = null;
  reservas: any[] = [];
  filtroEstado: string = 'todas';
reservasFiltradas: any[] = [];

  constructor(
    private reservaService: ReservasService,
    private authService: AuthService,
    private itinerarioService:ItinerarioService
  ) { }
  ngOnInit(): void {
    const usuarioId = this.authService.getUsuarioId();
    this.cargarReservasFiltradas(usuarioId);
    initFlowbite();
  }
  cargarReservasFiltradas(usuarioId: number): void {
    this.reservaService.listarReservas().subscribe({
      next: (res: any[]) => {
        const reservas = res.filter(r => r.usuarioId === usuarioId);
        this.asociarItinerariosAReservas(reservas);
        console.log('Resersadasdasdvas del usuario:', this.reservas);
      },
      error: (err) => {
        console.error('Error al obtener reservas:', err);
      }
    });
  }    
asociarItinerariosAReservas(reservas: any[]): void {
  this.itinerarioService.listarItinerarios().subscribe({
    next: (todosItinerarios: any[]) => {
      // Agregar itinerarios filtrados a cada reserva
      this.reservas = reservas.map(reserva => {
        const itinerariosDeReserva = todosItinerarios.filter(it => it.reservaId === reserva.id);
        return { ...reserva, itinerarios: itinerariosDeReserva };
      });

      console.log('Reservas con itinerarios:', this.reservas);
    },
    error: (err) => {
      console.error('Error al obtener itinerarios:', err);
    }
  });
}
pagarReserva(id: number): void {
  Swal.fire({
    title: 'Complete el pago',
    html: `
      <img src="img/qr.png" alt="Pago" class="w-24 mx-auto mb-4" />
      <input type="file" id="voucherInput" accept="image/*" class="swal2-input" />
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar comprobante',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const fileInput = document.getElementById('voucherInput') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) {
        Swal.showValidationMessage('Debes seleccionar una imagen');
        return false;
      }
      return file;
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      const file = result.value as File;
      console.log('Archivo seleccionado:', file);

      // Simulación de subida del comprobante. Aquí podrías usar Supabase o una API tuya.
      const formData = new FormData();
      formData.append('voucher', file);
      formData.append('reservaId', id.toString());

      // Supongamos que solo actualizas el estado por ahora
      this.reservaService.actualizarReserva(id, { estado: 'confirmada' }).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Comprobante enviado',
            text: 'Tu comprobante fue recibido correctamente. Estado actualizado a confirmado.',
            confirmButtonText: 'Aceptar'
          });

          // Opcional: recargar la lista de reservas
          const usuarioId = this.authService.getUsuarioId();
          this.cargarReservasFiltradas(usuarioId);
        },
        error: (err) => {
          console.error('Error al actualizar estado de reserva:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo confirmar la reserva. Intenta nuevamente.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  });
}


cancelarReserva(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas cancelar esta reserva?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, mantener',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      const data = { estado: 'cancelada' };
      this.reservaService.actualizarReserva(id, data).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Reserva cancelada',
            text: 'La reserva fue cancelada correctamente.',
            confirmButtonText: 'Aceptar'
          });
          // Opcional: recargar lista de reservas
          const usuarioId = this.authService.getUsuarioId();
          this.cargarReservasFiltradas(usuarioId);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cancelar la reserva.',
            confirmButtonText: 'Aceptar'
          });
          console.error('Error al cancelar reserva:', err);
        }
      });
    }
  });
}


  toggleDetalle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
