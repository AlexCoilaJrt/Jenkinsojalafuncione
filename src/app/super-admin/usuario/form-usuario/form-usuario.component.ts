import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../business/sidebar/sidebar.component';
import { NavbarComponent } from '../../../business/sidebar/navbar/navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './form-usuario.component.html',
  styleUrls: ['./form-usuario.component.css']
})
export class FormUsuarioComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  usuarioForm!: FormGroup;
  mostrarPassword: boolean = false;
  isEdit: boolean = false;
  usuarioIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.usuarioForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        telefono: [''],
        direccion: [''],
        fotoPerfilUrl: [''],
        fechaNacimiento: [''],
        subdivisionId: [0],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: [this.passwordsIgualesValidator]
      }
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.usuarioIdEdit = +id;

      this.authService.getUsuarioById(this.usuarioIdEdit).subscribe({
        next: (usuario) => {
          this.usuarioForm.patchValue({
            nombre: usuario.persona.nombre,
            apellidos: usuario.persona.apellidos,
            telefono: usuario.persona.telefono,
            direccion: usuario.persona.direccion,
            fotoPerfilUrl: usuario.imagenes.fotoPerfilUrl,
            fechaNacimiento: usuario.fechaNacimiento?.substring(0, 10),
            email: usuario.email,
            password: '',
            confirmPassword: ''
          });
          this.usuarioForm.get('email')?.disable();
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          Swal.fire('Error', 'No se pudo cargar el usuario.', 'error');
        }
      });
    }
  }

  passwordsIgualesValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async subirImagenASupabase(file: File): Promise<string> {
    // Mostrar el mensaje de espera
    Swal.fire({
      title: 'Subiendo imagen...',
      text: 'Por favor espere mientras se sube la imagen.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const supabase = this.supabaseService.getClient();
    const filePath = `usuarios/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from('usuarios').upload(filePath, file);
    if (error) {
      Swal.close();  // Cerrar el mensaje de carga
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage.from('usuarios').getPublicUrl(filePath);
    Swal.close();  // Cerrar el mensaje de carga
    return publicUrlData?.publicUrl;
  }

  async guardarUsuario() {
    if (this.usuarioForm.invalid) {
      const camposInvalidos = Object.keys(this.usuarioForm.controls)
        .filter(key => this.usuarioForm.get(key)?.invalid)
        .map(key => {
          switch (key) {
            case 'nombre': return 'Nombre';
            case 'apellidos': return 'Apellidos';
            case 'email': return 'Correo Electrónico válido';
            case 'password': return 'Contraseña (mínimo 6 caracteres)';
            case 'confirmPassword': return 'Confirmación de Contraseña';
            default: return key;
          }
        });
  
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        html: `Por favor corrige o completa los siguientes campos:<br><b>${camposInvalidos.join(', ')}</b>`
      });
      return;
    }
  
    const formValue = this.usuarioForm.getRawValue();
    let fotoPerfilUrl = '';
  
    if (this.selectedFile) {
      try {
        fotoPerfilUrl = await this.subirImagenASupabase(this.selectedFile);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        Swal.fire('Error', 'No se pudo subir la imagen de perfil.', 'error');
        return;
      }
    }
  
    const payload = {
      email: formValue.email,
      password: formValue.password,
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      telefono: formValue.telefono,
      direccion: formValue.direccion,
      fotoPerfilUrl: fotoPerfilUrl,
      fechaNacimiento: formValue.fechaNacimiento || null,
      subdivisionId: 1
    };
  
    if (this.isEdit && this.usuarioIdEdit) {
      this.authService.actualizarUsuario(this.usuarioIdEdit, payload).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El usuario fue actualizado correctamente.', 'success');
          this.usuarioForm.reset();
          this.router.navigate(['/usuario']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
        }
      });
    } else {
      this.authService.register(payload).subscribe({
        next: () => {
          Swal.fire('Registrado', 'El usuario fue registrado correctamente.', 'success');
          this.usuarioForm.reset();
          this.router.navigate(['/usuario']);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          Swal.fire('Error', 'No se pudo registrar el usuario.', 'error');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/usuario']);
  }
}
