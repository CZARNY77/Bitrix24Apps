import { z } from "zod";
import startWorkflowSchema from "./schema";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone

  return new Response(null, { headers });
}

function createNextResponse(body: any, status: any) {
  const response = NextResponse.json(body, status);
  response.headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone
  return response;
}

export async function POST(request: Request) {
  try {
    // Odczyt i walidacja danych wejściowych
    const body = await request.json();
    const { documentId, templateId } = startWorkflowSchema.parse(body);

    // Ukryty URL Bitrix z .env
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_WORKFLOW_START;
    if (!bitrixUrl) {
      return createNextResponse({ error: "Bitrix URL is not configured." },{ status: 500 });
    }

    // Wywołanie API Bitrix
    const response = await fetch(`${bitrixUrl}/bizproc.workflow.start.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        TEMPLATE_ID: templateId,
        DOCUMENT_ID: documentId,
        PARAMETERS: {},
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return createNextResponse({ message: "Workflow started successfully.", data }, { status: 200 });
    } else {
      const errorData = await response.json();
      return createNextResponse({ error: "Failed to start workflow.", details: errorData },{ status: 500 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createNextResponse({ error: error.message }, { status: 400 });
    }
    return createNextResponse({ error: "Internal Server Error", details: (error as Error).message },{ status: 500 });
  }
}
