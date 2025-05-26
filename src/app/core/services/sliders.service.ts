import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlidersService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/sliders';

    constructor(private http: HttpClient) { }

    // Crear un nuevo slider (POST /sliders)
    crearSlider(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Slider creado:', res))
        );
    }

    // Obtener todos los sliders (GET /sliders)
    listarSliders(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders());
    }

    // Obtener un slider por ID (GET /sliders/{id})
    obtenerSlider(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Slider obtenido:', res))
        );
    }

    // Actualizar un slider (PATCH /sliders/{id})
    actualizarSlider(id: number | string, data: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Slider actualizado:', res))
        );
    }

    // Eliminar un slider (DELETE /sliders/{id})
    eliminarSlider(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Slider eliminado:', res))
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
