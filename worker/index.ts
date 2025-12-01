export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      // ---- 1) JSON Body 읽기 ----
      const body = await request.json();
      const endpoint = body.endpoint || "analyze";
      const prompt = body.prompt || "";
      const images = body.images || [];

      // ---- 2) Google API Key 로드 ----
      const API_KEY = env.GOOGLE_API_KEY;
      if (!API_KEY) {
        return new Response("Missing API Key", { status: 500 });
      }

      // ---- 3) Google Generative Language API URL ----
      const API_URL =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      // ---- 4) Content 구성 ----
      const contents: any[] = [];

      if (prompt) {
        contents.push({ role: "user", parts: [{ text: prompt }] });
      }

      images.forEach((imgBase64: string) => {
        contents.push({
          role: "user",
          parts: [
            {
              inlineData: {
                data: imgBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: "image/jpeg",
              },
            },
          ],
        });
      });

      // ---- 5) Google API 요청 Payload ----
      const payload = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      // ---- 6) Google API 호출 ----
      const googleRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await googleRes.json();

      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  },
};
