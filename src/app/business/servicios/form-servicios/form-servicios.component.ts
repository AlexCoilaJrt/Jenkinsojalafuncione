import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NavbarComponent } from '../../sidebar/navbar/navbar.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ServiciosService } from '../../../core/services/servicios.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { TiposServicioService } from '../../../core/services/tipos-servicios.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { AuthService } from '../../../core/services/auth.service';
declare let L: any;
@Component({
  selector: 'app-form-servicios',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './form-servicios.component.html',
  styleUrls: ['./form-servicios.component.css']
})
export class FormServiciosComponent implements OnInit {
  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef<HTMLDivElement>;

  map!: any;
  marker!: any;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  roles: string[] = [];
  servicioForm!: FormGroup;
  tiposServicio: any[] = [];
  emprendimientos: any[] = [];

  isEdit = false;
  servicioIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService,
    private tiposServicioService: TiposServicioService,
    private emprendimientoService: EmprendimientoService,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private authService:AuthService
  ) { }

  ngOnInit(): void {
    this.roles = this.authService.getUsuarioRol();
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioBase: [0, Validators.required],
      moneda: ['', Validators.required],
      estado: ['activo', Validators.required],
      tipoServicioId: [0, Validators.required],
      emprendimientoId: [null, Validators.required],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
      detallesServicio: this.fb.group({}),
      imagenes: this.fb.array([])  // Este array almacenará las URLs de las imágenes
    });

    // cargar tipos
    this.tiposServicioService.listarTiposServicio().subscribe({
      next: data => this.tiposServicio = data,
      error: err => Swal.fire('Error', 'No se pudieron cargar tipos', err)
    });

    // cargar emprendimientos
    this.emprendimientoService.listarEmprendimientos().subscribe({
      next: data => this.emprendimientos = data.emprendimientos || data,
      error: err => Swal.fire('Error', 'No se pudieron cargar emprendimientos', 'error')
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.servicioIdEdit = +id;
      this.serviciosService.obtenerServicio(this.servicioIdEdit)
        .subscribe({
          next: srv => {
            this.servicioForm.patchValue({
              nombre: srv.nombre,
              descripcion: srv.descripcion,
              precioBase: srv.precioBase,
              moneda: srv.moneda,
              estado: srv.estado,
              tipoServicioId: srv.tipoServicio?.id,
              latitud: srv.latitud,
              longitud: srv.longitud
            });

            // Extraer el emprendimientoId desde serviciosEmprendedores
            const emprendimientoId = srv.serviciosEmprendedores?.[0]?.emprendimientoId;
            if (emprendimientoId) {
              this.servicioForm.patchValue({
                emprendimientoId: emprendimientoId
              });
            }

            // Agregar las URLs de las imágenes al formulario
            if (srv.imagenes && srv.imagenes.length > 0) {
              const imagenesControl = this.servicioForm.get('imagenes') as any;
              srv.imagenes.forEach((img: any) => {
                imagenesControl.push(this.fb.control(img.url));  // Agregar cada URL de imagen al formulario
              });
            }

            // detalles dinámicos
            const grupo = this.detallesServicioGroup;
            Object.entries(srv.detallesServicio || {}).forEach(([k, v]) =>
              grupo.addControl(k, this.fb.control(v))
            );
          },
          error: () => Swal.fire('Error', 'No se pudo cargar servicio', 'error')
        });
    }
  }
    tieneRol(roles: string | string[]): boolean {
    // Si roles es un string, lo convertimos a un arreglo para que sea más fácil de manejar
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Verificamos si alguno de los roles que el usuario tiene coincide con los roles que le pasamos
    return rolesArray.some(role => this.roles.includes(role));
  }

  ngAfterViewInit(): void {
    const center = { lat: -15.6000, lng: -69.9000 };
    this.map = L.map(this.mapContainer.nativeElement)
      .setView([center.lat, center.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.servicioForm.patchValue({ latitud: lat, longitud: lng });
    });

    // si ya editando, colocar marcador
    setTimeout(() => {
      const lat = this.servicioForm.get('latitud')!.value;
      const lng = this.servicioForm.get('longitud')!.value;
      if (lat != null && lng != null) {
        this.marker = L.marker([lat, lng]).addTo(this.map);
        this.map.setView([lat, lng], 13);
      }
    }, 500);
  }

  get detallesServicioGroup(): FormGroup {
    return this.servicioForm.get('detallesServicio') as FormGroup;
  }
  get detalleKeys(): string[] {
    return Object.keys(this.detallesServicioGroup.controls);
  }

  async addDetalle(): Promise<void> {
    const { value: key } = await Swal.fire<string>({
      title: 'Nuevo detalle',
      input: 'text',
      inputLabel: 'Nombre del campo',
      inputPlaceholder: 'ej. incluye, requisitos, idiomas...',
      showCancelButton: true,
      inputValidator: v => !v ? 'Debes escribir algo' : null
    });
    if (!key) return;
    const grp = this.detallesServicioGroup;
    if (grp.contains(key)) {
      Swal.fire('Error', 'Ese campo ya existe.', 'error');
      return;
    }
    grp.addControl(key, this.fb.control(''));
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files.length) return;
    Array.from(files).forEach(file => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  async subirImagenASupabase(file: File): Promise<string> {
    Swal.fire({
      title: 'Subiendo imagen...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });
    const supabase = this.supabaseService.getClient();
    const path = `servicios/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('servicios').upload(path, file);
    if (error) {
      Swal.close();
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from('servicios').getPublicUrl(path);
    Swal.close();
    return data.publicUrl;
  }

  async guardarServicio(): Promise<void> {
    if (this.servicioForm.invalid) {
      const inv = Object.keys(this.servicioForm.controls)
        .filter(k => this.servicioForm.get(k)?.invalid);
      Swal.fire('Error', 'Completa: ' + inv.join(', '), 'error');
      return;
    }
    const fv = this.servicioForm.getRawValue();
    // convertir emprendimientoId a number
    const empId = Number(fv.emprendimientoId);
    if (isNaN(empId)) {
      Swal.fire('Error', 'Selecciona un emprendedor válido', 'error');
      return;
    }

    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading(), allowOutsideClick: false, showConfirmButton: false });

    // subir imágenes
    const urls: string[] = [];
    for (const f of this.selectedFiles) {
      try { urls.push(await this.subirImagenASupabase(f)); }
      catch { Swal.close(); await Swal.fire('Error', 'No se pudieron subir imágenes', 'error'); return; }
    }

    // procesar detalles
    const raw = this.detallesServicioGroup.value as Record<string, any>;
    const det: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      det[k] = (typeof v === 'string' && v.includes(','))
        ? v.split(',').map(s => s.trim()).filter(s => s)
        : v;
    });

    const payload = {
      servicio: {
        tipoServicioId: Number(fv.tipoServicioId),
        nombre: fv.nombre,
        descripcion: fv.descripcion,
        precioBase: Number(fv.precioBase),
        moneda: fv.moneda,
        estado: fv.estado,
        latitud: fv.latitud,
        longitud: fv.longitud,
        detallesServicio: det,
        imagenes: urls.map(u => ({ url: u }))
      },
      emprendimientoId: empId
    };

    const obs$ = this.isEdit && this.servicioIdEdit
      ? this.serviciosService.actualizarServicio(this.servicioIdEdit, payload)
      : this.serviciosService.crearServicio(payload);

    obs$.subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Éxito', 'Servicio guardado', 'success');
        this.router.navigate(['/servicios']);
      },
      error: e => {
        Swal.close();
        Swal.fire('Error', 'No se pudo guardar', 'error');
        console.error(e);
      }
    });
  }
  removeDetalle(key: string): void {
    const grp = this.detallesServicioGroup;
    if (grp.contains(key)) {
      grp.removeControl(key);
    }
  }

  cancelar(): void {
    this.router.navigate(['/servicios']);
  }
}
