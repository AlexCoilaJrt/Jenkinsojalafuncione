import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detemprendedor',
  standalone: true,
  imports: [NavbarComponent, RouterModule, CommonModule],
  templateUrl: './detemprendedor.component.html',
  styleUrl: './detemprendedor.component.css'
})
export class DetemprendedorComponent implements OnInit{
  emprendimiento: any;

  constructor(
    private route: ActivatedRoute,
    private servicio: EmprendimientoService

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicio.verEmprendimiento(id).subscribe({
        next: (data) => {
          console.log(data)
          this.emprendimiento = data;
          console.log('Emprendimiento:', data);
        },
        error: (error) => {
          console.error('Error al obtener detalles:', error);
        }
      });
    }
  }
}
