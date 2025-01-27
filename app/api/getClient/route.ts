import { z } from "zod";
import { NextResponse } from "next/server";
import { log } from "console";

export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone

  return new Response(null, { headers });
}

function createNextResponse(body: string, status: number) {
  const response = NextResponse.json({ message: body }, { status: status });
  response.headers.set("Access-Control-Allow-Origin", "https://b24-jamegg.bitrix24.site"); // Dopuszczona domena
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Tylko te nagłówki są dozwolone
  return response;
}

// Schemat danych wejściowych
const verificationSchema = z.object({
  contactId: z.string().nonempty("Contact ID is required."),
  code: z.string().length(6, "Verification code must be 6 digits."),
});

export async function POST(request: Request) {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const { contactId, code } = verificationSchema.parse(body);

    // URL API Bitrix do pobrania kontaktu
    const bitrixUrl = process.env.NEXT_PUBLIC_BITRIX_GET_CONTACT;
    console.log(bitrixUrl);
    if (!bitrixUrl) {
      return createNextResponse("Bitrix URL is not configured.", 500);
    }

    // Pobieranie kontaktu z Bitrix24
    const response = await fetch(`${bitrixUrl}/crm.contact.get.json?ID=${contactId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return createNextResponse(errorData, 500);
    }

    const contactData = await response.json();

    // Pobranie pola Kod weryfikacyjny
    const verificationCode = contactData.result?.["UF_CRM_1738011343"];
    if (!verificationCode) {
      return createNextResponse("Verification code not found in contact.", 404);
    }

    // Porównanie kodów
    if (verificationCode === code) {
      return createNextResponse("Verification successful.", 200);
    } else {
      return createNextResponse("Verification failed. Code does not match.", 401);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createNextResponse(error.message, 400);
    }
    return createNextResponse((error as Error).message, 500);
  }
}
