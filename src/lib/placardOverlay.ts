export interface PlacardDetails {
  artifactNumber: string;
  title: string;
  origin: string;
  material: string;
  size: string;
  estimatedAge: string;
}

/**
 * Draws a museum placard onto an image using canvas.
 * Guarantees crisp, readable text regardless of AI output.
 */
export async function overlayPlacard(
  imageDataUrl: string,
  details: PlacardDetails
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw the AI-generated image
  ctx.drawImage(img, 0, 0);

  const imgW = canvas.width;
  const imgH = canvas.height;

  // Placard dimensions relative to image height
  const placardW = Math.round(imgH * 0.16);
  const placardH = Math.round(imgH * 0.22);

  // Position: bottom-left, 3% from left, 2% from bottom
  const placardX = Math.round(imgW * 0.03);
  const placardY = Math.round(imgH - imgH * 0.02 - placardH);

  // Slight tilt (2 degrees clockwise)
  ctx.save();
  const tiltAngle = (2 * Math.PI) / 180;
  ctx.translate(placardX + placardW / 2, placardY + placardH / 2);
  ctx.rotate(tiltAngle);
  ctx.translate(-(placardX + placardW / 2), -(placardY + placardH / 2));

  // Shadow beneath placard
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(placardX, placardY, placardW, placardH);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = Math.max(1, Math.round(imgH * 0.001));
  ctx.strokeRect(placardX, placardY, placardW, placardH);

  // Text rendering
  const padding = Math.round(placardW * 0.08);
  const textX = placardX + padding;
  const maxTextW = placardW - padding * 2;
  let textY = placardY + padding;

  // Font sizes relative to placard height
  const titleFontSize = Math.round(placardH * 0.08);
  const subtitleFontSize = Math.round(placardH * 0.065);
  const detailFontSize = Math.round(placardH * 0.058);
  const lineSpacing = 1.5;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Line 1: Artifact No. (bold)
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${titleFontSize}px "Georgia", "Times New Roman", serif`;
  textY += drawWrappedText(ctx, `Artifact No. ${details.artifactNumber}`, textX, textY, maxTextW, titleFontSize * lineSpacing);
  textY += titleFontSize * 0.3;

  // Line 2: Title
  ctx.font = `${subtitleFontSize}px "Georgia", "Times New Roman", serif`;
  textY += drawWrappedText(ctx, details.title, textX, textY, maxTextW, subtitleFontSize * lineSpacing);
  textY += subtitleFontSize * 0.4;

  // Detail lines
  ctx.font = `${detailFontSize}px "Georgia", "Times New Roman", serif`;
  ctx.fillStyle = '#111111';
  const detailLines = [
    `Origin: ${details.origin}`,
    `Material: ${details.material}`,
    `Size: ${details.size}`,
    `Est. Age: ${details.estimatedAge}`,
  ];

  for (const line of detailLines) {
    textY += drawWrappedText(ctx, line, textX, textY, maxTextW, detailFontSize * lineSpacing);
    textY += detailFontSize * 0.15;
  }

  ctx.restore();

  return canvas.toDataURL('image/png');
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let totalHeight = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + totalHeight);
      line = word;
      totalHeight += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + totalHeight);
  totalHeight += lineHeight;
  return totalHeight;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
