import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelected: (file: File | null) => void;
  aspectRatio?: number;
}

export function ImageUploader({
  currentImage,
  onImageSelected,
  aspectRatio = 1,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      onImageSelected(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onImageSelected(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary"
        style={{ aspectRatio }}
        onClick={handleClick}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Camera className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Photo</span>
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-32"
        onClick={handleClick}
      >
        <Upload className="w-4 h-4 mr-2" />
        {preview ? "Change" : "Upload"}
      </Button>
    </div>
  );
} 