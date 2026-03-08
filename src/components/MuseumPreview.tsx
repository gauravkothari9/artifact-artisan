import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MuseumPreviewProps {
  previewUrl: string | null;
  isGenerating: boolean;
  onDownload: () => void;
}

const MuseumPreview: React.FC<MuseumPreviewProps> = ({ previewUrl, isGenerating, onDownload }) => {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-80 rounded-lg border border-border bg-secondary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-sm">Generating museum image…</p>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-80 rounded-lg border border-dashed border-border bg-secondary/10">
        <div className="text-center text-muted-foreground">
          <p className="font-display text-lg mb-1">Preview</p>
          <p className="text-sm">Upload an image and fill in details to generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-border bg-muted/20">
        <img src={previewUrl} alt="Museum-style product" className="w-full aspect-square object-contain" />
      </div>
      <Button onClick={onDownload} className="w-full gap-2" size="lg">
        <Download className="w-4 h-4" />
        Download Image (2000×2000)
      </Button>
    </div>
  );
};

export default MuseumPreview;
