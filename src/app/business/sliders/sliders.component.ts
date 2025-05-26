import { Component, OnInit, DoCheck } from '@angular/core';
import { SidebarComponent } from "../../business/sidebar/sidebar.component";
import { NavbarComponent } from "../../business/sidebar/navbar/navbar.component";
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { SlidersService } from '../../core/services/sliders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './sliders.component.html',
  styleUrl: './sliders.component.css'
})
export class SlidersComponent implements OnInit, DoCheck {
  filtroBusqueda: string = '';
  columnaBusqueda: string = 'nombre';
  isLoading = true;
  sliders: any[] = [];
  slidersFiltrados: any[] = [];

  constructor(private router: Router, private slidersService: SlidersService) {}

  ngOnInit(): void {
    this.cargarSliders();
  }

  cargarSliders(): void {
    this.slidersService.listarSliders().subscribe({
      next: (data) => {
        this.sliders = data.data ?? data;
        this.isLoading = false;
        this.slidersFiltrados = [...this.sliders];
        console.log('Sliders cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener sliders:', err);
      }
    });
  }

  ngDoCheck(): void {
    const texto = this.filtroBusqueda.toLowerCase();

    this.slidersFiltrados = this.sliders.filter((s) => {
      if (!texto) return true;

      switch (this.columnaBusqueda) {
        case 'nombre':
          return s.nombre?.toLowerCase().includes(texto);
        case 'description':
          return s.description?.toLowerCase().includes(texto);
        case 'estado':
          return s.estado?.toLowerCase().includes(texto);
        default:
          return false;
      }
    });
  }

  editar(id: string): void {
    this.router.navigate([`/editslider/${id}`]);
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.slidersService.eliminarSlider(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El slider ha sido eliminado correctamente.'
            });
            this.cargarSliders();
          },
          error: (error) => {
            console.error('Error al eliminar slider:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el slider.'
            });
          }
        });
      }
    });
  }
}
