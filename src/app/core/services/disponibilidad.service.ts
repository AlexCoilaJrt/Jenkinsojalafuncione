import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private apiUrl = 'https://capachica-app-back-production.up.railway.app/disponibilidad'; // Asegúrate de tener la URL correcta de la API

  constructor(private http: HttpClient) {}

  // Crear una disponibilidad
  crearDisponibilidad(disponibilidad: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, disponibilidad);
  }

  // Obtener todas las disponibilidades
  obtenerDisponibilidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  getDisponibilidad(servicioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicio/${servicioId}`);
  }
   // Crear una nueva disponibilidad
   createDisponibilidad(disponibilidad: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, disponibilidad);
  }

  // Obtener disponibilidades por servicio
  obtenerDisponibilidadPorServicio(servicioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/servicio/${servicioId}`);
  }

  // Obtener disponibilidad por ID
  obtenerDisponibilidadPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar disponibilidad
  actualizarDisponibilidad(id: number, disponibilidad: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, disponibilidad);
  }

  // Eliminar disponibilidad
  eliminarDisponibilidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
