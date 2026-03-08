import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64, backgroundBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = false, aspectRatio = '1:1' } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const prompt = `You are compositing a product photograph into a museum gallery scene. You are given TWO images:
1. IMAGE 1 (FIRST IMAGE): The reference museum background — you MUST use this EXACT background environment. Copy its wall color, floor marble pattern, lighting, and atmosphere EXACTLY. Do NOT create a different background.
2. IMAGE 2 (SECOND IMAGE): The product photo to place into the scene.

RULE #1 — USE THE EXACT REFERENCE BACKGROUND:
- The output image MUST have the IDENTICAL wall and floor from IMAGE 1 (the reference background).
- Same wall color, same wall texture, same marble floor pattern, same marble veining, same lighting style.
- Do NOT generate a different background. Use the reference background AS-IS.
- The wall-to-floor transition line must be at the same position as in the reference.

RULE #2 — PRODUCT PRESERVATION (HIGHEST PRIORITY):
The product in IMAGE 2 is SACRED and UNTOUCHABLE.
- Extract the product from the input image and place it into the museum scene AS-IS.
- Do NOT re-draw, re-render, re-imagine, or regenerate the product. Use the EXACT pixels from the input.
- Do NOT change the product's ANGLE, ORIENTATION, PERSPECTIVE, SIZE, SCALE, COLORS, BRIGHTNESS, CONTRAST, SATURATION, or LIGHTING.
- Do NOT add spotlights, glow, rim light, highlights, or new shadows ON the product itself.
- Do NOT add or remove any details, textures, or features from the product.

RULE #3 — LAYOUT:
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1536x1024 pixels). Wider than tall.' : 'PERFECT SQUARE — exactly 1:1 aspect ratio, 1024x1024 pixels.'}
- PRODUCT PLACEMENT: Product is centered horizontally on the floor, sitting naturally as if displayed on the museum floor.
- Product casts a realistic soft contact shadow on the marble floor.
- The polished marble should show a very subtle, soft reflection of the product's base.

RULE #4 — NO TEXT OR PLACARDS:
- ABSOLUTELY NO PLACARD, text card, label, caption, or any form of text overlay anywhere in the image.
- The scene must contain ONLY the product on the museum background. Nothing else. ZERO text elements.

FINAL CHECKLIST:
1. Background is IDENTICAL to the reference image (IMAGE 1) — same wall, same floor, same lighting.
2. Product is faithful to input — same orientation, colors, and proportions.
3. Product casts a natural, soft shadow and looks physically present in the space.
4. NO text, labels, or placards anywhere.
5. No additional objects beyond product, wall, and floor.`;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...(backgroundBase64 ? [{
            type: "image_url",
            image_url: { url: backgroundBase64 },
          }] : []),
          {
            type: "image_url",
            image_url: { url: imageBase64 },
          },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages,
        modalities: ["image", "text"],
        ...(aspectRatio === '1:1' ? { image_size: "1024x1024" } : { image_size: "1536x1024" }),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-museum-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
