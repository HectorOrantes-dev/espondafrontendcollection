import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehiculo } from '../models/vehiculo.model';
import { toDriveThumbnail } from '../utils/drive-image';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ColeccionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/coleccion`;

  list(etiqueta?: string): Observable<Vehiculo[]> {
    const url = etiqueta
      ? `${this.apiUrl}?etiqueta=${encodeURIComponent(etiqueta)}`
      : this.apiUrl;
    return this.http
      .get<Vehiculo[]>(url)
      .pipe(map((vehiculos) => vehiculos.map((v) => this.normalize(v))));
  }

  getById(id: string): Observable<Vehiculo> {
    return this.http
      .get<Vehiculo>(`${this.apiUrl}/${id}`)
      .pipe(map((v) => this.normalize(v)));
  }

  create(formData: FormData): Observable<Vehiculo> {
    return this.http
      .post<Vehiculo>(this.apiUrl, formData)
      .pipe(map((v) => this.normalize(v)));
  }

  update(id: string, formData: FormData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Descarga solo el Excel con los datos de la colección. */
  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  /** Descarga el respaldo completo (datos + imágenes) en un ZIP. */
  exportBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup`, { responseType: 'blob' });
  }

  /** Corrige las URLs de Drive y asegura valores no nulos. */
  private normalize(v: Vehiculo): Vehiculo {
    return {
      ...v,
      precio: v.precio ?? 0,
      imagenes: (v.imagenes ?? []).map((url) => toDriveThumbnail(url)),
      etiquetas: v.etiquetas ?? [],
    };
  }
}
