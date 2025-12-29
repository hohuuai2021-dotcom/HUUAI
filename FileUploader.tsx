import React, { useState } from 'react';
import { MAX_FILE_SIZE_CHARS } from '../constants';

interface FileUploaderProps {
  label: string;
  accept?: string;
  onFileRead: (content: string) => void;
  description?: string;
  downloadSampleFileName?: string;
  sampleContentUrl?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept = ".txt",
  onFileRead,
  description,
  downloadSampleFileName,
  sampleContentUrl
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      setError("Please upload a valid text (.txt) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text.length > MAX_FILE_SIZE_CHARS) {
        setError(`File is too large. Limit is ${MAX_FILE_SIZE_CHARS} characters.`);
        return;
      }
      onFileRead(text);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = async () => {
    if (!sampleContentUrl || !downloadSampleFileName) return;
    try {
      const response = await fetch(sampleContentUrl);
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadSampleFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download sample:', err);
    }
  };

  return (
    <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      {description && <p className="text-xs text-slate-500 mb-3">{description}</p>}
      
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-sky-50 file:text-sky-600
            hover:file:bg-sky-100
            cursor-pointer"
        />
        {sampleContentUrl && (
          <button
            onClick={handleDownloadSample}
            className="text-xs text-sky-600 hover:text-sky-800 underline whitespace-nowrap"
            title="Download a sample template"
          >
            Download Template
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploader;