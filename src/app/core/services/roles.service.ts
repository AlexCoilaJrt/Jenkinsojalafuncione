import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly API = 'https://capachica-app-back-production.up.railway.app/roles';

  constructor(private http: HttpClient) {}

  // Crear nuevo rol
  crearRol(data: any): Observable<any> {
    return this.http.post(this.API, data, this.getAuthHeaders());
  }

  // Listar todos los roles
  listarRoles(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(this.API, { headers });
  }

  // Obtener un rol por ID
  obtenerRol(id: number | string): Observable<any> {
    return this.http.get(`${this.API}/${id}`, this.getAuthHeaders());
  }

  // Actualizar un rol
  actualizarRol(id: number | string, data: any): Observable<any> {
    return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders());
  }

  // Eliminar un rol
  eliminarRol(id: number | string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders());
  }

  // Asignar permiso a un rol
  asignarPermiso(id: number | string, data: any): Observable<any> {
    return this.http.post(`${this.API}/${id}/permissions`, data, this.getAuthHeaders());
  }

  // Opcional: método para reutilizar headers con token
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
