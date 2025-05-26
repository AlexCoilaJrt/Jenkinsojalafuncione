import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../business/sidebar/sidebar.component';
import { NavbarComponent } from '../../../business/sidebar/navbar/navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { RolesService } from '../../../core/services/roles.service';

@Component({
  selector: 'app-form-rol',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, ReactiveFormsModule],
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.css'
})
export class RolFormComponent implements OnInit {
  rolForm!: FormGroup;
  isEdit: boolean = false;
  rolIdEdit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rolForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.rolIdEdit = +id;
      this.cargarRol(this.rolIdEdit);
    }
  }

  cargarRol(id: number): void {
    this.rolesService.obtenerRol(id).subscribe({
      next: (rol) => {
        this.rolForm.patchValue({
          nombre: rol.nombre,
          descripcion: rol.descripcion
        });
      },
      error: (err) => {
        console.error('Error al cargar rol:', err);
        Swal.fire('Error', 'No se pudo cargar el rol.', 'error');
      }
    });
  }

  guardarRol(): void {
    if (this.rolForm.invalid) return;

    const rolData = this.rolForm.value;

    if (this.isEdit && this.rolIdEdit) {
      this.rolesService.actualizarRol(this.rolIdEdit, rolData).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El rol fue actualizado correctamente.', 'success');
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error('Error al actualizar rol:', err);
          Swal.fire('Error', 'No se pudo actualizar el rol.', 'error');
        }
      });
    } else {
      this.rolesService.crearRol(rolData).subscribe({
        next: () => {
          Swal.fire('Registrado', 'El rol fue registrado correctamente.', 'success');
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error('Error al registrar rol:', err);
          Swal.fire('Error', 'No se pudo registrar el rol.', 'error');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/roles']);
  }
}
