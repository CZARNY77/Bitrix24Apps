import { z } from "zod";
import verificationSchema from "./schema";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone

  return new Response(null, { headers });
}

function createNextResponse(body: string | object, status: number) {
  const response = NextResponse.json(
      typeof body === "string" ? { message: body } : body,
      { status: status }
  );
  response.headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function POST(request: Request) {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const { dealId } = verificationSchema.parse(body);

    // URL API Bitrix do pobrania kontaktu
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_GET_DEAL;
    console.log(`Bitrix URL: ${bitrixUrl}`);
    if (!bitrixUrl) {
      return createNextResponse("Bitrix URL is not configured.", 500);
    }

    const response = await fetch(`${bitrixUrl}/crm.deal.get.json?ID=${dealId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return createNextResponse(errorData, 500);
    }

    const contactData = await response.json();
    const deal = contactData.result;

    return createNextResponse(deal, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createNextResponse(error.message, 400);
    }
    return createNextResponse((error as Error).message, 500);
  }
}
