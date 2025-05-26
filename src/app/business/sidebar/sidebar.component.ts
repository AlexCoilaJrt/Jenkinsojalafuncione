import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  roles: string[] = [];
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.roles = this.authService.getUsuarioRol();
  }
  tieneRol(roles: string | string[]): boolean {
    // Si roles es un string, lo convertimos a un arreglo para que sea más fácil de manejar
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Verificamos si alguno de los roles que el usuario tiene coincide con los roles que le pasamos
    return rolesArray.some(role => this.roles.includes(role));
  }

  logout(): void {
    localStorage.removeItem('token');  // Elimina el token del localStorage
    localStorage.removeItem('usuario'); // Elimina el usuario del localStorage
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      confirmButtonText: 'Aceptar'
    });
    // Redirigir al login o home
    this.router.navigate(['/login']);
  }

}
