import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Asegúrate de importar Router
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-form-disponibilidad',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule, SidebarComponent],
  templateUrl: './form-disponibilidad.component.html',
})
export class FormDisponibilidadComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  disponibilidadForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.disponibilidadForm = this.fb.group({
      id: [null],  // Para edición
      servicioId: [null, Validators.required],
      fecha: ['', Validators.required],
      cuposDisponibles: [null, [Validators.required, Validators.min(1)]],
      precioEspecial: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.disponibilidadForm.patchValue(this.initialData);
    }
  }

  onSubmit(): void {
    if (this.disponibilidadForm.invalid) {
      return;
    }

    console.log('Formulario enviado:', this.disponibilidadForm.value);
    this.formSubmit.emit(this.disponibilidadForm.value);
  }

  onCancel(): void {
    this.disponibilidadForm.reset();
    this.router.navigate(['/lista-disponibilidad']); // o la ruta que prefieras
  }
}
