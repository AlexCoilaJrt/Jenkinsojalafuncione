import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export  class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false; // Añadir esta propiedad para manejar la visibilidad de la contraseña

  constructor(private authService: AuthService, private router: Router) {}

  volverAlMenu() {
    this.router.navigate(['/']); // Redirige a la ruta deseada, ajusta según tu estructura
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

login(): void {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      const token = response.access_token;
      const usuario = response.usuario;
      const roles = usuario.roles;  // Obtener todos los roles

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      console.log('Roles:', roles);

      // Verificar si tiene el rol de SuperAdmin o Emprendedor
      if (roles.includes('SuperAdmin')) {
        this.router.navigate(['/dashboard']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión como SuperAdmin.',
          confirmButtonText: 'Aceptar'
        });
      } else if (roles.includes('Emprendedor')) {
        this.router.navigate(['/emprendimiento']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión como Emprendedor.',
          confirmButtonText: 'Aceptar'
        });
      } else {
        this.router.navigate(['/']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    },
    error: (err) => {
      console.error('Login failed', err);
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Hubo un problema al iniciar sesión. Verifica tus credenciales.',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}

  
}
