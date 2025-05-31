import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { NoteImage } from '../../types';
import Button from '../ui/button';

interface ImageUploadProps {
  images: NoteImage[];
  maxImages: number;
  onUpload: (files: FileList) => Promise<void>;
  onRemove: (publicId: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  maxImages,
  onUpload,
  onRemove,
}) => {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = maxImages - images.length;
      if (files.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}`);
        return;
      }

      await onUpload(files);
      e.target.value = ''; // Reset input
    },
    [images.length, maxImages, onUpload]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group"
          >
            <img
              src={image.url}
              alt={image.caption || 'Note image'}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemove(image.publicId)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 transition-colors cursor-pointer flex flex-col items-center justify-center text-neutral-500 hover:text-primary-600">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-sm text-center">
              Upload Image
              <br />
              <span className="text-xs">
                ({maxImages - images.length} remaining)
              </span>
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;