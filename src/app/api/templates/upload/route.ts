export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { storeDocument } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const results: { name: string; id: string; status: string }[] = [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    for (const file of files) {
      try {
        const text = await file.text();
        let parsed: { title?: string; content?: string; steps?: unknown } = {
          title: file.name,
          content: text,
        };

        if (file.name.endsWith('.json')) {
          try {
            parsed = JSON.parse(text);
          } catch {
            // treat as raw text
          }
        }

        const content =
          typeof parsed.content === 'string'
            ? parsed.content
            : JSON.stringify(parsed, null, 2);
        const title = parsed.title || file.name;

        const docId = await storeDocument(
          title,
          content,
          'process_map',
          file.name
        );

        results.push({ name: file.name, id: docId, status: 'complete' });
      } catch (err) {
        results.push({
          name: file.name,
          id: '',
          status: 'error',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
