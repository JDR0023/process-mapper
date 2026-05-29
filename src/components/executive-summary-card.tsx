'use client';

import { BarChart3, GitBranch, Users } from 'lucide-react';
import { clsx } from 'clsx';
import type { ParsedSummary } from './upload-zone';

interface Props {
  summary: ParsedSummary;
}

export function ExecutiveSummaryCard({ summary }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        icon={BarChart3}
        label="Total Steps"
        value={summary.totalSteps}
        color="primary"
      />
      <MetricCard
        icon={GitBranch}
        label="Decision Points"
        value={summary.decisionPoints}
        color="amber"
      />
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
          <Users className="h-3.5 w-3.5" />
          Roles Involved
        </div>
        <div className="flex flex-wrap gap-1.5">
          {summary.roles.length > 0 ? (
            summary.roles.map((role, i) => (
              <span
                key={i}
                className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">None detected</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: 'primary' | 'amber';
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={clsx(
          'text-2xl font-bold',
          color === 'primary' ? 'text-primary-600' : 'text-amber-600'
        )}
      >
        {value}
      </p>
    </div>
  );
}
