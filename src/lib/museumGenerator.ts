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
  details: ArtifactDetails
): Promise<string> {
  const imageBase64 = await fileToBase64(file);

  const { data, error } = await supabase.functions.invoke('generate-museum-image', {
    body: {
      imageBase64,
      ...details,
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

  return data.imageUrl;
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
