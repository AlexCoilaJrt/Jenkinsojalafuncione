import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css'
})
export class PasswordRecoveryComponent {
  email: string = '';
  constructor(private authService: AuthService, private router: Router) {}
  verificar(): void {
    if (this.email) {
      // Llamamos al método requestPasswordReset con el email
      this.authService.requestPasswordReset(this.email).subscribe(
        response => {
          console.log('Reseteo de contraseña solicitado con éxito:', response);
          this.router.navigate(['/verificacioncodigo']);
        },
        error => {
          console.error('Error al solicitar el reseteo de la contraseña:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al solicitar el reseteo de la contraseña. Por favor, intenta nuevamente.',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    } else {
      console.error('El campo de email está vacío');
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, ingresa un correo electrónico válido.',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
