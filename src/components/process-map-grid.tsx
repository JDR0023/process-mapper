'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { GridRow, ShapeType } from '@/lib/types';

interface ShapeDef {
  value: ShapeType;
  label: string;
}

const SHAPE_GROUPS: { label: string; items: ShapeDef[] }[] = [
  {
    label: 'Standard Shapes',
    items: [
      { value: 'Process', label: 'Process' },
      { value: 'Decision', label: 'Decision' },
      { value: 'Terminator', label: 'Terminator' },
      { value: 'Document', label: 'Document' },
      { value: 'Data', label: 'Data' },
    ],
  },
  {
    label: 'Data & Storage',
    items: [
      { value: 'Database', label: 'Database' },
      { value: 'Stored Data', label: 'Stored Data' },
      { value: 'Direct Data', label: 'Direct Data' },
      { value: 'Internal Storage', label: 'Internal Storage' },
    ],
  },
  {
    label: 'Process Variants',
    items: [
      { value: 'Predefined Process', label: 'Predefined Process' },
      { value: 'Subprocess', label: 'Subprocess' },
      { value: 'Multiple Processes', label: 'Multiple Processes' },
      { value: 'Alternative', label: 'Alternative' },
      { value: 'Preparation', label: 'Preparation' },
      { value: 'Manual Operation', label: 'Manual Operation' },
      { value: 'Manual Input', label: 'Manual Input' },
    ],
  },
  {
    label: 'Documents & Input',
    items: [
      { value: 'Multiple Documents', label: 'Multiple Documents' },
      { value: 'Lined Document', label: 'Lined Document' },
      { value: 'Card', label: 'Card' },
    ],
  },
  {
    label: 'Flow Control',
    items: [
      { value: 'Delay', label: 'Delay' },
      { value: 'Display', label: 'Display' },
      { value: 'Event', label: 'Event' },
      { value: 'Merge', label: 'Merge' },
      { value: 'Sort', label: 'Sort' },
      { value: 'On Page Reference', label: 'On Page Reference' },
      { value: 'Off Page Reference', label: 'Off Page Reference' },
    ],
  },
];

interface Props {
  rows: GridRow[];
  onRowsChange: (rows: GridRow[]) => void;
  readOnly?: boolean;
}

