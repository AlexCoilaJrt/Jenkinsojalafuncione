import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LugaresService } from '../../../core/services/lugar.service';
import { initFlowbite } from 'flowbite';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detprinlugares',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './detprinlugares.component.html',
  styleUrls: ['./detprinlugares.component.css']
})
export class DetprinlugaresComponent implements OnInit {
  mapUrl!: SafeResourceUrl;
  lugar: any = {};
  resenas: any[] = [];
  usuarios: any = {};
  dateForm: FormGroup;
  totalPrice: number | null = null;
  nights: number | null = null;
  currentSlide = 0;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private lugaresService: LugaresService,
    private fb: FormBuilder
  ) {
    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
    this.dateForm.valueChanges.subscribe(values => {
      this.calculateNights(values.startDate, values.endDate);
    });
  }

  ngOnInit(): void {
    initFlowbite();
    this.obtenerLugar();
  }

  obtenerLugar(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lugaresService.getLugar(id).subscribe({
        next: (lugar) => {
          this.lugar = lugar;
          this.buildMapUrl(lugar.latitud, lugar.longitud);
          console.log("lugar detalle", this.lugar);
        },
        error: (err) => {
          console.error('Error al obtener detalles del lugar:', err);
        }
      });
    }
  }

  private buildMapUrl(lat: number, lng: number): void {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  calculateNights(startDate: string, endDate: string): void {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const differenceInTime = end.getTime() - start.getTime();
      this.nights = differenceInTime / (1000 * 3600 * 24);
    } else {
      this.nights = null;
    }
  }

  // Método para agregar al carrito
  addToCart(): void {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(item => item.id === this.lugar.id);

    if (existingItem) {
      Swal.fire({
        icon: 'info',
        title: '¡Ya tienes esta reserva!',
        text: 'Este lugar ya está en tu carrito.',
        confirmButtonText: 'Aceptar'
      });
    } else {
      const cartItem: CartItem = {
        id: this.lugar.id,
        nombre: this.lugar.nombre,
        precio: this.lugar.precioBase,
        startDate: this.dateForm.value.startDate,
        endDate: this.dateForm.value.endDate
      };

      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));

      Swal.fire({
        icon: 'success',
        title: '¡Lugar añadido al carrito!',
        text: 'Ahora puedes continuar con la reserva.',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  resetCarousel() {
    this.currentSlide = 0;
  }

  prevSlide() {
    const len = this.lugar.imagenes.length;
    this.currentSlide = (this.currentSlide - 1 + len) % len;
  }

  nextSlide() {
    const len = this.lugar.imagenes.length;
    this.currentSlide = (this.currentSlide + 1) % len;
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  getIterable(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }
}

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  startDate: string;
  endDate: string;
}
