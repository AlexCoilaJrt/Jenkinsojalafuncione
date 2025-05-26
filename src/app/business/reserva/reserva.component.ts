import { Component, DoCheck, OnInit } from '@angular/core';
import { ReservasService } from '../../core/services/reservas.service'; // Cambié el servicio de servicios a reservas
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../sidebar/navbar/navbar.component';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css']
})
export class ReservaComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'codigoReserva';
  isLoading = true;
  reservas: any[] = [];
  reservasFiltradas: any[] = [];

  constructor(
    private router: Router,
    private reservasService: ReservasService // Cambio el servicio de Servicios a Reservas
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservasService.listarReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.isLoading = false;
        this.reservasFiltradas = [...this.reservas];
        console.log('Reservas cargadas:', data);
      },
      error: (err) => {
        console.error('Error al obtener reservas:', err);
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.reservasFiltradas = this.reservas.filter((r) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'codigoReserva':
          return r.codigoReserva?.toLowerCase().includes(texto);
        case 'estado':
          return r.estado?.toLowerCase().includes(texto);
        case 'tipoReserva':
          return r.tipoReserva?.toLowerCase().includes(texto);
        case 'fechaReserva':
          return r.fechaReserva?.toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/editreserva/${id}`]);
  }

  eliminar(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.eliminarReserva(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'La reserva ha sido eliminada correctamente.'
            });
            this.cargarReservas();
          },
          error: (error) => {
            console.error('Error al eliminar reserva:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la reserva.'
            });
          }
        });
      }
    });
  }
}
