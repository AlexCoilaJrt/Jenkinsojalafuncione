import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaqueteTuristicoService } from '../../core/services/paquetes-turisticos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paquetedet',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterModule],
  templateUrl: './paquetedet.component.html',
  styleUrl: './paquetedet.component.css'
})
export class PaquetedetComponent implements OnInit{
  paquetes: any = {};

  constructor(
    private route: ActivatedRoute,
    private paqueteTuristicoService: PaqueteTuristicoService
  ) {}

  ngOnInit(){
    this.obtenerPaquete();
    
  }
  obtenerPaquete(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paqueteTuristicoService.obtenerPaqueteTuristico(id).subscribe({
        next: (paquete) => {
          this.paquetes = paquete;
          console.log("paquete detalle",this.paquetes)
        },
        error: (err) => {
          console.error('Error al obtener detalles del paquete:', err);
        }
      });
    }
  }
} 
