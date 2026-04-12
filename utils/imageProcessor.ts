/**
 * Processes the image to remove background and/or resize.
 */
export const processImage = async (
  base64Data: string,
  removeBg: boolean,
  targetSize: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas to target size
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Draw image (scaled)
      // If we are resizing down, we still draw the full source into the smaller canvas
      // The browser handles the interpolation (usually linear or bicubic)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      if (removeBg) {
        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const data = imageData.data;

        // Simple algorithm: Assume Top-Left pixel is the background color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        
        // Tolerance for "similarity" to background color
        const tolerance = 40; 

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate distance from background color
          const distance = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          if (distance < tolerance) {
            data[i + 3] = 0; // Set Alpha to 0 (Transparent)
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
  });
};

/**
 * Wraps a base64 PNG in an SVG tag to create a standalone SVG file.
 * This is a common technique for converting raster to "SVG" without tracing vectors.
 */
export const convertToSvgWrapper = (base64Png: string, size: number): string => {
  // Ensure we have a pure base64 string without the data URI prefix for usage inside href if needed, 
  // but <image> href accepts data URI directly.
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Generated Logo</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <image x="0" y="0" width="${size}" height="${size}" href="${base64Png}" />
    </g>
</svg>`;
};

export const downloadFile = (content: string, filename: string, type: 'png' | 'svg') => {
  const link = document.createElement('a');
  if (type === 'svg') {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
  } else {
    link.href = content; // content is dataURL for PNG
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};