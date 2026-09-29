import type { AssetKind } from '../../../lib/data';

const LONG_EDGE = 1280;
const QUALITY = 0.72;

export interface Taken {
  name: string;
  kind: AssetKind;
  format: string;
  bytes: number;
  url: string;
  width?: number;
  height?: number;
}

const kindOfFile = (type: string): AssetKind => {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'document';
};

const formatOfFile = (file: File): string => {
  const dot = file.name.lastIndexOf('.');
  if (dot > 0) return file.name.slice(dot + 1).toUpperCase();
  return file.type.split('/')[1]?.toUpperCase() ?? 'FILE';
};

const shrink = (dataUrl: string): Promise<{ url: string; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, LONG_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const brush = canvas.getContext('2d');
      if (brush === null) {
        reject(new Error('canvas unavailable'));
        return;
      }
      brush.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve({
        url: canvas.toDataURL('image/jpeg', QUALITY),
        width: image.width,
        height: image.height,
      });
    };
    image.onerror = () => reject(new Error('unreadable picture'));
    image.src = dataUrl;
  });

export function readFile(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ taken: Taken; warning?: string }> {
  return new Promise((resolve, reject) => {
    const kind = kindOfFile(file.type);
    const reader = new FileReader();
    const base: Taken = {
      name: file.name,
      kind,
      format: formatOfFile(file),
      bytes: file.size,
      url: '',
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    reader.onerror = () => reject(new Error('That file could not be read.'));

    reader.onload = () => {
      onProgress(100);
      if (kind !== 'image') {
        resolve({ taken: base });
        return;
      }

      shrink(reader.result as string)
        .then((small) =>
          resolve({ taken: { ...base, url: small.url, width: small.width, height: small.height } }),
        )
        .catch(() =>
          resolve({ taken: base, warning: 'The picture would not open, so it went in without one.' }),
        );
    };

    if (kind === 'image') reader.readAsDataURL(file);
    else reader.readAsArrayBuffer(file);
  });
}
