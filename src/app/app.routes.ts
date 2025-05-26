// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    children: [
      {
        // Ruta raíz: muestra el Home (landing)
        path: '',
        loadComponent: () =>
          import('./business/principal/principal.component').then(m => m.PrincipalComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./business/authentication/login/login.component').then(m => m.LoginComponent),
        //canActivate: [AuthenticatedGuard], // Eliminar el guard temporalmente
      },

      {
        path: 'register',
        loadComponent: () =>
          import('./business/authentication/register/register.component')
            .then(m => m.RegisterComponent),
      },
      {
        path: 'verificacion',
        loadComponent: () =>
          import('./business/authentication/password-recovery/password-recovery.component')
            .then(m => m.PasswordRecoveryComponent),
        // canActivate: [AuthenticatedGuard], // Eliminar el guard temporalmente
      },
      {
        path: 'verificacioncodigo',
        loadComponent: () =>
          import('./business/authentication/verification-code/verification-code.component')
            .then(m => m.VerificationCodeComponent),
      },
    ],
  },
  // Rutas privadas
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./business/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'emprendimiento',
        loadComponent: () =>
          import('./business/emprendimiento/emprendimiento.component').then(m => m.EmprendimientoComponent),
      },
      {
        path: 'platos',
        loadComponent: () =>
          import('./business/platos-tipicos/platos-tipicos.component').then(m => m.PlatosTipicosComponent),
      },
      {
        path: 'newplatos',
        loadComponent: () =>
          import('./business/platos-tipicos/form-platos/form-platos.component').then(m => m.FormPlatosComponent),
      },
      {
        path: 'editplatos/:id',
        loadComponent: () =>
          import('./business/platos-tipicos/form-platos/form-platos.component').then(m => m.FormPlatosComponent),
      },
      {
        path: 'paquetes',
        loadComponent: () =>
          import('./business/paquete-turistico/paquete-turistico.component').then(m => m.PaqueteTuristicoComponent),
      },
      {
        path: 'paquetesdetalle/:id',
        loadComponent: () =>
          import('./business/paquetedet/paquetedet.component').then(m => m.PaquetedetComponent),
      },
      {
        path: 'paquetesprin',
        loadComponent: () =>
          import('./business/paqueteprin/paqueteprin.component').then(m => m.PaqueteprinComponent),
      },
      {
        path: 'newpaquetes',
        loadComponent: () =>
          import('./business/paquete-turistico/form-paquete/form-paquete.component').then(m => m.FormPaqueteComponent),
      },
      {
        path: 'editpaquetes/:id',
        loadComponent: () =>
          import('./business/paquete-turistico/form-paquete/form-paquete.component').then(m => m.FormPaqueteComponent),
      },
      {
        path: 'newemprendimiento',
        loadComponent: () =>
          import('./business/emprendimiento/form-emprendimiento/form-emprendimiento.component').then(m => m.FormEmprendimientoComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./business/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'detalles/:id',
        loadComponent: () =>
          import('./business/detemprendedor/detemprendedor.component').then(m => m.DetemprendedorComponent),
      },
      {
        path: 'sidebar',
        loadComponent: () =>
          import('./business/sidebar/sidebar.component').then(m => m.SidebarComponent),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./business/role-list/role-list.component').then(m => m.RoleListComponent),
      },
      {
        path: 'newrol',
        loadComponent: () =>
          import('./business/role-list/rol-form/rol-form.component').then(m => m.RolFormComponent),
      },
      {
        path: 'editrol/:id',
        loadComponent: () =>
          import('./business/role-list/rol-form/rol-form.component').then(m => m.RolFormComponent),
      },
      {
        path: 'usuario',
        loadComponent: () =>
          import('./super-admin/usuario/usuario.component').then(m => m.UsuarioComponent),
      },
      {
        path: 'newusuario',
        loadComponent: () =>
          import('./super-admin/usuario/form-usuario/form-usuario.component').then(m => m.FormUsuarioComponent),
      },
      {
        path: 'editusuario/:id',
        loadComponent: () =>
          import('./super-admin/usuario/form-usuario/form-usuario.component').then(m => m.FormUsuarioComponent),
      },
      {
        path: 'lugares-turisticos',
        loadComponent: () => import('./business/lugares-turisticos/lugares-turisticos.component').then(m => m.LugaresTuristicosComponent),
      },
      {
        path: 'newlugar',
        loadComponent: () => import('./business/lugares-turisticos/form-lugar/form-lugar.component').then(m => m.FormLugarComponent),
      },
      {
        path: 'editlugar/:id',
        loadComponent: () => import('./business/lugares-turisticos/form-lugar/form-lugar.component').then(m => m.FormLugarComponent),
      },
      {
        path: 'sliders',
        loadComponent: () => import('./business/sliders/sliders.component').then(m => m.SlidersComponent),
      },
      {
        path: 'newslider',
        loadComponent: () => import('./business/sliders/form-slider/form-slider.component').then(m => m.FormSliderComponent),
      },
      {
        path: 'editslider/:id',
        loadComponent: () => import('./business/sliders/form-slider/form-slider.component').then(m => m.FormSliderComponent),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./business/servicios/servicios.component').then(m => m.ServicioComponent),
      },
      {
        path: 'newservicio', // Ruta para crear nuevo servicio
        loadComponent: () =>
          import('./business/servicios/form-servicios/form-servicios.component').then(m => m.FormServiciosComponent),
      },
      {
        path: 'editservicio/:id', // Ruta para editar un servicio existente
        loadComponent: () =>
          import('./business/servicios/form-servicios/form-servicios.component').then(m => m.FormServiciosComponent),
      },
      {
        path: 'tipos-servicio', // Ruta para ver todos los tipos de servicio
        loadComponent: () =>
          import('./business/tipos-servicio/tipos-servicio.component').then(m => m.TiposServicioComponent),
      },
      {
        path: 'newtipos-servicio', // Ruta para crear un nuevo tipo de servicio
        loadComponent: () =>
          import('./business/tipos-servicio/form-tipos-servicio/form-tipos-servicio.component').then(m => m.FormTiposServicioComponent),
      },
      {
        path: 'edittipos-servicio/:id', // Ruta para editar un tipo de servicio existente
        loadComponent: () =>
          import('./business/tipos-servicio/form-tipos-servicio/form-tipos-servicio.component').then(m => m.FormTiposServicioComponent),
      },

      {
        path: 'disponibilidad', // Ruta para ver todas las disponibilidades
        loadComponent: () =>
          import('./business/disponibilidad/disponibilidad.component').then(m => m.DisponibilidadComponent),
      },
      {
        path: 'newdisponibilidad', // Ruta para crear nueva disponibilidad
        loadComponent: () =>
          import('./business/disponibilidad/form-disponibilidad/form-disponibilidad.component').then(m => m.FormDisponibilidadComponent),
      },
      {
        path: 'editdisponibilidad/:id', // Ruta para editar una disponibilidad existente
        loadComponent: () =>
          import('./business/disponibilidad/form-disponibilidad/form-disponibilidad.component').then(m => m.FormDisponibilidadComponent),
      },
      {
        path: 'prinemprendimiento', // Ruta para ver todas las disponibilidades
        loadComponent: () =>
          import('./business/prinemprendimiento/prinemprendimiento.component').then(m => m.PrinemprendimientoComponent),
      },

      {
        path: 'prinlugares', // Ruta para ver todas las disponibilidades
        loadComponent: () =>
          import('./business/prinlugares/prinlugares.component').then(m => m.PrinlugaresComponent),
      },
      {
        path: 'prinservicios/:id', // Ruta para ver todas las disponibilidades
        loadComponent: () =>
          import('./business/prinservicios/prinservicios.component').then(m => m.PrinserviciosComponent),
      },
      {
        path: 'serviciosdetalle/:id',
        loadComponent: () =>
          import('./business/prinservicios/detprinservicios/detprinservicios.component').then(m => m.DetprinserviciosComponent),
      },
      {
        path: 'setprinlugares/:id',
        loadComponent: () =>
          import('./business/prinlugares/detprinlugares/detprinlugares.component').then(m => m.DetprinlugaresComponent),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./business/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'reserva',
        loadComponent: () =>
          import('./business/reserva/reserva.component').then(m => m.ReservaComponent),
      },
      {
        path: 'newreserva',
        loadComponent: () =>
          import('./business/reserva/form-reserva/form-reserva.component').then(m => m.FormReservaComponent),
      },
      {
        path: 'editreserva/:id',
        loadComponent: () =>
          import('./business/reserva/form-reserva/form-reserva.component').then(m => m.FormReservaComponent),
      },
      {
        path: 'misreservas',
        loadComponent: () =>
          import('./business/misreservas/misreservas.component').then(m => m.MisreservasComponent),
      },
      {
        path: 'lugardetalle/:id',
        loadComponent: () =>
          import('./business/prinlugares/detprinlugares/detprinlugares.component').then(m => m.DetprinlugaresComponent),
      },     
      {
        path: 'emprendimientodetalle/:id',
        loadComponent: () =>
          import('./business/prinemprendimiento/detemprendimiento/detemprendimiento.component').then(m => m.DetprinEmprendimientoComponent),
      },
      {
        path: 'emprendimientos/editar/:id',
        loadComponent: () => import('./business/emprendimiento/form-emprendimiento/form-emprendimiento.component')
          .then(m => m.FormEmprendimientoComponent),
        data: { isEdit: true }
      },

    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
