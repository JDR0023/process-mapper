export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GridRow, ShapeType } from '@/lib/types';

const VALID_SHAPES: ShapeType[] = [
  'Process', 'Decision', 'Terminator', 'Data', 'Document',
  'Database', 'Stored Data', 'Direct Data', 'Internal Storage',
  'Predefined Process', 'Subprocess', 'Multiple Processes',
  'Alternative', 'Preparation', 'Manual Operation', 'Manual Input',
  'Multiple Documents', 'Lined Document', 'Card',
  'Delay', 'Display', 'Event', 'Merge', 'Sort',
  'On Page Reference', 'Off Page Reference',
];

interface ParsedSummary {
  totalSteps: number;
  roles: string[];
  decisionPoints: number;
}

interface ParsedResponse {
  summary: ParsedSummary;
  rows: unknown[];
}

function normalizeShape(value: string): ShapeType {
  const match = VALID_SHAPES.find(
    (s) => s.toLowerCase() === value.toLowerCase().trim()
  );
  return match ?? 'Process';
}

function parseJsonResponse(text: string): ParsedResponse {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.summary || !Array.isArray(parsed.rows)) {
    throw new Error('Response must contain a summary object and a rows array');
  }
  return parsed as ParsedResponse;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .docx or .pdf file.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;
    if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const pdfResult = await parser.getText();
      text = pdfResult.text;
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract any text from the document.' },
        { status: 422 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You are a business process analyst. Extract process steps from documents and return a JSON object with a summary and rows array. Never include markdown, explanations, or code fences.',
    });

    const prompt = `Extract each process step from the document below and return a JSON object with two properties.

Property 1 — "summary": an object with:
  - "totalSteps": number of steps identified
  - "roles": array of unique department/role/swimlane names found in the steps
  - "decisionPoints": count of steps where shapeType is "Decision"

Property 2 — "rows": an array of objects, each with exactly these fields:
  - "processStepId": a unique sequential numeric ID string (e.g. "1", "2", "3")
  - "processStepDescription": short description of the step
  - "nextStepId": the ID(s) of the next step(s), comma-separated, or "" for terminal steps
  - "shapeType": one of: Process, Decision, Terminator, Data, Document, Database, Stored Data, Direct Data, Internal Storage, Predefined Process, Subprocess, Multiple Processes, Alternative, Preparation, Manual Operation, Manual Input, Multiple Documents, Lined Document, Card, Delay, Display, Event, Merge, Sort, On Page Reference, Off Page Reference
  - "function": the department, role, or system responsible (swimlane name)

Rules:
- Return ONLY a raw JSON object. No markdown, no code fences, no extra text.
- If the document does not describe a business process, return { "summary": { "totalSteps": 0, "roles": [], "decisionPoints": 0 }, "rows": [] }
- A step that asks a question or branches → Decision
- Start / end steps → Terminator
- Generic actions → Process
- Data storage → Database or Stored Data
- Inline data entry → Manual Input

Document text:
${text.slice(0, 30000)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed: ParsedResponse;
    try {
      parsed = parseJsonResponse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: 'Failed to parse AI response as JSON. The model returned unexpected output.',
          raw: responseText,
        },
        { status: 422 }
      );
    }

    const rows: GridRow[] = parsed.rows.map((item: unknown, idx: number) => {
      const obj = item as Record<string, unknown>;
      return {
        processStepId: String(obj.processStepId ?? idx + 1),
        processStepDescription: String(obj.processStepDescription ?? ''),
        nextStepId: String(obj.nextStepId ?? ''),
        shapeType: normalizeShape(String(obj.shapeType ?? 'Process')),
        function: String(obj.function ?? ''),
      };
    });

    const summary: ParsedSummary = {
      totalSteps: parsed.summary.totalSteps,
      roles: parsed.summary.roles,
      decisionPoints: parsed.summary.decisionPoints,
    };

    return NextResponse.json({ summary, rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload and parse failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
