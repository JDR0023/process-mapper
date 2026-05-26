'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ProcessMap } from '@/lib/types';

export default function DashboardPage() {
  const [processMaps, setProcessMaps] = useState<
    Pick<ProcessMap, 'id' | 'title' | 'description' | 'created_at'>[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaps() {
      try {
        const res = await fetch('/api/process-maps');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProcessMaps(data.processMaps || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMaps();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this process map? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/process-maps/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setProcessMaps((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Saved Process Maps
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Previously exported maps that the system has learned from.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <svg
            className="h-6 w-6 animate-spin text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      ) : processMaps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Map className="h-12 w-12 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-500">
                No saved process maps yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Export a process map from the generator and it will appear here.
              </p>
            </div>
            <Link href="/">
              <Button variant="primary" size="sm">
                Generate your first map
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {processMaps.map((pm) => (
            <Card key={pm.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="rounded-lg bg-primary-50 p-2">
                  <Map className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {pm.title}
                  </p>
                  {pm.description && (
                    <p className="truncate text-xs text-gray-500">
                      {pm.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(pm.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
