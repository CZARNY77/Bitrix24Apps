import { z } from "zod";
import findClientSchema from "./schema";
import { NextResponse } from "next/server";

function createNextResponse(body: any, status: number) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Access-Control-Allow-Origin", "*"); // Zmień na swoją domenę w produkcji
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function GET(request: Request) {
  
    // Odczyt i walidacja danych wejściowych
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
  try {
    if (!email) {
      return createNextResponse({ error: "Email is required" }, 400);
    }
    findClientSchema.parse({ email });

    // Wyszukiwanie klienta w API Bitrix
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_CONTACT;
    console.log(bitrixUrl);
    const response = await fetch(`${bitrixUrl}/crm.contact.list.json?filter[EMAIL]=${encodeURIComponent(email)}&SELECT[]=ID`);

    const data = await response.json();
  
    // Jeśli znaleziono klienta, zwróć dane
    if (data.result && data.result.length > 0) {
      const client = data.result[0];
      return createNextResponse({ id: client.ID }, 200);
    }

    // Jeśli klienta nie znaleziono
    return createNextResponse({ error: "Client not found." }, 404);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createNextResponse({ error: error.message }, 400);
    }
    return createNextResponse({ error: "Internal Server Error" }, 500);
  }
}