export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      // 1) Google API Key 확인
      const GOOGLE_API_KEY = env.GOOGLE_API_KEY;
      if (!GOOGLE_API_KEY) {
        return new Response(JSON.stringify({
          error: "Missing Google API Key (env.GOOGLE_API_KEY)."
        }), { status: 500 });
      }

      const url = new URL(request.url);

      // === POST / ===  
      if (request.method === "POST") {
        const body = await request.json();

        const endpoint = body.endpoint;
        const prompt = body.prompt || "";
        const images: string[] = body.images || [];

        if (!endpoint)
          return new Response(JSON.stringify({ error: "Missing endpoint" }), { status: 400 });

        // 기본 모델명 (Google 가이드에 따라 변경)
        const modelName = "models/gemini-2.0-flash-lite";

        // -----------------------------------------------------------
        // 2) 이미지 입력 처리
        // -----------------------------------------------------------
        let imageParts: any[] = [];

        if (images.length > 0) {
          imageParts = images.map((base64: string) => ({
            inlineData: {
              data: base64,
              mimeType: "image/jpeg" // 필요 시 변경 가능
            }
          }));
        }

        // -----------------------------------------------------------
        // 3) Google API 호출
        // -----------------------------------------------------------
        let googleResponse;

        if (endpoint === "analyze") {
          googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GOOGLE_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      ...imageParts,
                      { text: prompt }
                    ]
                  }
                ]
              })
            }
          );

        } else if (endpoint === "generate") {
          googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GOOGLE_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

        } else {
          return new Response(JSON.stringify({
            error: "Invalid endpoint. Use 'analyze' or 'generate'."
          }), { status: 400 });
        }

        const result = await googleResponse.json();

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // === GET / 기본 확인 ===
      return new Response("AI Proxy Worker is running!");

    } catch (err: any) {
      return new Response(JSON.stringify({
        error: "Worker Exception",
        message: err?.message,
      }), { status: 500 });
    }
  }
};