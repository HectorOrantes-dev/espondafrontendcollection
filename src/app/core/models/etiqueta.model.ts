export interface Etiqueta {
  id: string;
  nombre: string;
  cantidad: number; // cuántos vehículos la tienen
  created_at: string;
}

/** Etiqueta tal como viene anidada dentro de un vehículo. */
export interface EtiquetaRef {
  id: string;
  nombre: string;
}
