import { getSupabaseAdminClient } from './supabase';
import type { DocType } from './types';

export async function storeDocument(
  title: string,
  content: string,
  docType: DocType,
  sourceFile?: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const supabase = getSupabaseAdminClient();

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      title,
      content,
      doc_type: docType,
      source_file: sourceFile || null,
      metadata: metadata || {},
    })
    .select('id')
    .single();

  if (docError) throw new Error(`Failed to store document: ${docError.message}`);
  return doc.id;
}
