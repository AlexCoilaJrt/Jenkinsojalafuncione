import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from '../sidebar/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { PaqueteTuristicoService } from '../../core/services/paquetes-turisticos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paquete-turistico',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, RouterModule,FormsModule],
  templateUrl: './paquete-turistico.component.html',
  styleUrl: './paquete-turistico.component.css'
})
export class PaqueteTuristicoComponent {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'nombre';
  isLoading = true;
  paquetes: any[] = [];
  paquetesFiltrados: any[] = [];

  constructor(
    private router: Router, 
    private paqueteTuristicoService: PaqueteTuristicoService
  ) {}

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.paqueteTuristicoService.listarPaquetesTuristicos().subscribe({
      next: (data) => {
        this.paquetes = data;
        this.isLoading = false;
        this.paquetesFiltrados = [...this.paquetes];
        console.log('Paquetes turísticos cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener paquetes turísticos:', err);
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.paquetesFiltrados = this.paquetes.filter((p) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'nombre':
          return p.nombre?.toLowerCase().includes(texto);
        case 'descripcion':
          return p.descripcion?.toLowerCase().includes(texto);
        case 'precio':
          return p.precio?.toString().includes(texto);
        case 'estado':
          return p.estado?.toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/editpaqueteturistico/${id}`]);
  }

  eliminar(id: number): void {
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
        this.paqueteTuristicoService.eliminarPaqueteTuristico(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El paquete turístico ha sido eliminado correctamente.'
            });
            this.cargarPaquetes();
          },
          error: (error) => {
            console.error('Error al eliminar paquete:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el paquete turístico.'
            });
          }
        });
      }
    });
  }
}
