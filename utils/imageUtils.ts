const DEFAULT_MAX_CHARS = 450000;

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 128);
  return cleaned || `id-${Date.now()}`;
}

export function clampImageString(val?: string | null, maxChars = 480000): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.length <= maxChars) return trimmed;
  // Never slice a base64 data URI mid-stream (it creates broken corrupt images)
  if (trimmed.startsWith('data:')) {
    return '';
  }
  return trimmed.slice(0, maxChars);
}

export function compressImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.72,
  maxChars = DEFAULT_MAX_CHARS
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl.length <= maxChars ? dataUrl : '');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl.length <= maxChars ? dataUrl : '');
          return;
        }

        let dim = maxDimension;
        let q = quality;
        let result = '';

        // Iteratively compress until result comfortably fits Firestore <= 600KB & 1MB doc ceiling
        for (let attempt = 0; attempt < 6; attempt++) {
          let { width, height } = img;
          if (width > dim || height > dim) {
            if (width >= height) {
              height = Math.max(1, Math.round((height * dim) / width));
              width = dim;
            } else {
              width = Math.max(1, Math.round((width * dim) / height));
              height = dim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          result = canvas.toDataURL('image/jpeg', q);
          if (result.length <= maxChars) break;
          q = Math.max(0.42, Number((q - 0.12).toFixed(2)));
          dim = Math.max(240, Math.round(dim * 0.75));
        }

        if (dataUrl.length < result.length && dataUrl.length <= maxChars) {
          resolve(dataUrl);
        } else {
          resolve(result.length <= maxChars ? result : result.slice(0, maxChars));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
