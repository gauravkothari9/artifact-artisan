import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
  currentPreview: string | null;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad, currentPreview, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => onImageLoad(img, file);
    img.src = url;
  }, [onImageLoad]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }, [handleFile]);

  if (currentPreview) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/50 group">
        <img src={currentPreview} alt="Product preview" className="w-full h-64 object-contain bg-muted/30 p-4" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-secondary/30'
      }`}
    >
      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="p-3 rounded-full bg-secondary">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Drop your product image here</p>
          <p className="text-sm mt-1">or click to browse — PNG, JPG, WebP</p>
        </div>
      </div>
    </label>
  );
};

export default ImageUploader;
