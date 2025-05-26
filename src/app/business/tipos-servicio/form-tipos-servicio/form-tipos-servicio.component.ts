import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../business/sidebar/sidebar.component';
import { NavbarComponent } from '../../../business/sidebar/navbar/navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TiposServicioService } from '../../../core/services/tipos-servicios.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-tipo-servicio',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule,ReactiveFormsModule],
  templateUrl: './form-tipos-servicio.component.html',
  styleUrls: ['./form-tipos-servicio.component.css']
})
export class FormTiposServicioComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  tipoServicioForm!: FormGroup;
  isEdit: boolean = false;
  tipoServicioIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private tiposServicioService: TiposServicioService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.tipoServicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      requiereCupo: [false, Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.tipoServicioIdEdit = +id;

      // Cargar datos si estamos editando un tipo de servicio
      this.tiposServicioService.obtenerTipoServicio(this.tipoServicioIdEdit).subscribe({
        next: (tipoServicio) => {
          this.tipoServicioForm.patchValue({
            nombre: tipoServicio.nombre,
            descripcion: tipoServicio.descripcion,
            requiereCupo: tipoServicio.requiereCupo
          });
        },
        error: (err) => {
          console.error('Error al cargar tipo de servicio:', err);
          Swal.fire('Error', 'No se pudo cargar el tipo de servicio.', 'error');
        }
      });
    }
  }

  guardarTipoServicio(): void {
    if (this.tipoServicioForm.invalid) {
      const camposInvalidos = Object.keys(this.tipoServicioForm.controls)
        .filter(key => this.tipoServicioForm.get(key)?.invalid)
        .map(key => {
          switch (key) {
            case 'nombre': return 'Nombre';
            case 'descripcion': return 'Descripción';
            case 'requiereCupo': return 'Requiere Cupo';
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

    const formValue = this.tipoServicioForm.getRawValue();

    const payload = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      requiereCupo: formValue.requiereCupo,
    };

    if (this.isEdit && this.tipoServicioIdEdit) {
      this.tiposServicioService.crearTipoServicio(payload).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El tipo de servicio fue actualizado correctamente.', 'success');
          this.router.navigate(['/tipos-servicio']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          Swal.fire('Error', 'No se pudo actualizar el tipo de servicio.', 'error');
        }
      });
    } else {
      this.tiposServicioService.crearTipoServicio(payload).subscribe({
        next: () => {
          Swal.fire('Registrado', 'El tipo de servicio fue registrado correctamente.', 'success');
          this.router.navigate(['/tipos-servicio']);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          Swal.fire('Error', 'No se pudo registrar el tipo de servicio.', 'error');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/tipos-servicio']);
  }
}
