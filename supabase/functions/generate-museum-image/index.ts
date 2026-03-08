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

    const { imageBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = true, aspectRatio = '1:1' } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const placardSection = showPlacard ? `
- MUSEUM PLACARD — MANDATORY FIXED POSITION AND SIZE (NEVER DEVIATE):
  * POSITION: The placard is located in the BOTTOM-LEFT corner of the image. Its left edge is at exactly 3% from the left edge of the image. Its bottom edge is at exactly 2% from the bottom edge of the image. It sits upright on the floor, flush against the wall. NEVER place the placard anywhere else — not center, not right, not floating, not on the wall. ALWAYS bottom-left.
  * SIZE: The placard width is EXACTLY 10% of the total image width. The placard height is EXACTLY 14% of the total image height. NEVER make it bigger or smaller.
  * SHAPE: A perfectly flat, rectangular card with SHARP 90-degree corners. NO rounded corners. NO folding. NO 3D perspective. NO shadow on the card itself. Slight 2-degree clockwise tilt.
  * CARD COLOR: Solid pure white (#FFFFFF) background with a 1px solid dark gray (#333333) border on all four sides.
  * TYPOGRAPHY: ALL text is BLACK (#000000). Use a classic serif font (Times New Roman style). Left-aligned with 8% internal padding on all sides.
  * TEXT LAYOUT (top to bottom, evenly spaced within the card):
    - Line 1 (bold, largest): "Artifact #${artifactNumber}"
    - Line 2 (regular): "${title}"
    - Line 3 (regular, smaller): "Origin: ${origin}"
    - Line 4 (regular, smaller): "Material: ${material}"
    - Line 5 (regular, smaller): "Size: ${size}"
    - Line 6 (regular, smaller): "Est. Age: ${estimatedAge}"
  * ABSOLUTE RULE: The placard MUST be in the bottom-left at 3% from left and 2% from bottom, 10% width, 14% height, white with black border and black text. This is NON-NEGOTIABLE and must be IDENTICAL in every single generated image. If you place it anywhere else or change its size, the image is WRONG.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are a professional product photographer creating a museum exhibit photo. Your #1 priority is to PRESERVE THE PRODUCT EXACTLY AS IT APPEARS in the provided photo. Do NOT alter, modify, reshape, recolor, or artistically reinterpret the product in any way. The product must look IDENTICAL to the input photo — same shape, same colors, same textures, same details, same proportions.

EXACT LAYOUT SPECIFICATION (follow precisely every time — NO variation between images):
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1200x800 pixels). Wider than tall.' : 'Perfect 1:1 square (e.g. 1024x1024 pixels).'}

MANDATORY BACKGROUND (USE EXACTLY THIS EVERY TIME — NEVER CHANGE):
- WALL: The top 65% of the image is a FLAT, SOLID dark charcoal wall. Use EXACTLY these hex colors: a subtle vertical gradient from #3A3A3A at the top to #4A4A4A at the bottom. The wall must have a very subtle, fine concrete/plaster texture — NOT brick, NOT wood, NOT stucco, NOT smooth paint. The same identical wall appearance in every single image. NO patterns, NO decorations, NO color variation beyond the specified gradient.

MANDATORY FLOOR (USE EXACTLY THIS EVERY TIME — NEVER CHANGE):
- FLOOR: The bottom 35% of the image is a FLAT, SOLID warm gray-beige stone surface. Use EXACTLY hex color #B7ADA2. The floor must be perfectly clean, smooth, matte stone — NOT marble, NOT wood, NOT tile, NOT polished. NO visible seams, NO joints, NO reflections, NO texture variations. The exact same flat #B7ADA2 stone floor in every single image.

- The wall-to-floor transition must be a clean, straight horizontal line at exactly 65% from the top. No curved transitions, no baseboards, no moldings.

- PRODUCT PLACEMENT: Place the UNMODIFIED product from the provided photo dead center horizontally, sitting naturally on the floor surface. The product should occupy roughly 40-50% of the image width and be vertically centered between floor and top of image.
- LIGHTING: Single soft spotlight from directly above the product. Gentle vignette darkening at all four edges. Subtle soft shadow directly beneath the product on the floor. Do NOT change the wall or floor colors with lighting — the wall stays #3A3A3A-#4A4A4A and floor stays #B7ADA2 regardless of lighting.
${placardSection}
CRITICAL RULES (MUST FOLLOW ALL):
1. NEVER modify, alter, or reinterpret the product. It must be a pixel-accurate representation of the input photo, just placed in the museum scene.
2. The layout must be IDENTICAL every time: wall on top (#3A3A3A-#4A4A4A), floor on bottom (#B7ADA2), product centered. NEVER use different colors.
3. ${showPlacard ? 'The placard MUST use the EXACT same design every time: white rectangle, black border, black serif text, bottom-left position. Never vary fonts, colors, shape, or position of the placard.' : 'ABSOLUTELY NO text, labels, placards, or any writing anywhere in the image. Zero text elements.'}
4. No additional objects, decorations, or elements beyond the product, wall, floor${showPlacard ? ', and placard' : ''}.
5. Photorealistic museum exhibit photograph style.
6. The product's appearance is SACRED — do not change it.
7. The background wall and floor must look IDENTICAL in every generated image. Same colors, same textures, same proportions. NEVER vary them.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
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
