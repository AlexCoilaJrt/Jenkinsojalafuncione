import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../sidebar/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent,NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private router: Router) {}

  logout() {
    // Lógica para cerrar sesión (como limpiar almacenamiento local, etc.)

    // Redirigir al home después de hacer logout
    this.router.navigate(['/home']);
  }
}
