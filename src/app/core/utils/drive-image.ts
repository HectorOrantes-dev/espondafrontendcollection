/**
 * Normaliza una URL de imagen de Google Drive al formato `thumbnail`, que es
 * el único que permite incrustar la imagen de forma confiable en un <img>.
 *
 * Los formatos `lh3.googleusercontent.com/d/ID` y `uc?export=view&id=ID`
 * dejaron de funcionar para hotlinking. `drive.google.com/thumbnail?id=ID`
 * sigue funcionando.
 */
export function toDriveThumbnail(url: string, size = 1000): string {
  const id = extractDriveId(url);
  if (!id) return url; // no es una URL de Drive reconocible, se deja igual
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

function extractDriveId(url: string): string | null {
  if (!url) return null;

  // https://lh3.googleusercontent.com/d/FILEID
  const lh3 = url.match(/googleusercontent\.com\/d\/([^/?=&]+)/);
  if (lh3) return lh3[1];

  // https://drive.google.com/uc?export=view&id=FILEID
  // https://drive.google.com/thumbnail?id=FILEID
  const idParam = url.match(/[?&]id=([^&]+)/);
  if (idParam) return idParam[1];

  // https://drive.google.com/file/d/FILEID/view
  const fileD = url.match(/\/file\/d\/([^/?=&]+)/);
  if (fileD) return fileD[1];

  return null;
}
