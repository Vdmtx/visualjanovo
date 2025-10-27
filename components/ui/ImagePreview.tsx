
import React from 'react';

interface ImagePreviewProps {
  file: File;
  onRemove: (file: File) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-primary-cyan flex items-center justify-center">
      {previewUrl ? (
        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm text-gray-400">Loading...</span>
      )}
      <button
        onClick={() => onRemove(file)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors"
        aria-label={`Remove ${file.name}`}
      >
        &times;
      </button>
    </div>
  );
};
