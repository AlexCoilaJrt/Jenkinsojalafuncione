import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { ItinerarioService } from '../../core/services/itinerario.service';
import { Router, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(
    private reservaService: ReservasService, 
    private authService: AuthService,
    private itinerarioService:ItinerarioService,
    private router:Router 
  ) { }


  ngOnInit(): void {
    initFlowbite();
    this.loadCart();
  }

loadCart(): void {
  const storedCart = localStorage.getItem('cart');
  try {
    const parsed = storedCart ? JSON.parse(storedCart) : [];
    this.cartItems = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    this.cartItems = [];
    console.error('Carrito corrupto:', e);
  }
}


  addToCart(item: any): void {
    this.cartItems.push(item);
    this.saveCart();
  }

  saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.saveCart();
  }
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      const precio = isNaN(Number(item.totalPrice)) ? 0 : Number(item.totalPrice);
      return total + precio;
    }, 0);
  }

reserve(): void {
  const token = localStorage.getItem('token');
  console.log(token);
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'No estás logueado',
      text: 'Por favor, inicia sesión para continuar con la reserva.',
      confirmButtonText: 'Ir al login'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
    return;
  }

  if (this.cartItems.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Tu carrito está vacío.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const usuarioId = this.authService.getUsuarioId();
  const tipoReserva = 'tiporeserva';
  const estado = 'pendiente';
  const moneda = 'PEN';
  const fechaActual = new Date().toISOString().split('T')[0];
  const total = this.getTotalPrice();
  const cantidadPersonas = Math.max(...this.cartItems.map(item => item.numeroPersonas));

  const fechaInicio = this.cartItems
    .map(item => new Date(item.startDate))
    .reduce((min, curr) => (curr < min ? curr : min)).toISOString();

  const fechaFin = this.cartItems
    .map(item => new Date(item.endDate))
    .reduce((max, curr) => (curr > max ? curr : max)).toISOString();

  const reservaData = {
    usuarioId: usuarioId,
    tipoReserva: tipoReserva,
    estado: estado,
    moneda: moneda,
    precioTotal: total,
    cantidadPersonas: cantidadPersonas,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    fechaReserva: fechaActual,
    notas: 'asdasd',
  };

  this.reservaService.crearReserva(reservaData).subscribe({
    next: (res) => {
      console.log('Reserva creada:', res);
      this.crearItinerarios(res.id);
      Swal.fire({
        icon: 'success',
        title: 'Reserva Exitosa',
        text: 'Tu reserva ha sido realizada.',
        confirmButtonText: 'Aceptar'
      });

      this.cartItems = [];     // Vaciar carrito
      this.saveCart();         // Guardar carrito vacío
    },
    error: (err) => {
      console.error('Error al crear la reserva:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar la reserva.',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}

crearItinerarios(reservaId: number): void {
  const itinerarios = this.cartItems.map(item => ({
    reservaId: reservaId,
    servicioId: item.id,
    fechaInicioActividad: item.startDate,
    fechaFinActividad: item.endDate,
    lugarEncuentro: item.lugarEncuentro,
    observaciones: item.observaciones || "Observaciones del itinerario",
    tipoEvento: item.tipoEvento,
    descripcion: item.descripcion
  }));

  const payload = {
    reservaId: reservaId,
    itinerarios: itinerarios
  };

  console.log("Payload a enviar:", payload);

  this.itinerarioService.crearItinerario(payload).subscribe({
    next: (res) => console.log('Itinerarios creados:', res),
    error: (err) => console.error('Error al crear itinerarios:', err)
  });
}


}
