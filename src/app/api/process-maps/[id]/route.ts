export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('process_maps')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Process map not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ processMap: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch process map';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdminClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('process_maps')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ processMap: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update process map';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('process_maps')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete process map';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
