import { Component, DoCheck, OnInit } from '@angular/core';
import { ServiciosService } from '../../core/services/servicios.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../sidebar/navbar/navbar.component';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';

@Component({
  selector: 'app-servicio',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServicioComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'nombre'; // Predeterminado a 'nombre'
  isLoading = true;
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  roles: string[] = [];
  constructor(
    private router: Router,
    private serviciosService: ServiciosService,
    private authService: AuthService,
    private emprendimientoService: EmprendimientoService
  ) { }

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    const usuarioId = this.authService.getUsuarioId();  // Obtener el ID del usuario logueado
    this.roles = this.authService.getUsuarioRol();  // Obtener los roles del usuario

    // Si el rol es SuperAdmin, no se aplica ningún filtro
    if (this.roles.includes('SuperAdmin')) {
      this.serviciosService.listarServicios().subscribe({
        next: (servicios) => {
          this.servicios = servicios;  // Cargar todos los servicios
          this.isLoading = false;
          this.serviciosFiltrados = [...this.servicios];
          console.log('Servicios cargados para SuperAdmin:', this.servicios);
        },
        error: (err) => {
          console.error('Error al obtener servicios:', err);
        }
      });
    } else if (this.roles.includes('Emprendedor')) {
      // Si el rol es Emprendedor, se filtran los servicios asociados al usuario
      this.emprendimientoService.listarEmprendimientosPorUsuario(usuarioId).subscribe({
        next: (emprendimientos) => {
          const emprendimientoIds = emprendimientos.map((e: any) => e.id);  // Obtener los IDs de los emprendimientos del usuario
          this.serviciosService.listarServicios().subscribe({
            next: (servicios) => {
              // Filtrar los servicios cuyo emprendimientoId esté en la lista de emprendimientoIds
              this.servicios = servicios.filter((servicio: any) =>
                servicio.serviciosEmprendedores?.some((emp: any) =>
                  emprendimientoIds.includes(emp.emprendimientoId)
                )
              );

              this.isLoading = false;
              this.serviciosFiltrados = [...this.servicios];
              console.log('Servicios filtrados para Emprendedor:', this.servicios);
            },
            error: (err) => {
              console.error('Error al obtener servicios:', err);
            }
          });
        },
        error: (err) => {
          console.error('Error al obtener emprendimientos:', err);
          Swal.fire('Error', 'No se pudieron cargar los emprendimientos', 'error');
        }
      });
    } else {
      // Si no es ni SuperAdmin ni Emprendedor, puedes manejar otro tipo de lógica si es necesario
      console.log('Usuario con rol no identificado');
    }
  }
  
  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.serviciosFiltrados = this.servicios.filter((s) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'nombre':
          return s.nombre?.toLowerCase().includes(texto);
        case 'descripcion':
          return s.descripcion?.toLowerCase().includes(texto);
        case 'precioBase':
          return s.precioBase?.toLowerCase().includes(texto);
        case 'estado':
          return s.estado?.toLowerCase().includes(texto);
        case 'tipoServicio.nombre':
          return s.tipoServicio?.nombre?.toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/editservicio/${id}`]);
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
        this.serviciosService.eliminarServicio(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El servicio ha sido eliminado correctamente.'
            });
            this.cargarServicios();
          },
          error: (error) => {
            console.error('Error al eliminar servicio:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el servicio.'
            });
          }
        });
      }
    });
  }
}

