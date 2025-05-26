import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaqueteTuristicoService {
    private readonly API = 'https://capachica-app-back-production.up.railway.app/paquetes-turisticos';

    constructor(private http: HttpClient) { }

    // Crear un nuevo paquete turístico (POST /paquetes-turisticos)
    crearPaqueteTuristico(data: any): Observable<any> {
        return this.http.post(this.API, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Paquete turístico creado:', res))
        );
    }

    // Obtener todos los paquetes turísticos (GET /paquetes-turisticos)
    listarPaquetesTuristicos(): Observable<any> {
        return this.http.get(this.API, this.getAuthHeaders());
    }

    // Obtener un paquete turístico por ID (GET /paquetes-turisticos/{id})
    obtenerPaqueteTuristico(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Paquete turístico obtenido:', res))
        );
    }

    // Actualizar un paquete turístico (PATCH /paquetes-turisticos/{id})
    actualizarPaqueteTuristico(id: number | string, data: any): Observable<any> {
        return this.http.patch(`${this.API}/${id}`, data, this.getAuthHeaders()).pipe(
            tap(res => console.log('Paquete turístico actualizado:', res))
        );
    }

    // Eliminar un paquete turístico (DELETE /paquetes-turisticos/{id})
    eliminarPaqueteTuristico(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Paquete turístico eliminado:', res))
        );
    }

    // Agregar servicios a un paquete turístico (POST /paquetes-turisticos/{id}/servicios)
    agregarServiciosAUnPaquete(id: number | string, servicios: any): Observable<any> {
        return this.http.post(`${this.API}/${id}/servicios`, servicios, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicios agregados al paquete turístico:', res))
        );
    }

    // Eliminar un servicio de un paquete turístico (DELETE /paquetes-turisticos/{id}/servicios/{servicioId})
    eliminarServicioDePaquete(id: number | string, servicioId: number | string): Observable<any> {
        return this.http.delete(`${this.API}/${id}/servicios/${servicioId}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Servicio eliminado del paquete turístico:', res))
        );
    }

    // Obtener estadísticas de un paquete turístico (GET /paquetes-turisticos/{id}/estadisticas)
    obtenerEstadisticasDePaquete(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}/estadisticas`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Estadísticas del paquete turístico:', res))
        );
    }

    // Exportar datos de un paquete turístico (GET /paquetes-turisticos/{id}/exportar)
    exportarPaqueteTuristico(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}/exportar`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Datos exportados del paquete turístico:', res))
        );
    }

    // Crear disponibilidad para un paquete turístico (POST /paquetes-turisticos/{id}/disponibilidad)
    crearDisponibilidad(id: number | string, disponibilidad: any): Observable<any> {
        return this.http.post(`${this.API}/${id}/disponibilidad`, disponibilidad, this.getAuthHeaders()).pipe(
            tap(res => console.log('Disponibilidad creada para el paquete turístico:', res))
        );
    }

    // Obtener todas las disponibilidades de un paquete turístico (GET /paquetes-turisticos/{id}/disponibilidad)
    obtenerDisponibilidad(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/${id}/disponibilidad`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Disponibilidades del paquete turístico:', res))
        );
    }

    // Obtener una disponibilidad específica (GET /paquetes-turisticos/disponibilidad/{id})
    obtenerDisponibilidadEspecifica(id: number | string): Observable<any> {
        return this.http.get(`${this.API}/disponibilidad/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Disponibilidad específica:', res))
        );
    }

    // Actualizar una disponibilidad (PATCH /paquetes-turisticos/disponibilidad/{id})
    actualizarDisponibilidad(id: number | string, disponibilidad: any): Observable<any> {
        return this.http.patch(`${this.API}/disponibilidad/${id}`, disponibilidad, this.getAuthHeaders()).pipe(
            tap(res => console.log('Disponibilidad actualizada:', res))
        );
    }

    // Eliminar una disponibilidad (DELETE /paquetes-turisticos/disponibilidad/{id})
    eliminarDisponibilidad(id: number | string): Observable<any> {
        return this.http.delete(`${this.API}/disponibilidad/${id}`, this.getAuthHeaders()).pipe(
            tap(res => console.log('Disponibilidad eliminada:', res))
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
    buscarConFiltros(filtros: any): Observable<any[]> {
        let params = new HttpParams();
        if (filtros.lugar) params = params.set('lugar', filtros.lugar);
        if (filtros.fecha) params = params.set('fecha', filtros.fecha);
        return this.http.get<any[]>(this.API, { params });
      }
}
