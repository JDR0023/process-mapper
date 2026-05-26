export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('process_maps')
      .select('id, title, description, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ processMaps: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch process maps';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ processMap: data }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create process map';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
