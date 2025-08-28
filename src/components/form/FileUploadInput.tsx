import { ChangeEvent } from 'react';

interface FileUploadInputProps {
  id: string;
  label: string;
  onFileChange: (file: File | undefined) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploadInput = ({
  id,
  label,
  onFileChange,
  accept = 'image/*',
  maxSizeMB = 5,
}: FileUploadInputProps) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onFileChange(undefined);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
      onFileChange(undefined);
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${maxSizeMB}MB limit.`);
      onFileChange(undefined);
      return;
    }

    // Pass the file directly to the callback
    onFileChange(file);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};