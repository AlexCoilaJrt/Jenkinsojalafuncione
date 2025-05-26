import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../navbar/navbar.component";
import { ActivatedRoute, Router } from '@angular/router';
import { ServiciosService } from '../../../core/services/servicios.service';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { ResenaService } from '../../../core/services/resenas.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detprinservicios',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './detprinservicios.component.html',
  styleUrls: ['./detprinservicios.component.css']
})
export class DetprinserviciosComponent implements OnInit {
  mapUrl!: SafeResourceUrl;
  emprendimientos: any = {};
  servicios: any = {};
  resenas: any[] = [];
  usuarios: any = {};
  dateForm: FormGroup;
  totalPrice: number | null = null;
  numeroPersonas: number = 1; // Valor por defecto

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService,
    private resenaService: ResenaService,
    private usuarioService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private emprendimientoService: EmprendimientoService,
    public router: Router,
  ) {
    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      numeroPersonas: [1],
    });
    this.dateForm.valueChanges.subscribe(values => {
      this.calculatePrice(values.startDate, values.endDate, values.numeroPersonas);
    });

  }

  ngOnInit() {
    initFlowbite();
    this.obtenerServicio();
    this.obtenerReseñasPorServicio();
    this.dateForm.get('numeroPersonas')?.valueChanges.subscribe(value => {
      this.numeroPersonas = value;
    });
  }

  calculatePrice(startDate: string, endDate: string, numeroPersonas: number): void {
    if (numeroPersonas > 0) {
      if (this.servicios.tipoServicioId === 3 && startDate && endDate) {
        // Si tipoServicioId es 3, calculamos las noches y luego el precio
        const start = new Date(startDate);
        const end = new Date(endDate);
        const differenceInTime = end.getTime() - start.getTime();
        const nights = differenceInTime / (1000 * 3600 * 24);  // Cálculo de noches

        // Precio final para tipoServicioId === 3
        this.totalPrice = (nights * this.servicios.precioBase * numeroPersonas);
      } else {
        // Para otros tipos de servicio, solo se multiplica por el precio base y el número de personas
        this.totalPrice = (this.servicios.precioBase * numeroPersonas);
      }
      console.log(this.totalPrice);
    } else {
      this.totalPrice = null;
    }
  }

  obtenerServicio(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviciosService.obtenerServicio(id).subscribe({
        next: (servicio) => {
          this.servicios = servicio;
          this.buildMapUrl(servicio.latitud, servicio.longitud);
          // Extraer el emprendimientoId del primer elemento de serviciosEmprendedores
          const rel = servicio.serviciosEmprendedores?.[0];
          const empId = rel?.emprendimientoId;
          if (empId != null) {
            this.obtenerEmprendedor(empId);
          }
        },
        error: (err) => {
          console.error('Error al obtener detalles del servicio:', err);
        }
      });
    }
  }

  obtenerEmprendedor(emprendimientoId: number): void {
    this.emprendimientoService.verEmprendimiento(emprendimientoId).subscribe({
      next: data => {
        console.log(data)
        this.emprendimientos = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el emprendimiento.', 'error');
      }
    });
  }
  verDetallesEmprendimiento(id: number) {
    this.router.navigate([`/emprendimientodetalle/${id}`]);
  }
  private buildMapUrl(lat: number, lng: number): void {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  obtenerReseñasPorServicio(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.resenaService.obtenerReseñasPorServicio(id).subscribe(
        (data) => {
          this.resenas = data;
          this.resenas.forEach((resena: any) => {
            this.usuarioService.getUsuarioById(resena.usuarioId).subscribe(
              (usuario) => {
                this.usuarios = usuario;
              },
              (error) => {
                console.error('Error al obtener el usuario:', error);
              }
            );
          });
        },
        (error) => {
          console.error('Error al obtener las reseñas:', error);
        }
      );
    }
  }

  addToCart(): void {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(item => item.id === this.servicios.id);

    if (existingItem) {
      Swal.fire({
        icon: 'info',
        title: '¡Ya tienes esta reserva!',
        text: 'Este servicio ya está en tu carrito.',
        confirmButtonText: 'Aceptar'
      });
    } else {
      // Obtener startDate y endDate del formulario
      let startDate = this.dateForm.value.startDate;
      let endDate = this.dateForm.value.endDate;

      // Si tipoServicioId === 3, asignar endDate = startDate
      if (this.servicios.tipoServicioId !== 3) {
        endDate = startDate;
      }

      const cartItem: CartItem = {
        id: this.servicios.id,
        nombre: this.servicios.nombre,
        lugarEncuentro: `${this.servicios.latitud},${this.servicios.longitud}`,
        precio: this.servicios.precioBase,
        moneda: this.servicios.moneda,
        observaciones: this.servicios.detallesServicio?.Observaciones || 'Sin observaciones',
        tipoEvento: this.servicios.tipoServicio.nombre,
        descripcion: this.servicios.descripcion,
        imagen: this.servicios.imagenes?.[0]?.url || 'default.jpg',
        startDate: startDate,
        endDate: endDate,
        numeroPersonas: this.numeroPersonas,
        totalPrice: this.totalPrice
      };
      console.log("carrito:", cartItem)
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      this.router.navigateByUrl('/', { skipLocationChange: true })

      Swal.fire({
        icon: 'success',
        title: '¡Producto añadido al carrito!',
        text: 'Ahora puedes continuar con la reserva.',
        confirmButtonText: 'Aceptar'
      });
    }
  }


  currentSlide = 0;

  resetCarousel() {
    this.currentSlide = 0;
  }

  prevSlide() {
    const len = this.servicios.imagenes.length;
    this.currentSlide = (this.currentSlide - 1 + len) % len;
  }

  nextSlide() {
    const len = this.servicios.imagenes.length;
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
  lugarEncuentro: string;
  startDate: string;
  imagen: string;
  observaciones: string | null;
  descripcion: string;
  moneda: string;
  tipoEvento: string;
  endDate: string;
  numeroPersonas: number;
  totalPrice: number | null;
}
