import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservasService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/reservas';

    constructor(private http: HttpClient) {}

    // Crear una nueva reserva (POST /reservas)
    crearReserva(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Reserva creada:', res))
        );
    }

    // Obtener todas las reservas (GET /reservas)
    listarReservas(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders()).pipe(
            tap(res => console.log('Reservas obtenidas:', res))
        );
    }

    // Obtener una reserva por ID (GET /reservas/{id})
    obtenerReserva(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Reserva obtenida:', res))
        );
    }

    // Actualizar una reserva (PATCH /reservas/{id})
    actualizarReserva(id: number | string, data: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Reserva actualizada:', res))
        );
    }

    // Eliminar una reserva (DELETE /reservas/{id})
    eliminarReserva(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Reserva eliminada:', res))
        );
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
