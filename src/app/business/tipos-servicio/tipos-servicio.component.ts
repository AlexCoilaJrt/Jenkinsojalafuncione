import { Component, OnInit, DoCheck } from '@angular/core';
import { SidebarComponent } from "../../business/sidebar/sidebar.component";
import { NavbarComponent } from "../../business/sidebar/navbar/navbar.component";
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiposServicioService } from '../../core/services/tipos-servicios.service';

@Component({
  selector: 'app-tipos-servicio',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './tipos-servicio.component.html',
  styleUrl: './tipos-servicio.component.css'
})
export class TiposServicioComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'nombre';
  isLoading = true;
  tiposServicio: any[] = [];
  tiposServicioFiltrados: any[] = [];

  constructor(private router: Router, private tiposServicioService: TiposServicioService) {}

  ngOnInit(): void {
    this.cargarTiposServicio();
  }

  cargarTiposServicio(): void {
    this.tiposServicioService.listarTiposServicio().subscribe({
      next: (data) => {
        this.tiposServicio = data;
        this.isLoading = false;
        this.tiposServicioFiltrados = [...this.tiposServicio];
        console.log('Tipos de servicio cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener tipos de servicio:', err);
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.tiposServicioFiltrados = this.tiposServicio.filter((t) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'nombre':
          return t.nombre?.toLowerCase().includes(texto);
        case 'descripcion':
          return t.descripcion?.toLowerCase().includes(texto);
        case 'requiereCupo':
          return t.requiereCupo.toString().toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/edittiposervicio/${id}`]);
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
        this.tiposServicioService.eliminarTipoServicio(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El tipo de servicio ha sido eliminado correctamente.'
            });
            this.cargarTiposServicio();
          },
          error: (error) => {
            console.error('Error al eliminar tipo de servicio:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el tipo de servicio.'
            });
          }
        });
      }
    });
  }
}
