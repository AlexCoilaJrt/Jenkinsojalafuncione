import { Component, OnInit, DoCheck } from '@angular/core';
import { SidebarComponent } from "../../business/sidebar/sidebar.component";
import { NavbarComponent } from "../../business/sidebar/navbar/navbar.component";
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'email';
  isLoading = true;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.authService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
        this.usuariosFiltrados = [...this.usuarios];
        console.log('Usuarios cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter((u) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'email':
          return u.email?.toLowerCase().includes(texto);
        case 'nombre':
          return u.persona.nombre?.toLowerCase().includes(texto);
        case 'apellidos':
          return u.persona.apellidos?.toLowerCase().includes(texto);
        case 'rol':
          return u.usuariosRoles[0]?.rol?.nombre?.toLowerCase().includes(texto);
        case 'telefono':
          return u.persona.telefono?.toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/editusuario/${id}`]);
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
        this.authService.eliminarUsuario(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El usuario ha sido eliminado correctamente.'
            });
            this.cargarUsuarios();
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el usuario.'
            });
          }
        });
      }
    });
  }
}