export function ProcessMapGrid({ rows, onRowsChange, readOnly }: Props) {
  function updateRow(
    index: number,
    field: keyof GridRow,
    value: string
  ) {
    const next = rows.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    onRowsChange(next);
  }

  function deleteRow(index: number) {
    onRowsChange(rows.filter((_, i) => i !== index));
  }

  function insertRowAfter(index: number) {
    const newRow: GridRow = {
      processStepId: String(rows.length + 1),
      processStepDescription: '',
      nextStepId: '',
      shapeType: 'Process',
      function: '',
    };
    const next = [...rows.slice(0, index + 1), newRow, ...rows.slice(index + 1)];
    onRowsChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th className="w-28">Process Step ID</Th>
              <Th className="min-w-48">Process Step Description</Th>
              <Th className="w-28">Next Step ID</Th>
              <Th className="w-52">Shape Type</Th>
              <Th className="min-w-36">Swimlane (Function)</Th>
              {!readOnly && <Th className="w-16" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 5 : 6}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  No rows yet.{' '}
                  {readOnly ? '' : 'Click "Add Row" to start building your process map.'}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="relative overflow-visible hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    <CellInput
                      value={row.processStepId}
                      onChange={(v) => updateRow(i, 'processStepId', v)}
                      readOnly={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <CellInput
                      value={row.processStepDescription}
                      onChange={(v) => updateRow(i, 'processStepDescription', v)}
                      readOnly={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <CellInput
                      value={row.nextStepId}
                      onChange={(v) => updateRow(i, 'nextStepId', v)}
                      readOnly={readOnly}
                    />
                  </td>
                  <td className="relative overflow-visible px-3 py-2">
                    <ShapeSelect
                      value={row.shapeType}
                      onChange={(v) => updateRow(i, 'shapeType', v)}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <CellInput
                      value={row.function}
                      onChange={(v) => updateRow(i, 'function', v)}
                      readOnly={readOnly}
                    />
                  </td>
                  {!readOnly && (
                    <td className="whitespace-nowrap px-2 py-2">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => insertRowAfter(i)}
                          className="rounded p-1 text-gray-300 opacity-40 hover:opacity-100 hover:text-gray-600 transition-all"
                          title="Insert row after"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteRow(i)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          onClick={() =>
            onRowsChange([
              ...rows,
              {
                processStepId: String(rows.length + 1),
                processStepDescription: '',
                nextStepId: '',
                shapeType: 'Process',
                function: '',
              },
            ])
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </button>
      )}
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={clsx(
        'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
        className
      )}
    >
      {children}
    </th>
  );
}

function CellInput({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      className={clsx(
        'w-full rounded px-1.5 py-1 text-sm text-gray-900 transition-colors',
        readOnly
          ? 'border-transparent bg-transparent'
          : 'border border-transparent hover:border-gray-200 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300'
      )}
    />
  );
}

function ShapeSelect({
  value,
  onChange,
  disabled,
}: {
  value: ShapeType;
  onChange: (v: ShapeType) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [upward, setUpward] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function reposition() {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimate = 320;
      const goesUp = spaceBelow < estimate && spaceAbove > spaceBelow;
      setUpward(goesUp);
      setPos({
        top: goesUp ? Math.max(rect.top - estimate - 4, 4) : rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const allShapes = SHAPE_GROUPS.flatMap((g) => g.items);
  const selected = allShapes.find((s) => s.value === value) ?? allShapes[0];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          if (disabled) return;
          if (!open) {
            const rect = btnRef.current!.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const estimate = 320;
            const goesUp = spaceBelow < estimate && spaceAbove > spaceBelow;
            setUpward(goesUp);
            setPos({
              top: goesUp ? Math.max(rect.top - estimate - 4, 4) : rect.bottom,
              left: rect.left,
              width: Math.max(rect.width, 200),
            });
          }
          setOpen((o) => !o);
        }}
        disabled={disabled}
        className={clsx(
          'flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-sm',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          disabled
            ? 'border-transparent bg-transparent text-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <ShapeIcon shape={selected.value} />
        <span className="flex-1 text-left truncate">{selected.label}</span>
        {!disabled && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
          className={clsx(
            'z-50 min-w-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg',
            upward ? 'mb-1' : 'mt-1'
          )}
        >
          <div className="max-h-80 py-1">
            {SHAPE_GROUPS.map((group, gi) => (
              <div key={gi}>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </div>
                {group.items.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      onChange(s.value);
                      setOpen(false);
                    }}
                    className={clsx(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-100',
                      s.value === value && 'bg-primary-50 text-primary-700'
                    )}
                  >
                    <ShapeIcon shape={s.value} />
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ShapeIcon({ shape }: { shape: ShapeType }) {
  return (
    <svg
      viewBox="0 0 22 16"
      className="h-4 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shape === 'Process' && <rect x="1" y="1" width="20" height="14" rx="1.5" />}
      {shape === 'Decision' && <polygon points="11,1 21,8 11,15 1,8" />}
      {shape === 'Terminator' && <rect x="1" y="1" width="20" height="14" rx="7" />}
      {shape === 'Document' && (
        <>
          <path d="M3 1h10l5 5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          <path d="M13 1v5h5" />
        </>
      )}
      {shape === 'Data' && <polygon points="2,13 6,2 20,2 16,13" />}
      {shape === 'Database' && (
        <>
          <ellipse cx="11" cy="3" rx="9" ry="2.5" />
          <path d="M2 3v10c0 1.4 4 2.5 9 2.5s9-1.1 9-2.5V3" />
          <path d="M2 8c0 1.4 4 2.5 9 2.5S20 9.4 20 8" />
        </>
      )}
      {shape === 'Stored Data' && <rect x="1" y="4" width="20" height="8" rx="4" />}
      {shape === 'Direct Data' && (
        <>
          <rect x="1" y="4" width="20" height="8" rx="4" />
          <circle cx="11" cy="8" r="2" fill="currentColor" opacity="0.35" />
        </>
      )}
      {shape === 'Internal Storage' && (
        <>
          <rect x="1" y="1" width="20" height="14" rx="1.5" />
          <line x1="1" y1="6" x2="21" y2="6" />
          <line x1="1" y1="11" x2="21" y2="11" />
        </>
      )}
      {(shape === 'Predefined Process' || shape === 'Subprocess') && (
        <>
          <rect x="1" y="1" width="20" height="14" rx="1.5" />
          <line x1="5.5" y1="1" x2="5.5" y2="15" />
          <line x1="16.5" y1="1" x2="16.5" y2="15" />
        </>
      )}
      {shape === 'Multiple Processes' && (
        <>
          <rect x="4" y="1" width="17" height="13" rx="1.5" />
          <rect x="1" y="3" width="17" height="13" rx="1.5" />
        </>
      )}
      {shape === 'Alternative' && <polygon points="11,1 21,15 1,15" />}
      {shape === 'Preparation' && (
        <polygon points="6,1 16,1 21,8 16,15 6,15 1,8" />
      )}
      {shape === 'Manual Operation' && (
        <>
          <rect x="1" y="5" width="20" height="10" rx="1.5" />
          <polygon points="7,5 9,1 13,1 15,5" />
        </>
      )}
      {shape === 'Manual Input' && (
        <polygon points="5,1 21,1 21,15 5,15 1,8" />
      )}
      {shape === 'Multiple Documents' && (
        <>
          <path d="M5 1h10l4 4v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          <path d="M13 1v4h4" />
          <path
            d="M8 3h10l4 4v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            opacity="0.45"
          />
        </>
      )}
      {shape === 'Lined Document' && (
        <>
          <path d="M3 1h10l5 5v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          <path d="M13 1v5h5" />
          <line x1="5" y1="7" x2="16" y2="7" />
          <line x1="5" y1="10" x2="16" y2="10" />
          <line x1="5" y1="13" x2="12" y2="13" />
        </>
      )}
      {shape === 'Card' && <rect x="1" y="1" width="20" height="14" rx="1.5" />}
      {shape === 'Delay' && (
        <>
          <rect x="1" y="1" width="12" height="14" rx="1.5" />
          <path d="M13 1a7 7 0 0 1 0 14" />
        </>
      )}
      {shape === 'Display' && (
        <>
          <rect x="1" y="2" width="20" height="11" rx="1.5" />
          <rect x="7" y="13" width="8" height="2" rx="0.5" />
        </>
      )}
      {shape === 'Event' && (
        <polygon points="18,8 11,1 2,1 2,15 11,15" />
      )}
      {shape === 'Merge' && <polygon points="11,15 1,1 21,1" />}
      {shape === 'Sort' && (
        <>
          <polygon points="11,3 15,6 11,9 7,6" />
          <polygon points="11,9 15,12 11,15 7,12" />
        </>
      )}
      {shape === 'On Page Reference' && <circle cx="11" cy="8" r="7" />}
      {shape === 'Off Page Reference' && (
        <polygon points="11,14 1,8 4,1 18,1 21,8" />
      )}
    </svg>
  );
}
