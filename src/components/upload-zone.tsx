'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { GridRow } from '@/lib/types';

export interface ParsedSummary {
  totalSteps: number;
  roles: string[];
  decisionPoints: number;
}

interface UploadZoneProps {
  onParsed: (rows: GridRow[], summary: ParsedSummary) => void;
}

type UploadStatus =
  | { type: 'idle' }
  | { type: 'uploading'; phase: 'extracting' | 'analyzing' }
  | { type: 'error'; message: string };

export function UploadZone({ onParsed }: UploadZoneProps) {
  const [status, setStatus] = useState<UploadStatus>({ type: 'idle' });

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setStatus({ type: 'uploading', phase: 'extracting' });

      const body = new FormData();
      body.set('file', file);

      try {
        const res = await fetch('/api/upload-parse', {
          method: 'POST',
          body,
        });

        setStatus({ type: 'uploading', phase: 'analyzing' });

        const data = await res.json();

        if (!res.ok) {
          setStatus({ type: 'error', message: data.error ?? 'Upload failed' });
          return;
        }

        if (!data.rows || data.rows.length === 0) {
          setStatus({
            type: 'error',
            message:
              'Could not detect any process steps in this document. Try a different file or build the map manually.',
          });
          return;
        }

        onParsed(data.rows as GridRow[], data.summary as ParsedSummary);
        setStatus({ type: 'idle' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setStatus({ type: 'error', message: msg });
      }
    },
    [onParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: status.type === 'uploading',
  });

  const isProcessing = status.type === 'uploading';

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragActive && 'border-primary-400 bg-primary-50',
          isProcessing && 'pointer-events-none border-gray-200 bg-gray-50',
          status.type === 'error' && 'border-red-200 bg-red-50/30',
          !isDragActive &&
            !isProcessing &&
            status.type !== 'error' &&
            'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        ) : status.type === 'error' ? (
          <AlertCircle className="h-8 w-8 text-red-400" />
        ) : isDragActive ? (
          <Upload className="h-8 w-8 text-primary-500" />
        ) : (
          <FileText className="h-8 w-8 text-gray-400" />
        )}

        {isProcessing ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {status.phase === 'extracting'
                ? 'Extracting text…'
                : 'Analyzing document…'}
            </p>
            <p className="text-xs text-gray-400">
              {status.phase === 'extracting'
                ? 'Reading your file'
                : 'Identifying process steps'}
            </p>
          </div>
        ) : status.type === 'error' ? (
          <p className="text-sm text-red-600">{status.message}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {isDragActive
                ? 'Drop your file here'
                : 'Drag & drop your document here'}
            </p>
            <p className="text-xs text-gray-400">
              or click to browse &middot; .docx or .pdf
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
