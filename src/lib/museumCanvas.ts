export interface ArtifactDetails {
  artifactNumber: string;
  title: string;
  origin: string;
  material: string;
  estimatedAge: string;
}

const SIZE = 2000;
const FLOOR_Y = 1450;

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Dark museum gradient wall
  const wallGrad = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  wallGrad.addColorStop(0, '#1a1d23');
  wallGrad.addColorStop(0.3, '#22262e');
  wallGrad.addColorStop(0.7, '#2a2e36');
  wallGrad.addColorStop(1, '#33373f');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, SIZE, FLOOR_Y);

  // Subtle texture noise on wall
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * FLOOR_Y;
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Floor
  const floorGrad = ctx.createLinearGradient(0, FLOOR_Y, 0, SIZE);
  floorGrad.addColorStop(0, '#9e958b');
  floorGrad.addColorStop(0.1, '#b7ada2');
  floorGrad.addColorStop(1, '#a89e94');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, FLOOR_Y, SIZE, SIZE - FLOOR_Y);

  // Floor edge line
  ctx.strokeStyle = '#8a8078';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y);
  ctx.lineTo(SIZE, FLOOR_Y);
  ctx.stroke();
}

function drawSpotlight(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createRadialGradient(SIZE / 2, 0, 100, SIZE / 2, 600, 900);
  grad.addColorStop(0, 'rgba(255, 248, 230, 0.18)');
  grad.addColorStop(0.5, 'rgba(255, 248, 230, 0.06)');
  grad.addColorStop(1, 'rgba(255, 248, 230, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, FLOOR_Y);
}

function drawProductShadow(ctx: CanvasRenderingContext2D, cx: number, bottomY: number, width: number) {
  const shadowGrad = ctx.createRadialGradient(cx, bottomY, 10, cx, bottomY, width * 0.6);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + 10, width * 0.55, 30, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLabel(ctx: CanvasRenderingContext2D, details: ArtifactDetails) {
  const labelW = 520;
  const labelH = 220;
  const labelX = SIZE - labelW - 100;
  const labelY = SIZE - labelH - 80;
  const padding = 30;

  // Label background
  ctx.fillStyle = '#d4cfc6';
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelW, labelH, 4);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = '#b8b0a4';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner subtle line
  ctx.strokeStyle = '#c5bfb5';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.roundRect(labelX + 6, labelY + 6, labelW - 12, labelH - 12, 2);
  ctx.stroke();

  const textX = labelX + padding;
  let textY = labelY + padding + 18;

  // Artifact number - centered
  ctx.fillStyle = '#5a534a';
  ctx.font = '500 20px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Artifact #${details.artifactNumber}`, labelX + labelW / 2, textY);
  textY += 32;

  // Title - centered
  ctx.fillStyle = '#2c2722';
  ctx.font = '600 22px "Playfair Display", serif';
  
  // Word wrap title
  const maxWidth = labelW - padding * 2;
  const words = details.title.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  
  for (const l of lines) {
    ctx.fillText(l, labelX + labelW / 2, textY);
    textY += 28;
  }
  textY += 10;

  // Details - left aligned
  ctx.textAlign = 'left';
  ctx.font = '400 17px "Inter", "Playfair Display", serif';
  ctx.fillStyle = '#4a443c';

  const detailLines = [
    `Origin: ${details.origin}`,
    `Material: ${details.material}`,
    `Estimated Age: ${details.estimatedAge}`,
  ];

  for (const dl of detailLines) {
    ctx.fillText(dl, textX, textY);
    textY += 24;
  }
}

export async function generateMuseumImage(
  productImage: HTMLImageElement,
  details: ArtifactDetails
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  // 1. Background
  drawBackground(ctx);

  // 2. Spotlight
  drawSpotlight(ctx);

  // 3. Product image - center and scale
  const maxProductH = 900;
  const maxProductW = 1200;
  let pw = productImage.naturalWidth;
  let ph = productImage.naturalHeight;
  const scale = Math.min(maxProductW / pw, maxProductH / ph);
  pw *= scale;
  ph *= scale;
  const px = (SIZE - pw) / 2;
  const py = FLOOR_Y - ph - 20;

  // Shadow
  drawProductShadow(ctx, SIZE / 2, FLOOR_Y, pw);

  // Draw product
  ctx.drawImage(productImage, px, py, pw, ph);

  // 4. Label
  drawLabel(ctx, details);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
