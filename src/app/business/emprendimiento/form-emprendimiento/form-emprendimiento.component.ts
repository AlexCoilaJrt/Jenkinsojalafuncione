import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../sidebar/navbar/navbar.component';
import { LugaresService } from '../../../core/services/lugar.service';

@Component({
  selector: 'app-form-emprendimiento',
  standalone: true,
  imports: [SidebarComponent, CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './form-emprendimiento.component.html',
  styleUrls: ['./form-emprendimiento.component.css']
})
export class FormEmprendimientoComponent implements OnInit {
  isEdit = false;
  emprendimientoForm!: FormGroup;
  tipos = ['Turismo'];
  lugaresTuristicos: any[] = [];
  usuarios: any[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  private currentId!: number;

  constructor(
    private fb: FormBuilder,
    private emprendimientoService: EmprendimientoService,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private lugarService: LugaresService 
  ) {}

  ngOnInit() {
    this.emprendimientoForm = this.fb.group({
      nombre: ['', Validators.required],
      lugarTuristicoId: [null, Validators.required],
      descripcion: ['', Validators.required],
      tipo: ['Turismo', Validators.required],
      direccion: ['', Validators.required],
      estado: ['Activo', Validators.required],
      fechaAprobacion: [null],
      usuarioId: [null, Validators.required],
      latitud: [null],
      longitud: [null],
      contactoTelefono: ['', Validators.required],
      contactoEmail: ['', [Validators.required, Validators.email]],
      sitioWeb: ['']
    });

    this.authService.getUsuarios().subscribe({
      next: u => this.usuarios = u,
      error: () => Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error')
    });

    this.lugarService.getLugares().subscribe({
      next: l => this.lugaresTuristicos = l,
      error: () => Swal.fire('Error', 'No se pudieron cargar los lugares turísticos', 'error')
    });

    // Detectar modo edición de forma robusta
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!(this.route.routeConfig?.path?.includes('editar') && idParam);

    if (this.isEdit) {
      this.currentId = +idParam!;
      this.emprendimientoService.verEmprendimiento(this.currentId).subscribe(data => {
        this.emprendimientoForm.patchValue({
          ...data,
          fechaAprobacion: data.fechaAprobacion ? new Date(data.fechaAprobacion) : null
        });
        this.previewUrls = data.imagenes.map((img: any) => img.url);
      });
    }
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    Array.from(files).forEach(f => {
      this.selectedFiles.push(f);
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(f);
    });
    event.target.value = '';
  }
  

  removeImage(i: number): void {
    this.selectedFiles.splice(i, 1);
    this.previewUrls.splice(i, 1);
  }

  private async subirImagen(f: File): Promise<string> {
    Swal.fire({ title: 'Subiendo imagen...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const supabase = this.supabaseService.getClient();
    const path = `emprendimientos/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from('emprendimientos').upload(path, f);
    if (error) { Swal.close(); throw new Error(error.message); }
    const { data } = supabase.storage.from('emprendimientos').getPublicUrl(path);
    Swal.close();
    return data.publicUrl;
  }

  async guardarEmprendimiento(): Promise<void> {
    if (this.emprendimientoForm.invalid) {
      const campos = Object.keys(this.emprendimientoForm.controls)
        .filter(k => this.emprendimientoForm.get(k)?.invalid);
      Swal.fire({ icon: 'error', title: 'Formulario incompleto', html: `Completa: <b>${campos.join(', ')}</b>` });
      return;
    }

    const datos = { ...this.emprendimientoForm.value };
    const urls: string[] = [];

    for (const file of this.selectedFiles) {
      try {
        urls.push(await this.subirImagen(file));
      } catch {
        Swal.fire('Error', 'No se pudieron subir todas las imágenes', 'error');
        return;
      }
    }

    datos.redesSociales = datos.redesSociales || {};
    datos.imagenes = urls.map(u => ({ url: u }));

    try {
      if (this.isEdit) {
        await this.emprendimientoService.actualizarEmprendimiento(this.currentId, datos).toPromise();
      } else {
        await this.emprendimientoService.crearEmprendimiento(datos).toPromise();
      }
      Swal.fire('¡Éxito!', 'Emprendimiento guardado correctamente', 'success')
        .then(() => this.router.navigate(['/emprendimiento']));
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Ocurrió un error guardando el emprendimiento', 'error');
    }
  }

  cancelar(): void {
    this.router.navigate(['/emprendimiento']);
  }
}
