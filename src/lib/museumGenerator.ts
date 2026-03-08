import { supabase } from '@/integrations/supabase/client';

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

export async function generateMuseumImage(
  file: File,
  details: ArtifactDetails,
  showPlacard: boolean = true,
  aspectRatio: '1:1' | '3:2' = '1:1'
): Promise<string> {
  const imageBase64 = await fileToBase64(file);

  // Always generate WITHOUT placard from AI — we overlay it programmatically
  const { data, error } = await supabase.functions.invoke('generate-museum-image', {
    body: {
      imageBase64,
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

  // Composite placard on top programmatically for perfect consistency
  const { compositeWithPlacard } = await import('@/lib/placardOverlay');
  const finalImage = await compositeWithPlacard(data.imageUrl, details, showPlacard);
  return finalImage;
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
