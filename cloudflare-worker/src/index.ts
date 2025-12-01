export default {
	async fetch(request, env) {
	  try {
		// Preflight (OPTIONS)
		if (request.method === "OPTIONS") {
		  return new Response(null, {
			status: 204,
			headers: {
			  "Access-Control-Allow-Origin": "*",
			  "Access-Control-Allow-Methods": "POST, OPTIONS",
			  "Access-Control-Allow-Headers": "Content-Type",
			  "Access-Control-Max-Age": "86400",
			},
		  });
		}
  
		// Allow only POST
		if (request.method !== "POST") {
		  return new Response("Only POST allowed", { status: 405 });
		}
  
		const body = await request.json();
		const { endpoint, images = [], confirmedData, prompt } = body;
  
		if (!endpoint) {
		  return new Response("Missing 'endpoint'.", { status: 400 });
		}
  
		const GOOGLE_API_KEY = env.GOOGLE_API_KEY;
		if (!GOOGLE_API_KEY) {
		  return new Response("Missing Google API key.", { status: 500 });
		}
  
		// 🔥 핵심 변경: 지역 기반 모델 엔드포인트 사용
		const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/asia-northeast1.gemini-2.0-flash-lite:generateContent?key=${GOOGLE_API_KEY}`;
  
		const imageParts = images.map((base64) => ({
		  inlineData: {
			data: base64,
			mimeType: "image/jpeg",
		  },
		}));
  
		const parts = [...imageParts];
		if (prompt) parts.push({ text: prompt });
  
		const googleBody = {
		  contents: [{ parts }],
		  generationConfig: {
			temperature: 0.4,
			responseMimeType: "application/json",
		  },
		};
  
		const response = await fetch(GOOGLE_URL, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify(googleBody),
		});
  
		const result = await response.json();
  
		return new Response(JSON.stringify(result), {
		  status: 200,
		  headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		  },
		});
	  } catch (err) {
		return new Response(
		  JSON.stringify({ error: err.toString() }),
		  { status: 500 }
		);
	  }
	}
  };