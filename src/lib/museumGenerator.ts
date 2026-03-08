import { supabase } from '@/integrations/supabase/client';
import { compositeWithPlacard } from '@/lib/placardOverlay';

export interface ArtifactDetails {
  artifactNumber: string;
  title: string;
  origin: string;
  material: string;
  estimatedAge: string;
  size: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateMuseumImage(
  file: File,
  details: ArtifactDetails,
  showPlacard: boolean = true,
  aspectRatio: '1:1' | '3:2' = '1:1'
): Promise<string> {
  const imageBase64 = await fileToBase64(file);
  
  // Load the reference background image
  const backgroundBase64 = await loadImageAsBase64('/museum-background.jpg');

  // Always tell AI NOT to generate placard — we overlay it client-side for consistency
  const { data, error } = await supabase.functions.invoke('generate-museum-image', {
    body: {
      imageBase64,
      backgroundBase64,
      ...details,
      showPlacard: false,
      aspectRatio,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate image');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.imageUrl) {
    throw new Error('No image was generated');
  }

  // Composite the placard client-side for pixel-perfect consistency
  const finalImage = await compositeWithPlacard(data.imageUrl, details, showPlacard);
  return finalImage;
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
