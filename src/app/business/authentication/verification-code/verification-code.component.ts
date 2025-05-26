import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verification-code',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.css'
})
export class VerificationCodeComponent {
  token: string = '';
  newPassword: string = '';
  constructor(private authService: AuthService, private router: Router) {}
  verificarcodigo(): void {
    if (this.token && this.newPassword) {
      this.authService.resetPassword(this.token, this.newPassword).subscribe({
        next: (response) => {
          console.log('Contraseña reseteada exitosamente');
          // Mostrar mensaje de éxito con SweetAlert
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña reseteada!',
            text: 'Tu contraseña se ha actualizado correctamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            // Redirigir a login después de mostrar el mensaje
            this.router.navigate(['/login']);
          });
        },
        error: (error) => {
          console.error('Error al resetear la contraseña:', error);
          // Mostrar mensaje de error con SweetAlert
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un problema al resetear la contraseña. Intenta de nuevo.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa un token y una nueva contraseña.',
        confirmButtonText: 'Aceptar'
      });
    }
  }

}
