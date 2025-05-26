import { Component, Input, OnInit } from '@angular/core';
import { SidebarComponent } from "../../sidebar/sidebar.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../sidebar/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-form-platos',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, ReactiveFormsModule],
  templateUrl: './form-platos.component.html',
  styleUrl: './form-platos.component.css'
})
export class FormPlatosComponent implements OnInit{
  platoForm: FormGroup;
  isEdit: boolean = false;
  currentPlato: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,  // Inyectamos ActivatedRoute para acceder a los parámetros de la URL
    // private platoService: PlatoService
  ) {
    this.platoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],
      region: ['', Validators.required],
      origen: ['', Validators.required],
      tipo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.platoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],
      region: ['', Validators.required],
      origen: ['', Validators.required],
      tipo: ['', Validators.required]
    });

    this.loadPlatoData();

  }

  loadPlatoData(): void {
    const id = this.route.snapshot.paramMap.get('id');
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

    if (id) {
      this.isEdit = true;  // Activamos el modo de edición si existe un id

      // Buscamos el plato correspondiente al 'id'
      const plato = simulatedData.platos_tipicos.find(p => p.id.toString() === id);

      if (plato) {
        this.currentPlato = plato;
        this.platoForm.patchValue(plato);  // Rellenamos el formulario con los datos del plato
      }
    } else {
      // Si no hay id, mantenemos el modo de creación
      this.isEdit = false;
    }
  }

  guardarPlato(): void {
    if (this.platoForm.valid) {
      const nuevoPlato = this.platoForm.value;
      console.log('Plato guardado:', nuevoPlato);
      // Aquí puedes hacer el envío de los datos al backend, si es necesario
    }
  }
  cancelar(): void {
    this.router.navigate(['/plato']);
  }
}
