export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const GALLERY_KV = 'rubin_gallery';

    // Validate image object
    function isValidImage(img) {
      return img &&
        typeof img.id === 'string' &&
        typeof img.src === 'string' &&
        img.src.startsWith('http');
    }

    try {
      // GET - 获取所有图片
      if (request.method === 'GET') {
        const data = await env.KV.get(GALLERY_KV, 'json');
        let flat = [];

        if (Array.isArray(data)) {
          // Flatten and filter valid images
          flat = data.flat().filter(isValidImage);
        }

        return new Response(JSON.stringify(flat), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST - 上传整个列表（替换）
      if (request.method === 'POST') {
        const body = await request.json();
        let images = [];

        if (Array.isArray(body)) {
          // Filter valid images only
          images = body.filter(isValidImage);
        }

        // Save to KV
        await env.KV.put(GALLERY_KV, JSON.stringify(images));
        return new Response(JSON.stringify({ success: true, count: images.length }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // DELETE - 删除图片
      if (request.method === 'DELETE') {
        const { id } = await request.json();
        const data = await env.KV.get(GALLERY_KV, 'json') || [];
        let flat = Array.isArray(data) ? data.flat() : [];
        const filtered = flat.filter(img => img.id !== id);
        await env.KV.put(GALLERY_KV, JSON.stringify(filtered));
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response('Method not allowed', { status: 405 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }
};
