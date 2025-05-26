import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private readonly API = 'https://capachica-app-back-production.up.railway.app/resenas'; // URL de la API de reseñas

  constructor(private http: HttpClient) { }

  // Obtener todas las reseñas (GET /resenas)
  obtenerReseñas(): Observable<any> {
    return this.http.get(this.API, this.getAuthHeaders());
  }

  // Obtener reseña por ID (GET /resenas/{id})
  obtenerReseñaPorId(id: number | string): Observable<any> {
    return this.http.get(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
      tap(res => console.log('Reseña obtenida:', res))
    );
  }
  obtenerReseñasPorServicio(servicioId: number | string): Observable<any> {
    return this.http.get(`${this.API}/servicio/${servicioId}`, this.getAuthHeaders());
  }

  // Obtener el promedio de calificación por servicio (GET /resenas/promedio/{servicioId})
  obtenerPromedioDeCalificacion(servicioId: number | string): Observable<any> {
    return this.http.get(`${this.API}/promedio/${servicioId}`, this.getAuthHeaders());
  }

  // Headers con token de autenticación
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
