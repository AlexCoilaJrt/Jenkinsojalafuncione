import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Router, RouterModule }   from '@angular/router';
import { AuthService }    from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
nombre = '';
  apellidos = '';
  telefono = '';
  direccion = '';
  email = '';
  password = '';
  confirmPassword = '';
  subdivisionId = 0;
  fechaNacimiento = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async subirImagenASupabase(file: File): Promise<string> {
    Swal.fire({
      title: 'Subiendo imagen...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    const supabase = this.supabaseService.getClient();
    const path = `usuarios/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('usuarios').upload(path, file);
    if (error) {
      Swal.close();
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from('usuarios').getPublicUrl(path);
    Swal.close();
    return data.publicUrl;
  }

  async onSubmit(): Promise<void> {
    if (!this.nombre || !this.apellidos || !this.email || !this.password || this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente.', 'error');
      return;
    }

    let fotoPerfilUrl = '';
    if (this.selectedFile) {
      try {
        fotoPerfilUrl = await this.subirImagenASupabase(this.selectedFile);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        return;
      }
    }

    const payload = {
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion,
      fotoPerfilUrl: fotoPerfilUrl,
      fechaNacimiento: this.fechaNacimiento || null,
      subdivisionId: 1
    };

    this.authService.register(payload).subscribe({
      next: () => {
        Swal.fire('Registrado', 'El usuario fue registrado correctamente.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        Swal.fire('Error', 'No se pudo registrar el usuario.', 'error');
      }
    });
  }
}
