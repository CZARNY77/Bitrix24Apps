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

function createNextResponse(body: string, status: number) {
  const response = NextResponse.json({message: body}, {status: status});
  response.headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone
  return response;
}

function generateRandomCode(): string {
  const numbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  return numbers.join("");
}

export async function POST(request: Request) {
  try {
    // Odczyt i walidacja danych wejściowych
    const body = await request.json();
    const { documentId, templateId } = startWorkflowSchema.parse(body);

    // Ukryty URL Bitrix z .env
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_WORKFLOW_START;
    if (!bitrixUrl) {
      return createNextResponse("Bitrix URL is not configured.",500);
    }

    const randomCode = generateRandomCode();
    // Wywołanie API Bitrix
    const response = await fetch(`${bitrixUrl}/bizproc.workflow.start.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        TEMPLATE_ID: templateId,
        DOCUMENT_ID: documentId,
        PARAMETERS: {
          Kod: randomCode,
        },
      }),
    });

    if (response.ok) {
      return createNextResponse("Workflow started successfully.", 200);
    } else {
      const errorData = await response.json();
      return createNextResponse( errorData ,500);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createNextResponse(error.message , 400);
    }
    return createNextResponse((error as Error).message ,500);
  }
}
