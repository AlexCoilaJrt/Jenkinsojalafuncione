import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TiposServicioService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/tipos-servicio';

    constructor(private http: HttpClient) { }

    // Crear un nuevo tipo de servicio (POST /tipos-servicio)
    crearTipoServicio(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders());
    }

    listarTiposServicio(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders());
    }

    // Obtener un tipo de servicio por ID (GET /tipos-servicio/{id})
    obtenerTipoServicio(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders());
    }

    // Eliminar un tipo de servicio (DELETE /tipos-servicio/{id})
    eliminarTipoServicio(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders());
    }

    // Utilidad: obtener headers con token
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }
    buscarConFiltros(filtros: { nombre?: string; lugar?: string; fecha?: string }): Observable<any[]> {
        let params = new HttpParams();
        if (filtros.nombre) { params = params.set('nombre', filtros.nombre); }
        if (filtros.lugar)  { params = params.set('lugar', filtros.lugar); }
        if (filtros.fecha)  { params = params.set('fecha', filtros.fecha); }
        return this.http.get<any[]>(this.API, { params });
    }
}
