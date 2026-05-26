import { saveAs } from 'file-saver';
import type { GridRow } from './types';

const HEADERS = [
  'Process Step ID',
  'Process Step Description',
  'Next Step ID',
  'Shape Type',
  'Function',
];

const FIELD_ORDER: (keyof GridRow)[] = [
  'processStepId',
  'processStepDescription',
  'nextStepId',
  'shapeType',
  'function',
];

export async function downloadExcel(
  rows: GridRow[],
  filename: string
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Process Map');

  ws.addTable({
    name: 'ProcessMapTable',
    ref: 'A1',
    headerRow: true,
    style: {
      showRowStripes: true,
    },
    columns: HEADERS.map((name) => ({ name })),
    rows: rows.map((row) => FIELD_ORDER.map((f) => row[f])),
  });

  const buffer = (await workbook.xlsx.writeBuffer()) as BlobPart;

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  saveAs(blob, name);
}
