import { EtiquetaRef } from './etiqueta.model';

export interface Vehiculo {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  precio: number;
  imagenes: string[];
  etiquetas: EtiquetaRef[];
  created_at: string;
  updated_at: string;
}
