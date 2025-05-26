import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../business/sidebar/sidebar.component';
import { NavbarComponent } from '../../../business/sidebar/navbar/navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SlidersService } from '../../../core/services/sliders.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-form-slider',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './form-slider.component.html',
  styleUrl: './form-slider.component.css'
})
export class FormSliderComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  sliderForm!: FormGroup;
  isEdit: boolean = false;
  sliderIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private slidersService: SlidersService,
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.sliderForm = this.fb.group({
      nombre: ['', Validators.required],
      description: ['', Validators.required],
      estado: ['activo', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.sliderIdEdit = +id;

      this.slidersService.obtenerSlider(this.sliderIdEdit).subscribe({
        next: (slider) => {
          this.sliderForm.patchValue({
            nombre: slider.nombre,
            description: slider.description,
            estado: slider.estado
          });

          if (slider.imagenes?.length) {
            this.previewUrl = slider.imagenes[0]?.url || null;
          }
        },
        error: (err) => {
          console.error('Error al cargar slider:', err);
          Swal.fire('Error', 'No se pudo cargar el slider.', 'error');
        }
      });
    }
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
    const supabase = this.supabaseService.getClient();
    const filePath = `sliders/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from('sliders').upload(filePath, file);
    if (error) throw new Error(error.message);

    const { data: publicUrlData } = supabase.storage.from('sliders').getPublicUrl(filePath);
    return publicUrlData?.publicUrl;
  }

  async guardarSlider(): Promise<void> {
    if (this.sliderForm.invalid) {
      const camposInvalidos = Object.keys(this.sliderForm.controls)
        .filter(key => this.sliderForm.get(key)?.invalid)
        .map(key => {
          switch (key) {
            case 'nombre': return 'Nombre';
            case 'description': return 'Description';
            case 'estado': return 'Estado';
            default: return key;
          }
        });

      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        html: `Por favor corrige los siguientes campos:<br><b>${camposInvalidos.join(', ')}</b>`
      });
      return;
    }

    const formValue = this.sliderForm.getRawValue();
    const imagenes = [];

    if (this.selectedFile) {
      try {
        const url = await this.subirImagenASupabase(this.selectedFile);
        imagenes.push({ url });
      } catch (error) {
        console.error('Error al subir imagen:', error);
        Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        return;
      }
    }

    const payload = {
      nombre: formValue.nombre,
      description: formValue.description,
      estado: formValue.estado,
      imagenes
    };

    if (this.isEdit && this.sliderIdEdit) {
      this.slidersService.actualizarSlider(this.sliderIdEdit, payload).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El slider fue actualizado correctamente.', 'success');
          this.router.navigate(['/sliders']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          Swal.fire('Error', 'No se pudo actualizar el slider.', 'error');
        }
      });
    } else {
      this.slidersService.crearSlider(payload).subscribe({
        next: () => {
          Swal.fire('Registrado', 'El slider fue registrado correctamente.', 'success');
          this.router.navigate(['/sliders']);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          Swal.fire('Error', 'No se pudo registrar el slider.', 'error');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/sliders']);
  }
}
