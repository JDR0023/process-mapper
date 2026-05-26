'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileJson, X, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface UploadResult {
  name: string;
  id: string;
  status: string;
}

export function TemplateUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        setResults([]);
      }
      e.target.value = '';
    },
    []
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setResults([]);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setResults(data.results);
      setFiles([]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          Upload Previous Templates
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload JSON exports of past Visio process maps and banking documents
          to build the reference library.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,.txt"
            onChange={handleChange}
            className="hidden"
            multiple
          />
          <Upload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drop JSON or text files here, or click to browse
          </p>
        </div>

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <FileJson className="h-4 w-4 text-gray-400" />
                <span className="flex-1 truncate text-sm text-gray-700">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {files.length > 0 && (
          <Button
            onClick={handleUpload}
            isLoading={isUploading}
            className="w-full"
          >
            Upload & Vectorize {files.length} file(s)
          </Button>
        )}

        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                {r.status === 'complete' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-gray-700">{r.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {r.status === 'complete' ? 'Vectorized' : 'Failed'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
