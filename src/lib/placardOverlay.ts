import { ArtifactDetails } from '@/lib/museumGenerator';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawPlacard(
  ctx: CanvasRenderingContext2D,
  details: ArtifactDetails,
  canvasWidth: number,
  canvasHeight: number
) {
  const placardW = Math.round(canvasWidth * 0.10);
  const placardX = Math.round(canvasWidth * 0.03);
  const placardBottomMargin = Math.round(canvasHeight * 0.02);
  const padding = Math.round(placardW * 0.06);

  // Measure text to determine placard height
  const titleFontSize = Math.round(placardW * 0.09);
  const detailFontSize = Math.round(placardW * 0.065);
  const lineSpacing = 1.5;

  // Temporarily set fonts to measure
  ctx.font = `bold ${titleFontSize}px "Georgia", "Times New Roman", serif`;
  const maxTextWidth = placardW - padding * 2;

  // Word-wrap helper
  const wrapText = (text: string, font: string): string[] => {
    ctx.font = font;
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxTextWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const line1Font = `bold ${titleFontSize}px "Georgia", "Times New Roman", serif`;
  const line2Font = `bold ${detailFontSize}px "Georgia", "Times New Roman", serif`;

  const line1Text = `Artifact No. ${details.artifactNumber}`;
  const line1Lines = wrapText(line1Text, line1Font);
  const line2Lines = wrapText(details.title, line2Font);

  const detailEntries = [
    `Origin: ${details.origin}`,
    `Material: ${details.material}`,
    `Size: ${details.size}`,
    `Est. Age: ${details.estimatedAge}`,
  ].filter(d => !d.endsWith(': '));

  const detailWrapped: string[] = [];
  for (const entry of detailEntries) {
    detailWrapped.push(...wrapText(entry, line2Font));
  }

  const totalLines =
    line1Lines.length * (titleFontSize * lineSpacing) +
    line2Lines.length * (detailFontSize * lineSpacing) +
    detailWrapped.length * (detailFontSize * lineSpacing);

  const placardH = Math.round(padding * 2 + totalLines + detailFontSize * 0.5);
  const placardY = canvasHeight - placardBottomMargin - placardH;

  // Draw white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(placardX, placardY, placardW, placardH);

  // Draw border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = Math.max(1, Math.round(canvasWidth * 0.001));
  ctx.strokeRect(placardX, placardY, placardW, placardH);

  // Draw text
  let textY = placardY + padding + titleFontSize;
  ctx.textAlign = 'left';
  const textX = placardX + padding;

  // Line 1: Artifact No.
  ctx.fillStyle = '#000000';
  ctx.font = line1Font;
  for (const line of line1Lines) {
    ctx.fillText(line, textX, textY);
    textY += titleFontSize * lineSpacing;
  }

  // Line 2: Title
  ctx.font = line2Font;
  for (const line of line2Lines) {
    ctx.fillText(line, textX, textY);
    textY += detailFontSize * lineSpacing;
  }

  // Gap
  textY += detailFontSize * 0.3;

  // Detail lines
  for (const line of detailWrapped) {
    ctx.fillText(line, textX, textY);
    textY += detailFontSize * lineSpacing;
  }
}

export async function compositeWithPlacard(
  aiImageUrl: string,
  details: ArtifactDetails,
  showPlacard: boolean
): Promise<string> {
  const img = await loadImage(aiImageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  if (showPlacard) {
    drawPlacard(ctx, details, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}
