import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItinerarioService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/itinerarios';

    constructor(private http: HttpClient) { }

    // Crear un nuevo itinerario
    crearItinerario(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders());
    }

    // Obtener todos los itinerarios
    listarItinerarios(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders());
    }

    // Obtener un itinerario por ID
    obtenerItinerario(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders());
    }

    // Actualizar un itinerario
    actualizarItinerario(id: number | string, data: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders());
    }

    // Eliminar un itinerario
    eliminarItinerario(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders());
    }

    // Reutilizar headers con token
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }
}
