import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../sidebar/navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-platos-tipicos',
  standalone: true,
  imports: [SidebarComponent,NavbarComponent, CommonModule, RouterModule],
  templateUrl: './platos-tipicos.component.html',
  styleUrl: './platos-tipicos.component.css'
})
export class PlatosTipicosComponent implements OnInit{
  platosTipicos: any[] = [];
  paginaActual: number = 1;
  totalPaginas: number = 1;
  totalElementos: number = 0;
  limitePorPagina: number = 10;
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.cargarPlatosTipicos();
  }
  cargarPlatosTipicos(): void {

    // Simulamos una respuesta desde el servicio
    const simulatedData = {
      platos_tipicos: [
        {
          id: 1,
          nombre: "Ceviche",
          descripcion: "Plato de pescado o mariscos frescos, marinados en jugo de limón, con cebolla, cilantro y ají.",
          ingredientes: ["Pescado fresco", "Cebolla", "Cilantro", "Limón", "Ají"],
          region: "Costa",
          origen: "Perú",
          tipo: "Entrada"
        },
        {
          id: 2,
          nombre: "Lomo Saltado",
          descripcion: "Plato con carne de res salteada con cebolla, tomate, ají amarillo y servido con papas fritas y arroz.",
          ingredientes: ["Carne de res", "Cebolla", "Tomate", "Ají amarillo", "Papas fritas", "Arroz"],
          region: "Sierra",
          origen: "Perú",
          tipo: "Plato principal"
        },
        {
          id: 3,
          nombre: "Aji de Gallina",
          descripcion: "Plato a base de pechuga de pollo desmenuzada, salsa cremosa de ají amarillo, con arroz blanco.",
          ingredientes: ["Pollo", "Ají amarillo", "Leche evaporada", "Pan", "Nuez moscada"],
          region: "Sierra",
          origen: "Perú",
          tipo: "Plato principal"
        },
        {
          id: 4,
          nombre: "Causa Limeña",
          descripcion: "Plato frío de puré de papa amarilla sazonado con ají, limón y relleno de atún o pollo.",
          ingredientes: ["Papa amarilla", "Ají", "Limón", "Atún", "Mayonesa"],
          region: "Costa",
          origen: "Perú",
          tipo: "Entrada"
        },
        {
          id: 5,
          nombre: "Pachamanca",
          descripcion: "Carne, papas, habas y maíz cocidos bajo tierra con hierbas aromáticas, típico de los Andes.",
          ingredientes: ["Carne de cerdo", "Papas", "Habas", "Maíz", "Hierbas aromáticas"],
          region: "Andina",
          origen: "Perú",
          tipo: "Plato principal"
        }
      ]
    };

    // Simula la respuesta exitosa
    this.platosTipicos = simulatedData.platos_tipicos;
    console.log('Platos típicos cargados:', this.platosTipicos);
  }
  editar(ip: string): void {
    // Aquí puedes trabajar con la IP recibida como parámetro
    console.log('Editando plato con IP:', ip);

    // Lógica para redirigir o realizar la edición según la IP
    // Si quieres navegar a una página de edición, por ejemplo:
    this.router.navigate(['/editplatos', ip]); // Redirige a la página de edición, pasando la IP en la URL
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

        }
      });
    }
    paginaSiguiente(): void {
      if (this.paginaActual < this.totalPaginas) {
        this.paginaActual++;
        this.cargarPlatosTipicos();
      }
    }
    paginaAnterior(): void {
      if (this.paginaActual > 1) {
        this.paginaActual--;
        this.cargarPlatosTipicos();
      }
    }
    getLimiteSuperior(): number {
      return Math.min(this.paginaActual * this.limitePorPagina, this.totalElementos);
    }
}
