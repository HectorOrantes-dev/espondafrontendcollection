// Plantilla de configuración de entornos.
// Copia este archivo como `environment.ts` (desarrollo) y
// `environment.prod.ts` (producción) y ajusta los valores.
//
// Nota: en un frontend la apiUrl NO es secreta (viaja en el bundle y es
// visible en el navegador). Aquí solo se centraliza para no repetirla.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
};
