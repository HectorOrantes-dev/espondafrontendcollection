import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etiqueta } from '../models/etiqueta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EtiquetasService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/etiquetas`;

  list(): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(this.baseUrl);
  }

  create(nombre: string): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(this.baseUrl, { nombre });
  }

  update(id: string, nombre: string): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}`, { nombre });
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
