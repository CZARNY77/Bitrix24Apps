import { z } from "zod";
import findClientSchema from "./schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  
    // Odczyt i walidacja danych wejściowych
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
  try {
    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
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
      return NextResponse.json(
        {
          id: client.ID,
        },
        { status: 200 }
      );
    }

    // Jeśli klienta nie znaleziono
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}