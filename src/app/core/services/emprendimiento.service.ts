import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmprendimientoService {
  private readonly API_EMPRENDIMIENTOS = 'https://capachica-app-back-production.up.railway.app/emprendimientos';

  private readonly LIST_URL = `${this.API_EMPRENDIMIENTOS}`;
  private readonly DETAIL_URL = (id: number | string) => `${this.API_EMPRENDIMIENTOS}/${id}`;
  private readonly CREATE_URL = `${this.API_EMPRENDIMIENTOS}`;
  private readonly MY_LIST_URL = `${this.API_EMPRENDIMIENTOS}/my/list`;
  private readonly UPDATE_URL = (id: number | string) => `${this.API_EMPRENDIMIENTOS}/${id}`;
  private readonly DELETE_URL = (id: number | string) => `${this.API_EMPRENDIMIENTOS}/${id}`;
  private readonly CHANGE_STATUS_URL = (id: number | string) => `${this.API_EMPRENDIMIENTOS}/${id}/status`;
  private readonly PENDING_LIST_URL = `${this.API_EMPRENDIMIENTOS}/admin/pending`;

  private apiUrl = 'https://capachica-app-back-production.up.railway.app/emprendimientos';
  constructor(private http: HttpClient) { }
  listarEmprendimientosPorUsuario(usuarioId: number): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${this.API_EMPRENDIMIENTOS}/usuario/${usuarioId}`, { headers });
  }

  listarEmprendimientos(params?: any): Observable<any> {
    return this.http.get<any>(this.LIST_URL, { params });
  }
  listarEmprendimientosa(
    pagina: number = 1,
    limite: number = 10,
    filtros?: Record<string, any>
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('limit', limite.toString());

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value != null) params = params.set(key, value);
      });
    }

    return this.http.get<any>(this.apiUrl, { params });
  }
  verEmprendimiento(id: number | string): Observable<any> {
    return this.http.get<any>(this.DETAIL_URL(id));
  }

  crearEmprendimiento(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<any>(this.CREATE_URL, data, { headers });
  }
  getLugarTuristico(id: number): Observable<any> {
    return this.http.get(`https://capachica-app-back-production.up.railway.app/lugares-turisticos/${id}`);
  }
  misEmprendimientos(): Observable<any> {
    return this.http.get<any>(this.MY_LIST_URL, { withCredentials: true });
  }

  actualizarEmprendimiento(id: number | string, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.patch<any>(this.UPDATE_URL(id), data, { headers });
  }

  eliminarEmprendimiento(id: number | string): Observable<any> {
    const token = localStorage.getItem('token'); // Asegúrate que el token está guardado ahí

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete<any>(this.DELETE_URL(id), { headers });
  }

  cambiarEstadoEmprendimiento(id: number | string, estado: string): Observable<any> {
    return this.http.patch<any>(this.CHANGE_STATUS_URL(id), { estado }, { withCredentials: true });
  }

  verPendientes(): Observable<any> {
    return this.http.get<any>(this.PENDING_LIST_URL, { withCredentials: true });
  }

  buscarConFiltros(filtros: any): Observable<any[]> {
    let params = new HttpParams();
    if (filtros.lugar) params = params.set('lugar', filtros.lugar);
    if (filtros.fecha) params = params.set('fecha', filtros.fecha);
    return this.http.get<any[]>(this.LIST_URL, { params });
  }
}
