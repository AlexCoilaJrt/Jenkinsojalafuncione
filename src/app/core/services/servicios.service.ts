import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/servicios';

    constructor(private http: HttpClient) { }

    // Crear un nuevo servicio (POST /servicios)
    crearServicio(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicio creado:', res))
        );
    }

    // Obtener todos los servicios (GET /servicios)
    listarServicios(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicios obtenidos:', res))
        );
    }

    // Obtener servicios por emprendimiento (GET /servicios/emprendimiento/{emprendimientoId})
    listarServiciosPorEmprendimiento(emprendimientoId: string): Observable<any> {
        return this.http.get(`${this.API}/emprendimiento/${emprendimientoId}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicios por emprendimiento:', res))
        );
    }

    // Obtener un servicio por ID (GET /servicios/{id})
    obtenerServicio(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicio obtenido:', res))
        );
    }

    // Actualizar un servicio (PATCH /servicios/{id})
    actualizarServicio(id: number | string, data: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicio actualizado:', res))
        );
    }

    // Eliminar un servicio (DELETE /servicios/{id})
    eliminarServicio(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicio eliminado:', res))
        );
    }

    // Actualizar el estado de un servicio (PATCH /servicios/{id}/estado)
    actualizarEstadoServicio(id: number | string, estado: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}/estado`, estado, this.getAuthHeaders()).pipe(
            tap(res => console.log('Estado del servicio actualizado:', res))
        );
    }

    // Obtener servicios por tipo de servicio (GET /servicios/tipo-servicio/{tipoServicioId})
    listarServiciosPorTipo(tipoServicioId: string): Observable<any> {
      return this.http.get(`${this.API}/tipo-servicio/${tipoServicioId}`, this.getAuthHeaders());
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
