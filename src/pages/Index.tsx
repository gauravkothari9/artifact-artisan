import React, { useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Layers } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ImageUploader from '@/components/ImageUploader';
import ArtifactForm from '@/components/ArtifactForm';
import MuseumPreview from '@/components/MuseumPreview';
import BatchUploader from '@/components/BatchUploader';
import { Button } from '@/components/ui/button';
import { ArtifactDetails, generateMuseumImage, downloadImage } from '@/lib/museumGenerator';
import { toast } from 'sonner';

const defaultDetails: ArtifactDetails = {
  artifactNumber: '',
  title: '',
  origin: '',
  material: '',
  estimatedAge: '',
  size: '',
};

const Index: React.FC = () => {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [details, setDetails] = useState<ArtifactDetails>(defaultDetails);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlacard, setShowPlacard] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:2'>('1:1');

  const handleImageLoad = useCallback((_img: HTMLImageElement, file: File) => {
    setProductFile(file);
    setProductPreview(URL.createObjectURL(file));
    setPreviewUrl(null);
  }, []);

  const handleClear = useCallback(() => {
    setProductFile(null);
    setProductPreview(null);
    setPreviewUrl(null);
  }, []);

  const canGenerate = productFile && details.artifactNumber && details.title;

  const generate = useCallback(async () => {
    if (!productFile) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateMuseumImage(productFile, details, showPlacard);
      setPreviewUrl(imageUrl);
      toast.success('Museum image generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, [productFile, details, showPlacard]);

  const handleDownload = useCallback(() => {
    if (previewUrl) {
      const filename = `incraftify_${details.artifactNumber || 'artifact'}.png`;
      downloadImage(previewUrl, filename);
    }
  }, [previewUrl, details.artifactNumber]);

  return (
    <div className="min-h-screen bg-background">
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
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      id="show-placard"
                      checked={showPlacard}
                      onCheckedChange={setShowPlacard}
                    />
                    <Label htmlFor="show-placard" className="text-sm font-medium text-foreground/80 cursor-pointer">
                      Include museum placard
                    </Label>
                  </div>
                </section>

                <Button
                  onClick={generate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? 'Generating with AI…' : 'Generate Museum Image'}
                </Button>
              </div>

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
