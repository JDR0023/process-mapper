export type DocType = 'banking_doc' | 'process_map' | 'user_document';

export interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: DocType;
  source_file: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ShapeType =
  | 'Process'
  | 'Decision'
  | 'Terminator'
  | 'Data'
  | 'Document'
  | 'Database'
  | 'Stored Data'
  | 'Direct Data'
  | 'Internal Storage'
  | 'Predefined Process'
  | 'Subprocess'
  | 'Multiple Processes'
  | 'Alternative'
  | 'Preparation'
  | 'Manual Operation'
  | 'Manual Input'
  | 'Multiple Documents'
  | 'Lined Document'
  | 'Card'
  | 'Delay'
  | 'Display'
  | 'Event'
  | 'Merge'
  | 'Sort'
  | 'On Page Reference'
  | 'Off Page Reference';

export interface GridRow {
  processStepId: string;
  processStepDescription: string;
  nextStepId: string;
  shapeType: ShapeType;
  function: string;
}

export interface ProcessMap {
  id: string;
  title: string;
  description: string | null;
  source_document_id: string | null;
  steps: GridRow[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface GenerationResult {
  rows: GridRow[];
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}
