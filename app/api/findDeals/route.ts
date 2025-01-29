import { z } from "zod";
import getDealsSchema from "./schema";
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
      // Odczyt i walidacja danych wejściowych
      const body = await request.json();
      const { contactId } = getDealsSchema.parse(body);

      // Webhook do API Bitrix z .env
      const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_DEALS_LIST;
      if (!bitrixUrl) {
          return createNextResponse("Bitrix URL is not configured.", 500);
      }

      // Endpoint do pobierania powiązanych dealów
      const url = `${bitrixUrl}/crm.deal.list.json`;
      const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              filter: { "CONTACT_ID": contactId },
              select: ["ID"],
          }),
      });

      if (response.ok) {
          const data = await response.json();
          const deals = data.result;

          // Zwraca listę dealów
          return createNextResponse(deals, 200);
      } else {
          const errorData = await response.json();
          return createNextResponse(errorData, 500);
      }
  } catch (error) {
      if (error instanceof z.ZodError) {
          return createNextResponse(error.message, 400);
      }
      return createNextResponse((error as Error).message, 500);
  }
}