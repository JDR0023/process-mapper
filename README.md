# ProcessMapper

AI-powered process map generator for banking and consulting documents.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js 15 App Router                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Client (React + Tailwind)                                       │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │  │
│  │  │  AI Generator    │ │ Manual Builder   │ │ Export & Learn   │  │  │
│  │  │  Tab             │ │ Tab              │ │ Bar              │  │  │
│  │  │  (upload + gen)  │ │ (blank grid)     │ │ (button + CSV)   │  │  │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────────────┐│  │
│  │  │  ProcessMapGrid (shared editable Tailwind table)              ││  │
│  │  │  Series | Process Step | Swim Lane | Flowchart Shapes         ││  │
│  │  └───────────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  API Route Handlers (app/api/)                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │Templates │ │Documents │ │ Generate │ │ Export   │            │  │
│  │  │ /upload  │ │ /upload  │ │ (RAG+LLM)│ │(Save&Learn)          │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Services (lib/)                                                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │ Supabase │ │ Gemini   │ │Document  │ │ Vector   │            │  │
│  │  │ Client   │ │ Client   │ │ Parser   │ │ Store    │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │  │
│  │  │ RAG      │ │ Process  │ │ CSV      │                         │  │
│  │  │ Engine   │ │Map Gen   │ │ Export   │                         │  │
│  │  └──────────┘ └──────────┘ └──────────┘                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL + pgvector)                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐      │  │
│  │  │  documents   │  │doc_chunks    │  │  process_maps      │      │  │
│  │  │ (source docs)│  │(embeddings)  │  │  (generated maps)  │      │  │
│  │  └──────────────┘  └──────────────┘  └────────────────────┘      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Getting Started

### 1. Prerequisites

- Node.js 22+ (v23 may need the webpack fix in `next.config.mjs` — already applied)
- A Supabase project (free tier works)
- A Google Gemini API key (free tier available at [aistudio.google.com](https://aistudio.google.com))

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql` and run it
4. This creates the `documents`, `document_chunks`, and `process_maps` tables with pgvector support

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (for server-side operations) |

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build && npm start
```

## Usage

### Template Ingestion (Initial Setup)

1. Navigate to **Template Ingestion** (/ingestion)
2. Export your existing Visio process maps as JSON files
3. Upload them alongside any banking documents they reference
4. The system chunks, embeds, and stores them in Supabase's pgvector

### AI Generator (Tab 1)

1. Switch to the **AI Generator** tab
2. Drag & drop a Word or PDF document
3. Click **Generate Process Map** — Gemini returns grid rows with `series`, `processStep`, `swimLane`, and `flowchartShape`
4. Edit any cell inline — click to type in Process Step / Swim Lane, use the dropdown for Flowchart Shapes
5. Click **Export & Learn (CSV)** to download and save

### Manual Builder (Tab 2)

1. Switch to the **Manual Builder** tab
2. Click **Add Row** to start building from scratch
3. Fill in each column: series number, step name, responsible department, and shape type
4. Delete rows as needed with the trash icon
5. Export the same way

### The Learning Loop

Each exported map is saved to `process_maps` in Supabase. On subsequent document uploads, the RAG engine retrieves these saved rows and injects them as style references into the Gemini prompt. Over time, the system adapts to your specific conventions and banking compliance rules.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with header navigation
│   ├── page.tsx                # Main dashboard (tabs + grid + export)
│   ├── globals.css             # Tailwind setup
│   ├── ingestion/page.tsx      # Template ingestion page
│   ├── dashboard/page.tsx      # Saved process maps list
│   └── api/
│       ├── templates/upload    # Bulk upload Visio JSON/banking docs
│       ├── documents/upload    # Upload Word/PDF files
│       ├── generate            # RAG + Gemini processing
│       ├── process-maps        # CRUD for saved maps
│       └── export              # Export + Save & Learn
├── components/
│   ├── tabbed-interface.tsx    # Tab navigation component
│   ├── ai-generator-tab.tsx    # AI Generator tab content
│   ├── manual-builder-tab.tsx  # Manual Builder tab content
│   ├── process-map-grid.tsx    # Editable Tailwind data grid
│   ├── document-upload-zone.tsx # Drag-and-drop upload
│   ├── template-uploader.tsx   # Bulk template uploader
│   ├── header.tsx              # Navigation header
│   └── ui/                    # Shared UI primitives
├── lib/
│   ├── types.ts               # Shared TypeScript types (GridRow, etc.)
│   ├── supabase.ts            # Supabase client helpers
│   ├── gemini.ts              # Gemini client + embedding helpers
│   ├── document-parser.ts     # PDF and DOCX parsing + chunking
│   ├── vector-store.ts        # Document storage + vectorization
│   ├── rag.ts                 # Context retrieval + prompt building
│   ├── process-map-generator.ts # Gemini grid-row generation
│   └── csv-export.ts          # CSV download utility (papaparse)
├── types/                     # Type declarations
└── hooks/                     # React hooks
```

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data Grid | Pure Tailwind `<table>` (editable inline) |
| LLM | Google Gemini 1.5 Flash (free tier) |
| Embeddings | Gemini embedding-001 (768-dim) |
| Vector DB | Supabase (PostgreSQL + pgvector) |
| Document Parsing | mammoth (DOCX), pdf-parse (PDF) |
| Drag & Drop | react-dropzone |
| CSV Export | papaparse |
| Icons | lucide-react |
