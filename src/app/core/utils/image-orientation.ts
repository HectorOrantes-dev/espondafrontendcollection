/**
 * Garantiza que una imagen se suba SIEMPRE en orientación vertical (retrato).
 *
 * Estrategia robusta (compatible con todos los navegadores móviles):
 *
 * 1. Lee la etiqueta EXIF Orientation directamente del binario JPEG para no
 *    depender del soporte inconsistente de `createImageBitmap`.
 * 2. Carga los píxeles "crudos" (sin auto-corrección EXIF) y aplica la
 *    rotación/espejo manualmente en Canvas.
 * 3. Si la imagen corregida sigue siendo horizontal (ancho > alto), la rota
 *    90° en sentido horario para dejarla en retrato.
 *
 * Así, sin importar cómo se sostenga el celular al tomar o aceptar la foto,
 * la imagen se guarda siempre en vertical.
 */

// ─── EXIF reader ────────────────────────────────────────────────────────────

/**
 * Lee la etiqueta Orientation (0x0112) de los metadatos EXIF de un JPEG.
 * Devuelve un valor 1–8.  Si no puede leerla devuelve 1 (sin rotación).
 */
function readExifOrientation(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);

  // Verificar SOI (Start Of Image) de JPEG
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1;

  let offset = 2;
  const maxOffset = Math.min(view.byteLength, 65536); // EXIF siempre está al inicio

  while (offset + 4 < maxOffset) {
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 = 0xFFE1 (contiene EXIF)
    if (marker === 0xffe1) {
      if (offset + 2 > maxOffset) return 1;
      const segLen = view.getUint16(offset);
      if (offset + segLen > view.byteLength) return 1;

      // Verificar cadena "Exif\0\0"
      if (
        offset + 10 > maxOffset ||
        view.getUint32(offset + 2) !== 0x45786966 || // "Exif"
        view.getUint16(offset + 6) !== 0x0000
      ) {
        return 1;
      }

      const tiffStart = offset + 8;

      // Byte order: 0x4949 = little-endian (II), 0x4D4D = big-endian (MM)
      const byteOrder = view.getUint16(tiffStart);
      const le = byteOrder === 0x4949;

      // Leer offset del IFD0
      if (tiffStart + 8 > maxOffset) return 1;
      const ifdOffset = view.getUint32(tiffStart + 4, le);
      const ifdStart = tiffStart + ifdOffset;

      if (ifdStart + 2 > maxOffset) return 1;
      const entries = view.getUint16(ifdStart, le);

      for (let i = 0; i < entries; i++) {
        const entryOffset = ifdStart + 2 + i * 12;
        if (entryOffset + 12 > maxOffset) break;
        const tag = view.getUint16(entryOffset, le);
        if (tag === 0x0112) {
          // Tag Orientation encontrada
          return view.getUint16(entryOffset + 8, le);
        }
      }
      return 1; // APP1 sin tag Orientation
    }

    // Saltar otros segmentos APP / marcadores
    if ((marker & 0xff00) === 0xff00 && marker !== 0xffff) {
      if (offset + 2 > maxOffset) break;
      offset += view.getUint16(offset);
    } else {
      break;
    }
  }

  return 1;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Carga un File como HTMLImageElement (el browser NO aplica EXIF aquí). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen'));
    };
    img.src = url;
  });
}

// ─── Función principal ─────────────────────────────────────────────────────

export async function toPortraitImage(file: File): Promise<File> {
  try {
    // 1. Leer orientación EXIF del binario
    const buffer = await file.arrayBuffer();
    const orientation = readExifOrientation(buffer);

    // 2. Cargar la imagen como HTMLImageElement
    const img = await loadImage(file);
    const rawW = img.naturalWidth;
    const rawH = img.naturalHeight;

    // 3. Primer canvas: aplicar corrección EXIF manualmente
    const c1 = document.createElement('canvas');
    const ctx1 = c1.getContext('2d');
    if (!ctx1) return file;

    // Las orientaciones 5-8 intercambian ancho y alto
    const swapDims = orientation >= 5 && orientation <= 8;
    c1.width = swapDims ? rawH : rawW;
    c1.height = swapDims ? rawW : rawH;

    // Aplicar la transformación que indica EXIF
    //
    // Referencia EXIF Orientation:
    //   1 = Normal
    //   2 = Espejo horizontal
    //   3 = Rotado 180°
    //   4 = Espejo vertical
    //   5 = Transpuesta  (90° CW  + espejo H)
    //   6 = Rotada 90° CW
    //   7 = Transversa   (90° CCW + espejo H)
    //   8 = Rotada 90° CCW
    switch (orientation) {
      case 2:
        ctx1.scale(-1, 1);
        ctx1.drawImage(img, -rawW, 0);
        break;
      case 3:
        ctx1.translate(rawW, rawH);
        ctx1.rotate(Math.PI);
        ctx1.drawImage(img, 0, 0);
        break;
      case 4:
        ctx1.scale(1, -1);
        ctx1.drawImage(img, 0, -rawH);
        break;
      case 5:
        ctx1.translate(c1.width / 2, c1.height / 2);
        ctx1.rotate(Math.PI / 2);
        ctx1.scale(-1, 1);
        ctx1.drawImage(img, -rawW / 2, -rawH / 2);
        break;
      case 6:
        ctx1.translate(c1.width / 2, c1.height / 2);
        ctx1.rotate(Math.PI / 2);
        ctx1.drawImage(img, -rawW / 2, -rawH / 2);
        break;
      case 7:
        ctx1.translate(c1.width / 2, c1.height / 2);
        ctx1.rotate(-Math.PI / 2);
        ctx1.scale(-1, 1);
        ctx1.drawImage(img, -rawW / 2, -rawH / 2);
        break;
      case 8:
        ctx1.translate(c1.width / 2, c1.height / 2);
        ctx1.rotate(-Math.PI / 2);
        ctx1.drawImage(img, -rawW / 2, -rawH / 2);
        break;
      default: // 1 o desconocido
        ctx1.drawImage(img, 0, 0);
        break;
    }

    // 4. Segundo canvas: forzar retrato si sigue siendo paisaje
    let finalCanvas = c1;
    const corrW = c1.width;
    const corrH = c1.height;

    if (corrW > corrH) {
      const c2 = document.createElement('canvas');
      c2.width = corrH;
      c2.height = corrW;
      const ctx2 = c2.getContext('2d');
      if (ctx2) {
        ctx2.translate(c2.width / 2, c2.height / 2);
        ctx2.rotate(Math.PI / 2);
        ctx2.drawImage(c1, -corrW / 2, -corrH / 2);
        finalCanvas = c2;
      }
    }

    // 5. Exportar como JPEG
    const blob = await new Promise<Blob | null>((resolve) =>
      finalCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    // Si algo falla, devolver el archivo original sin modificar
    return file;
  }
}
