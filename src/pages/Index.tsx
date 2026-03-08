import React, { useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Layers } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import ArtifactForm from '@/components/ArtifactForm';
import MuseumPreview from '@/components/MuseumPreview';
import BatchUploader from '@/components/BatchUploader';
import { Button } from '@/components/ui/button';
import { ArtifactDetails, generateMuseumImage, downloadCanvas } from '@/lib/museumCanvas';

const defaultDetails: ArtifactDetails = {
  artifactNumber: '',
  title: '',
  origin: '',
  material: '',
  estimatedAge: '',
};

const Index: React.FC = () => {
  const [productImage, setProductImage] = useState<HTMLImageElement | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [details, setDetails] = useState<ArtifactDetails>(defaultDetails);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageLoad = useCallback((img: HTMLImageElement, file: File) => {
    setProductImage(img);
    setProductPreview(URL.createObjectURL(file));
    setPreviewUrl(null);
  }, []);

  const handleClear = useCallback(() => {
    setProductImage(null);
    setProductPreview(null);
    setPreviewUrl(null);
  }, []);

  const canGenerate = productImage && details.artifactNumber && details.title;

  const generate = useCallback(async () => {
    if (!productImage) return;
    setIsGenerating(true);
    // Small delay to let UI update
    await new Promise((r) => setTimeout(r, 50));
    try {
      const canvas = await generateMuseumImage(productImage, details);
      canvasRef.current = canvas;
      setPreviewUrl(canvas.toDataURL('image/png'));
    } finally {
      setIsGenerating(false);
    }
  }, [productImage, details]);

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const filename = `incraftify_${details.artifactNumber || 'artifact'}.png`;
      downloadCanvas(canvasRef.current, filename);
    }
  }, [details.artifactNumber]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold tracking-tight text-foreground">
                Incraftify
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Photo Generator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="single" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ImageIcon className="w-4 h-4" />
              Single Image
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layers className="w-4 h-4" />
              Batch Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Controls */}
              <div className="space-y-6">
                <section className="space-y-3">
                  <h2 className="text-base font-display font-semibold text-foreground">
                    Product Image
                  </h2>
                  <ImageUploader
                    onImageLoad={handleImageLoad}
                    currentPreview={productPreview}
                    onClear={handleClear}
                  />
                </section>

                <section className="space-y-3">
                  <h2 className="text-base font-display font-semibold text-foreground">
                    Artifact Details
                  </h2>
                  <ArtifactForm details={details} onChange={setDetails} />
                </section>

                <Button
                  onClick={generate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  Generate Museum Image
                </Button>
              </div>

              {/* Right: Preview */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-base font-display font-semibold text-foreground mb-3">
                  Preview
                </h2>
                <MuseumPreview
                  previewUrl={previewUrl}
                  isGenerating={isGenerating}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="animate-fade-in">
            <div className="max-w-xl">
              <h2 className="text-base font-display font-semibold text-foreground mb-4">
                Batch Generation
              </h2>
              <BatchUploader />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
