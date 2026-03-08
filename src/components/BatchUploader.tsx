import React, { useCallback, useState } from 'react';
import { FileSpreadsheet, Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtifactDetails, generateMuseumImage, downloadImage } from '@/lib/museumGenerator';

interface BatchRow extends ArtifactDetails {
  imageFilename: string;
}

interface BatchResult {
  filename: string;
  imageUrl: string | null;
  error?: string;
}

const BatchUploader: React.FC = () => {
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const parseCSV = useCallback((text: string): BatchRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    return lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      return {
        imageFilename: cols[0] || '',
        artifactNumber: cols[1] || '',
        title: cols[2] || '',
        origin: cols[3] || '',
        material: cols[4] || '',
        estimatedAge: cols[5] || '',
      };
    }).filter(r => r.imageFilename);
  }, []);

  const onCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      setRows(parsed);
      setResults([]);
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const onImagesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const map = new Map<string, File>();
    for (const f of Array.from(files)) {
      map.set(f.name, f);
    }
    setImageFiles(map);
  }, []);

  const processBatch = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    const batchResults: BatchResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const file = imageFiles.get(row.imageFilename);
      if (!file) {
        batchResults.push({ filename: row.imageFilename, imageUrl: null, error: 'Image not found' });
        setProgress(i + 1);
        continue;
      }

      try {
        const imageUrl = await generateMuseumImage(file, row);
        batchResults.push({ filename: row.imageFilename, imageUrl });
      } catch (err: any) {
        batchResults.push({ filename: row.imageFilename, imageUrl: null, error: err.message || 'Generation failed' });
      }
      setProgress(i + 1);
      setResults([...batchResults]);
    }

    setResults(batchResults);
    setIsProcessing(false);
  }, [rows, imageFiles]);

  const downloadAll = useCallback(() => {
    results.forEach((r) => {
      if (r.imageUrl) {
        const name = r.filename.replace(/\.[^.]+$/, '') + '_museum.png';
        downloadImage(r.imageUrl, name);
      }
    });
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground/80 mb-1.5 block">CSV File</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors text-sm">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              Choose CSV
              <input type="file" accept=".csv" onChange={onCSVUpload} className="hidden" />
            </label>
            {rows.length > 0 && (
              <span className="text-sm text-muted-foreground">{rows.length} rows loaded</span>
            )}
          </div>
        </label>

        <div className="rounded-md bg-secondary/30 p-3 text-xs text-muted-foreground font-mono">
          image_filename, artifact_number, title, origin, material, age
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-foreground/80 mb-1.5 block">Product Images</span>
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors text-sm w-fit">
          Select Images
          <input type="file" accept="image/*" multiple onChange={onImagesUpload} className="hidden" />
        </label>
        {imageFiles.size > 0 && (
          <span className="text-sm text-muted-foreground mt-1 block">{imageFiles.size} images selected</span>
        )}
      </div>

      <Button
        onClick={processBatch}
        disabled={rows.length === 0 || imageFiles.size === 0 || isProcessing}
        className="w-full gap-2"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing {progress}/{rows.length}…
          </>
        ) : (
          `Generate ${rows.length} Images with AI`
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Results</p>
            <Button variant="outline" size="sm" onClick={downloadAll} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download All
            </Button>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm py-1.5 px-3 rounded bg-secondary/30">
                {r.error ? (
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                )}
                <span className="truncate">{r.filename}</span>
                {r.error && <span className="text-destructive text-xs ml-auto">{r.error}</span>}
                {r.imageUrl && (
                  <button
                    onClick={() => downloadImage(r.imageUrl!, r.filename.replace(/\.[^.]+$/, '') + '_museum.png')}
                    className="ml-auto text-primary hover:underline text-xs"
                  >
                    Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUploader;
