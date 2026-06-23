/**
 * Devuelve una copia de la imagen SIEMPRE en orientación vertical (retrato):
 *
 * 1. Aplica la orientación EXIF (corrige fotos "de cabeza" o giradas por el
 *    sensor de la cámara) al decodificar.
 * 2. Si la imagen resultante es horizontal (ancho > alto), la rota 90° para
 *    dejarla vertical.
 *
 * Así, sin importar cómo se sostenga la cámara, la foto se guarda vertical.
 * Si algo falla (navegador sin soporte), devuelve el archivo original.
 */
export async function toPortraitImage(file: File): Promise<File> {
  try {
    // imageOrientation: 'from-image' respeta la rotación EXIF de la cámara
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });

    const { width, height } = bitmap;
    const isLandscape = width > height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    if (isLandscape) {
      // Rotar 90° en sentido horario para volverla vertical
      canvas.width = height;
      canvas.height = width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(bitmap, -width / 2, -height / 2);
    } else {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(bitmap, 0, 0);
    }
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
