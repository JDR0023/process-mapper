'use client';

import { useState, useCallback } from 'react';
import { Download, Brain, Upload, Table2 } from 'lucide-react';
import { ProcessMapGrid } from '@/components/process-map-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { downloadExcel } from '@/lib/excel-export';
import type { GridRow } from '@/lib/types';

const STEPS = [
  {
    icon: Table2,
    title: 'Add Rows',
    description: 'Build your process map row by row',
  },
  {
    icon: Download,
    title: 'Export Excel',
    description: 'Download as .xlsx ready for Visio',
  },
];

export default function HomePage() {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [title, setTitle] = useState('Process Map');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (rows.length === 0) return;
    setIsExporting(true);

    try {
      await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: `Exported from Manual Builder`,
          steps: rows,
        }),
      });

      await downloadExcel(rows, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      alert(msg);
    } finally {
      setIsExporting(false);
    }
  }, [rows, title]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Process Mapper
        </h1>
        <p className="mt-2 text-gray-500">
          Build a process map from scratch, then export as an Excel file ready for Visio.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={i}>
              <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="rounded-full bg-primary-50 p-2">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Title input */}
      <div className="mb-6">
        <label
          htmlFor="map-title"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Process Map Title
        </label>
        <input
          id="map-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="e.g. Loan Approval Process"
        />
      </div>

      {/* Manual Builder */}
      <ProcessMapGrid rows={rows} onRowsChange={setRows} readOnly={false} />

      {/* Export bar */}
      {rows.length > 0 && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{rows.length}</span>{' '}
            row{rows.length !== 1 ? 's' : ''} ready for export
          </div>
          <Button
            onClick={handleExport}
            isLoading={isExporting}
            size="lg"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      )}
    </div>
  );
}
