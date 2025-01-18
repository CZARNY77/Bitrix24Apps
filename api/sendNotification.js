export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { webhookUrl, userId, message } = req.body;

    // Walidacja danych wejściowych
    if (!webhookUrl || !message) {
      return res.status(400).json({ error: "Webhook URL and message are required." });
    }

    try {
      // Wysyłanie żądania POST do Bitrix24
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          USER_ID: userId || 1, // Domyślnie wysyłamy do wszystkich
          MESSAGE: message,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
