"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export function PhotoUpload({ onFilesChange, maxFiles = 5, className }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files).slice(0, maxFiles - previews.length);
      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      const updated = [...previews, ...newPreviews].slice(0, maxFiles);
      setPreviews(updated);
      onFilesChange(updated.map((p) => p.file));
    },
    [previews, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previews[index].url);
      const updated = previews.filter((_, i) => i !== index);
      setPreviews(updated);
      onFilesChange(updated.map((p) => p.file));
    },
    [previews, onFilesChange]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={`Náhľad ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxFiles && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
        >
          <Camera size={18} />
          <span>Pridať fotky ({previews.length}/{maxFiles})</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
