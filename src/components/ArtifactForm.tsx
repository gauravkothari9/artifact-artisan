import React from 'react';
import { ArtifactDetails } from '@/lib/museumGenerator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ArtifactFormProps {
  details: ArtifactDetails;
  onChange: (details: ArtifactDetails) => void;
}

const fields: { key: keyof ArtifactDetails; label: string; placeholder: string }[] = [
  { key: 'artifactNumber', label: 'Artifact Number', placeholder: '009' },
  { key: 'title', label: 'Artifact Title', placeholder: 'Traditional Wooden Storage Trunk' },
  { key: 'origin', label: 'Origin', placeholder: 'India' },
  { key: 'material', label: 'Material', placeholder: 'Solid Wood with Metal Hardware' },
  { key: 'estimatedAge', label: 'Estimated Age', placeholder: 'Vintage (Mid–Late 20th Century)' },
  { key: 'size', label: 'Size', placeholder: '24" x 12" x 14"' },
];

const ArtifactForm: React.FC<ArtifactFormProps> = ({ details, onChange }) => {
  const update = (key: keyof ArtifactDetails, value: string) => {
    onChange({ ...details, [key]: value });
  };

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key} className="text-sm font-medium text-foreground/80">
            {label}
          </Label>
          <Input
            id={key}
            value={details[key]}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            className="bg-secondary/50 border-border focus:border-primary"
          />
        </div>
      ))}
    </div>
  );
};

export default ArtifactForm;
