export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { title, description, sourceDocumentId, steps } = body;

    if (!title || !steps) {
      return NextResponse.json(
        { error: 'Title and steps are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('process_maps')
      .insert({
        title,
        description: description || null,
        source_document_id: sourceDocumentId || null,
        steps,
        metadata: { exported: true, exportedAt: new Date().toISOString() },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        processMap: data,
        message:
          'Process map exported and saved. The system has learned this flow for future reference.',
      },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
