import { Component, OnInit, DoCheck } from '@angular/core';
import { SidebarComponent } from '../../business/sidebar/sidebar.component';
import { NavbarComponent } from '../../business/sidebar/navbar/navbar.component';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../core/services/roles.service';

@Component({
  selector: 'app-rol',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css'
})
export class RoleListComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'nombre';
  isLoading = true;
  roles: any[] = [];
  rolesFiltrados: any[] = [];

  constructor(private router: Router, private rolesService: RolesService) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolesService.listarRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.rolesFiltrados = [...this.roles];
        this.isLoading = false;
        console.log('Roles cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener roles:', err);
        this.isLoading = false;
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();
    this.rolesFiltrados = this.roles.filter((rol) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'nombre':
          return rol.nombre?.toLowerCase().includes(texto);
        case 'descripcion':
          return rol.descripcion?.toLowerCase().includes(texto);
        case 'permiso':
          return rol.rolesPermisos?.some((rp: any) =>
            rp.permiso?.nombre?.toLowerCase().includes(texto)
          );
        default:
          return false;
      }
    });
  }

  editar(id: number): void {
    this.router.navigate([`/editrol/${id}`]);
  }

  eliminarRol(id: number): void {
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
        this.rolesService.eliminarRol(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El rol ha sido eliminado correctamente.', 'success');
            this.cargarRoles();
          },
          error: (error) => {
            console.error('Error al eliminar rol:', error);
            Swal.fire('Error', 'No se pudo eliminar el rol.', 'error');
          }
        });
      }
    });
  }
}
