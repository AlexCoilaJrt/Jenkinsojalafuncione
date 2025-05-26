import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';

import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NavbarComponent } from '../../sidebar/navbar/navbar.component';
import { PaqueteTuristicoService } from '../../../core/services/paquetes-turisticos.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { SupabaseService } from '../../../core/services/supabase.service';

interface Emprendimiento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-form-paquete',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './form-paquete.component.html',
  styleUrls: ['./form-paquete.component.css']
})
export class FormPaqueteComponent implements OnInit {
  paqueteForm!: FormGroup;
  emprendimientos: Emprendimiento[] = [];
  isLoadingEmpr = true;

  serviciosDisponibles: any[] = [];
  isLoadingServ = true;

  selectedFile: File[] = [];
  previewUrl: string | null = null;

  isEdit = false;
  paqueteIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private paqueteService: PaqueteTuristicoService,
    private serviciosService: ServiciosService,
    private emprendimientoService: EmprendimientoService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.paqueteForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', Validators.required],
      estado: ['activo', Validators.required],
      servicios: this.fb.array([]),
      emprendimientoId: ['', Validators.required]
    });

    this.loadEmprendimientos();
    this.loadServicios();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.paqueteIdEdit = +idParam;
      this.loadPaquete(+idParam);
    }
  }

  private loadEmprendimientos() {
    this.emprendimientoService.listarEmprendimientos()
      .pipe(
        map(resp => {
          console.log('Respuesta listarEmprendimientos():', resp);
          if (Array.isArray(resp)) {
            return resp;
          } else if ((resp as any).emprendimientos) {
            return (resp as any).emprendimientos;
          }
          return [];
        })
      )
      .subscribe({
        next: list => this.emprendimientos = list,
        error: err => {
          console.error('Error cargando emprendimientos', err);
          Swal.fire('Error', 'No se pudieron cargar los emprendimientos', 'error');
        },
        complete: () => this.isLoadingEmpr = false
      });
  }

  private loadServicios() {
    this.serviciosService.listarServicios().subscribe({
      next: servs => {
        this.serviciosDisponibles = servs;
        const fa = this.paqueteForm.get('servicios') as FormArray;
        servs.forEach(() => fa.push(this.fb.control(false)));
      },
      error: err => console.error('Error cargando servicios', err),
      complete: () => this.isLoadingServ = false
    });
  }

  private loadPaquete(id: number) {
    this.paqueteService.obtenerPaqueteTuristico(id).subscribe({
      next: p => {
        this.paqueteForm.patchValue({
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          estado: p.estado,
          emprendimientoId: p.emprendimiento.id
        });
        this.markServiciosSeleccionados(p.servicios);
      },
      error: err => console.error('Error cargando paquete', err)
    });
  }

  private markServiciosSeleccionados(servs: any[]) {
    const fa = this.paqueteForm.get('servicios') as FormArray;
    servs.forEach(s => {
      const idx = this.serviciosDisponibles.findIndex(x => x.id === s.id);
      if (idx > -1) {
        fa.at(idx).setValue(true);
      }
    });
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length) {
      this.selectedFile = Array.from(files);
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  }

  async subirImagenesASupabase(files: File[]): Promise<string[]> {
    Swal.fire({
      title: 'Subiendo imágenes...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    const supabase = this.supabaseService.getClient();
    const urls: string[] = [];

    for (const file of files) {
      const filePath = `paquetes-turisticos/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('paquetes-turisticos')
        .upload(filePath, file);
      if (error) {
        Swal.close();
        throw new Error(error.message);
      }
      const { data: publicUrlData } = supabase.storage
        .from('paquetes-turisticos')
        .getPublicUrl(filePath);
      if (publicUrlData.publicUrl) {
        urls.push(publicUrlData.publicUrl);
      }
    }

    Swal.close();
    return urls;
  }

  async guardarPaquete() {
    if (this.paqueteForm.invalid) {
      const invalids = Object.keys(this.paqueteForm.controls)
        .filter(k => this.paqueteForm.get(k)?.invalid);
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        html: `Corrige: <b>${invalids.join(', ')}</b>`
      });
      return;
    }

    const formValue = this.paqueteForm.getRawValue();
    const emprendimientoId = +formValue.emprendimientoId;
    if (isNaN(emprendimientoId)) {
      Swal.fire('Error', 'La ID del emprendimiento debe ser un número válido.', 'error');
      return;
    }

    let imagenes: string[] = [];
    if (this.selectedFile.length) {
      try {
        imagenes = await this.subirImagenesASupabase(this.selectedFile);
      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo subir las imágenes.', 'error');
        return;
      }
    }

    const payload = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      estado: formValue.estado,
      imagenes,
      servicios: this.getServiciosSeleccionados(),
      emprendimientoId
    };

    const request$ = this.isEdit && this.paqueteIdEdit
      ? this.paqueteService.actualizarPaqueteTuristico(this.paqueteIdEdit, payload)
      : this.paqueteService.crearPaqueteTuristico(payload);

    request$.subscribe({
      next: () => {
        Swal.fire(
          this.isEdit ? 'Actualizado' : 'Registrado',
          `El paquete fue ${this.isEdit ? 'actualizado' : 'registrado'} correctamente.`,
          'success'
        );
        this.paqueteForm.reset();
        this.router.navigate(['/paquetes']);
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un problema al guardar el paquete.', 'error');
      }
    });
  }

  getServiciosSeleccionados(): number[] {
    const fa = this.paqueteForm.get('servicios') as FormArray;
    return fa.controls
      .map((c, i) => (c.value ? this.serviciosDisponibles[i].id : null))
      .filter(x => x !== null) as number[];
  }

  cancelar() {
    this.router.navigate(['/paquetes']);
  }
}
