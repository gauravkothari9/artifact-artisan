export interface ArtifactDetails {
  artifactNumber: string;
  title: string;
  origin: string;
  material: string;
  estimatedAge: string;
}

const SIZE = 2000;
const FLOOR_Y = 1340;

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Dark museum gradient wall — charcoal to slightly lighter gray
  const wallGrad = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  wallGrad.addColorStop(0, '#3a3a3e');
  wallGrad.addColorStop(0.2, '#404045');
  wallGrad.addColorStop(0.5, '#48484d');
  wallGrad.addColorStop(0.8, '#4a4a4f');
  wallGrad.addColorStop(1, '#505055');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, SIZE, FLOOR_Y);

  // Very subtle noise texture on wall
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * FLOOR_Y;
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Floor — neutral stone/concrete
  const floorGrad = ctx.createLinearGradient(0, FLOOR_Y, 0, SIZE);
  floorGrad.addColorStop(0, '#a09588');
  floorGrad.addColorStop(0.05, '#b0a698');
  floorGrad.addColorStop(0.3, '#b7ada2');
  floorGrad.addColorStop(1, '#a89e94');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, FLOOR_Y, SIZE, SIZE - FLOOR_Y);

  // Subtle floor texture
  ctx.globalAlpha = 0.015;
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * SIZE;
    const y = FLOOR_Y + Math.random() * (SIZE - FLOOR_Y);
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#888888';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Soft shadow at wall-floor junction
  const junctionGrad = ctx.createLinearGradient(0, FLOOR_Y - 5, 0, FLOOR_Y + 40);
  junctionGrad.addColorStop(0, 'rgba(0,0,0,0)');
  junctionGrad.addColorStop(0.3, 'rgba(0,0,0,0.15)');
  junctionGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = junctionGrad;
  ctx.fillRect(0, FLOOR_Y - 5, SIZE, 45);
}

function drawSpotlight(ctx: CanvasRenderingContext2D) {
  // Soft overhead spotlight — centered, warm
  const grad = ctx.createRadialGradient(SIZE / 2, -200, 50, SIZE / 2, 500, 1100);
  grad.addColorStop(0, 'rgba(255, 250, 240, 0.12)');
  grad.addColorStop(0.4, 'rgba(255, 250, 240, 0.05)');
  grad.addColorStop(1, 'rgba(255, 250, 240, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, FLOOR_Y + 200);

  // Slight vignette
  const vignetteGrad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 400, SIZE / 2, SIZE / 2, SIZE * 0.75);
  vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawProductShadow(ctx: CanvasRenderingContext2D, cx: number, bottomY: number, width: number) {
  // Ground contact shadow
  const shadowGrad = ctx.createRadialGradient(cx, bottomY + 5, 5, cx, bottomY + 5, width * 0.5);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.30)');
  shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.12)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + 8, width * 0.5, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Softer ambient shadow
  const ambientGrad = ctx.createRadialGradient(cx, bottomY, 10, cx, bottomY + 15, width * 0.7);
  ambientGrad.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
  ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ambientGrad;
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + 15, width * 0.65, 40, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLabel(ctx: CanvasRenderingContext2D, details: ArtifactDetails) {
  // Label positioned bottom-left, sitting on the floor like the reference
  const labelW = 480;
  const labelH = 190;
  const labelX = 80;
  const labelY = SIZE - labelH - 60;
  const padding = 24;

  // White/light placard background
  ctx.fillStyle = '#e8e4de';
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelW, labelH, 3);
  ctx.fill();

  // Subtle shadow under the placard
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#e8e4de';
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelW, labelH, 3);
  ctx.fill();
  ctx.restore();

  // Redraw clean on top
  ctx.fillStyle = '#e8e4de';
  ctx.beginPath();
  ctx.roundRect(labelX, labelY, labelW, labelH, 3);
  ctx.fill();

  const centerX = labelX + labelW / 2;
  let textY = labelY + padding + 20;

  // Artifact number — centered, bold
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 22px "Playfair Display", "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Artifact #${details.artifactNumber}`, centerX, textY);
  textY += 30;

  // Title — centered, regular
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '400 18px "Playfair Display", "Georgia", serif';

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
    ctx.fillText(l, centerX, textY);
    textY += 24;
  }
  textY += 8;

  // Detail lines — centered
  ctx.font = '400 15px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#3a3a3a';

  const detailLines = [
    `Origin: ${details.origin}`,
    `Material: ${details.material}`,
    `Estimated Age: ${details.estimatedAge}`,
  ];

  for (const dl of detailLines) {
    ctx.fillText(dl, centerX, textY);
    textY += 22;
  }
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  // Small star/diamond watermark bottom-right like the reference
  const cx = SIZE - 80;
  const cy = SIZE - 80;
  const r = 14;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 - Math.PI / 2;
    const outerX = cx + Math.cos(angle) * r;
    const outerY = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    const midAngle = angle + Math.PI / 4;
    const innerX = cx + Math.cos(midAngle) * (r * 0.4);
    const innerY = cy + Math.sin(midAngle) * (r * 0.4);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
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

  // 2. Product image — center on floor, scale to fit
  const maxProductH = 1050;
  const maxProductW = 1500;
  let pw = productImage.naturalWidth;
  let ph = productImage.naturalHeight;
  const scale = Math.min(maxProductW / pw, maxProductH / ph);
  pw *= scale;
  ph *= scale;
  const px = (SIZE - pw) / 2;
  const py = FLOOR_Y - ph + 60; // product sits slightly onto the floor

  // 3. Shadow beneath the product
  drawProductShadow(ctx, SIZE / 2, FLOOR_Y + 10, pw);

  // 4. Draw product
  ctx.drawImage(productImage, px, py, pw, ph);

  // 5. Spotlight overlay (after product for subtle glow)
  drawSpotlight(ctx);

  // 6. Label — bottom left
  drawLabel(ctx, details);

  // 7. Watermark
  drawWatermark(ctx);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
