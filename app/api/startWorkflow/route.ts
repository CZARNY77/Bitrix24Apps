import { z } from "zod";
import startWorkflowSchema from "./schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Odczyt i walidacja danych wejściowych
    const body = await request.json();
    const { documentId, templateId } = startWorkflowSchema.parse(body);

    // Ukryty URL Bitrix z .env
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_WORKFLOW_START;
    if (!bitrixUrl) {
      return NextResponse.json(
        { error: "Bitrix URL is not configured." },
        { status: 500 }
      );
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
      return NextResponse.json({ message: "Workflow started successfully.", data }, { status: 200 });
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to start workflow.", details: errorData },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
