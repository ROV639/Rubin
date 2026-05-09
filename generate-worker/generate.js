/**
 * Rubin Gallery Generate Worker
 * Public Cloudflare Worker for MiniMax/Laozhang API generation
 */

const MINIMAX_API_URL = "https://api.minimaxi.com/v1";
const LAOZHANG_API_URL = "https://api.laozhang.ai/v1";

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/" && request.method === "GET") {
        return jsonResponse({ status: "ok" }, corsHeaders);
      }

      if (path === "/generate/image" && request.method === "POST") {
        return handleImageGeneration(request, env, corsHeaders);
      }

      if (path === "/generate/music" && request.method === "POST") {
        return handleMusicGeneration(request, env, corsHeaders);
      }

      if (path === "/generate/tts" && request.method === "POST") {
        return handleTTSGeneration(request, env, corsHeaders);
      }

      return jsonResponse({ error: "Not found" }, corsHeaders, 404);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: err.message }, corsHeaders, 500);
    }
  },
};

async function handleImageGeneration(request, env, corsHeaders) {
  const contentType = request.headers.get("Content-Type") || "";

  let body;
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        body[key] = await value.arrayBuffer();
      } else {
        body[key] = value;
      }
    }
  } else {
    body = await request.json();
  }

  const { model = "image-01", prompt, ratio, style, image_file } = body;

  if (model === "laozhang-gpt-image-2") {
    // Laozhang GPT-Image-2
    const laozhangBody = {
      model: "gpt-image-2",
      prompt,
      size: "1024x1024",
      quality: "high",
      n: 1,
    };

    if (image_file) {
      laozhangBody.image = image_file;
    }

    const response = await fetch(`${LAOZHANG_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.LAOZHANG_API_KEY}`,
      },
      body: JSON.stringify(laozhangBody),
    });

    const data = await response.json();
    return jsonResponse(data, corsHeaders, response.status);
  } else {
    // MiniMax image-01 / image-01-live
    const minimaxBody = {
      model,
      prompt,
      aspect_ratio: ratio || "1:1",
      response_format: "url",
      aigc_watermark: false,
      prompt_optimizer: false,
    };

    if (image_file) {
      minimaxBody.image_file = image_file;
    }

    const response = await fetch(`${MINIMAX_API_URL}/image_generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(minimaxBody),
    });

    const data = await response.json();
    console.log("MiniMax response:", JSON.stringify(data));
    return jsonResponse(data, corsHeaders, response.status);
  }
}

async function handleMusicGeneration(request, env, corsHeaders) {
  const body = await request.json();
  const {
    prompt,
    genre,
    mood,
    tempo,
    instrument,
    vocal,
    duration,
    lyrics,
    instrumental,
    model = "music-02",
  } = body;

  // Cloudflare Workers have 30s timeout — music takes ~60s, bypass via local use
  return jsonResponse({
    error: "Music generation via cloud Worker has 30s timeout — please use the desktop app",
    hint: "Use DaVinci DarkRoom at rubin.ccwu.cc/studio/ from your Mac, or wait for streaming support"
  }, corsHeaders, 503);

  const minimaxBody = {
    model,
    prompt,
    output_format: "url",
    duration: duration || 240,
  };
  if (lyrics) {
    minimaxBody.lyrics = lyrics;
    minimaxBody.is_instrumental = false;
  } else {
    minimaxBody.is_instrumental = true;
  }

  const response = await fetch(`${MINIMAX_API_URL}/music_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(minimaxBody),
  });

  const data = await response.json();
  return jsonResponse(data, corsHeaders, response.status);
}

async function handleTTSGeneration(request, env, corsHeaders) {
  const body = await request.json();
  const { text, voice_id = "male-qn-qingse", emotion = "neutral", speed = 1.0, format = "url" } = body;

  const minimaxBody = {
    model: "speech-2.8-hd",
    text,
    output_format: format,
    voice_setting: {
      voice_id,
      speed,
      emotion,
      vol: 1,
      pitch: 0,
    },
  };

  const response = await fetch(`${MINIMAX_API_URL}/t2a_v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(minimaxBody),
  });

  const data = await response.json();
  return jsonResponse(data, corsHeaders, response.status);
}

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}
