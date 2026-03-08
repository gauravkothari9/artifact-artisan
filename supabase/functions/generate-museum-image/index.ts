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
- MUSEUM PLACARD — MANDATORY FIXED TEMPLATE. ZERO VARIATION ALLOWED. MUST BE IDENTICAL IN EVERY IMAGE REGARDLESS OF ASPECT RATIO (1:1 OR 3:2):
  * THIS IS THE SINGLE MOST IMPORTANT ELEMENT TO GET RIGHT. The placard must look EXACTLY THE SAME in both 1:1 and 3:2 images — same physical size on screen, same style, same colors, same font, same position relative to bottom-left corner.
  * POSITION — FIXED, NEVER CHANGES BETWEEN 1:1 AND 3:2:
    - The placard is ALWAYS in the BOTTOM-LEFT corner.
    - Left edge of placard = exactly 3% from the LEFT edge of the image (in both square and landscape).
    - Bottom edge of placard = exactly 2% from the BOTTOM edge of the image (in both square and landscape).
    - In landscape (3:2), the left edge is still 3% from the left — do NOT move it to the center or further right. 3% of a wider image means a slightly larger pixel offset, but it must remain flush to the bottom-left corner.
    - The placard sits on the floor, leaning against the wall. NEVER floating, NEVER centered, NEVER on the right side.
    - Z-ORDER / LAYERING: The placard is ALWAYS rendered IN FRONT of the product and all other elements. It must NEVER be occluded, hidden, or partially covered by the product. The placard is the TOP-MOST layer in the scene. If the product and placard overlap, the placard is ALWAYS on top, fully visible.
  * SIZE: The placard is a SMALL card — approximately 80 pixels wide and 120 pixels tall in a 1024-pixel-tall image. When the image is landscape (wider), the placard stays THE SAME SIZE — do NOT scale it to the wider width. The placard size is relative to IMAGE HEIGHT only: width = 8% of image HEIGHT, height = 12% of image HEIGHT. This ensures it looks identical in both square and landscape formats.
  * SHAPE: Flat rectangle. Sharp 90-degree corners. NO rounded corners. NO 3D perspective. NO curling. NO shadow on card. Slight 2-degree clockwise tilt.
  * APPEARANCE (NEVER CHANGE THIS — SAME IN EVERY IMAGE):
    - Background: Solid pure white #FFFFFF — not cream, not off-white
    - Border: Thin 1px solid #333333 on all 4 sides
    - All text: Pure black #000000, classic serif font (like Times New Roman)
    - Text is left-aligned with small internal padding
  * TEXT CONTENT (6 lines, top to bottom):
    - Line 1 (bold, title size): "Artifact No. ${artifactNumber}" — Use "No." (capital N, lowercase o, period). Must be CRISP and LEGIBLE.
    - Line 2 (regular): "${title}"
    - Line 3 (smaller): "Origin: ${origin}"
    - Line 4 (smaller): "Material: ${material}"
    - Line 5 (smaller): "Size: ${size}"
    - Line 6 (smaller): "Est. Age: ${estimatedAge}"
  * ABSOLUTE CONSISTENCY: The placard in a 3:2 landscape image must be VISUALLY IDENTICAL to the placard in a 1:1 square image — same card size on screen, same font size, same style, same colors. The ONLY difference is that in landscape there is more background space to the right. The placard itself NEVER changes.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are a professional product photographer creating a museum exhibit photo.

RULE #1 — PRODUCT PRESERVATION (HIGHEST PRIORITY — MORE IMPORTANT THAN EVERYTHING ELSE):
The product in the provided photo is SACRED and UNTOUCHABLE. You are performing a COMPOSITING task, NOT a generation task.
- Extract the product from the input image and place it into the scene AS-IS. Think of it as a cut-and-paste operation.
- Do NOT re-draw, re-render, re-imagine, re-interpret, or regenerate the product. Use the EXACT pixels from the input.
- Do NOT change the product's ANGLE, ORIENTATION, or PERSPECTIVE. If the product faces left in the input, it faces left in the output. If it's tilted, it stays tilted. Do NOT rotate, flip, mirror, or reposition the product's pose.
- Do NOT change the product's SIZE or SCALE. It must occupy the same relative area as in the input.
- Do NOT change the product's COLORS, BRIGHTNESS, CONTRAST, SATURATION, or LIGHTING. No spotlights, no glow, no rim light, no highlights, no shadows ON the product.
- Do NOT add or remove any details, textures, or features from the product.
- Do NOT "improve" or "enhance" the product in any way. Raw, unmodified pixel transfer only.
- The product must look like you used scissors to cut it from the original photo and pasted it onto the museum background. ZERO artistic interpretation.
- If the output product differs from the input product in ANY way — angle, color, size, lighting, texture, orientation — the image is REJECTED.

RULE #2 — LIGHTING (MANDATORY):
- The ENTIRE scene uses ONLY flat, ambient, even, diffused lighting. ZERO directional light sources.
- There is NO spotlight. NO light beam. NO light cone. NO bright spot. NO dramatic lighting. NO rim lighting.
- The wall color stays uniform #3A3A3A-#4A4A4A. The floor color stays uniform #B7ADA2. NO lighting variation on surfaces.
- The ONLY shadow allowed: a very subtle, soft shadow directly beneath the product on the floor.

RULE #3 — LAYOUT:
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1200x800 pixels). Wider than tall. VERY IMPORTANT FOR LANDSCAPE: Imagine you have ALREADY created the perfect 1:1 square museum image with the product. Now you are simply EXTENDING THE CANVAS to the left and right by adding more wall and floor. The product in the center is COMPLETELY UNCHANGED — same pixels, same angle, same size, same lighting, same everything. You are NOT creating a new image. You are widening an existing one. The product must be IDENTICAL to what it would look like in a 1:1 version.' : 'Perfect 1:1 square (e.g. 1024x1024 pixels).'}
- WALL: Top 65% of image. FLAT dark charcoal gradient #3A3A3A (top) to #4A4A4A (bottom). Very subtle fine concrete/plaster texture. NOT brick, NOT wood, NOT stucco.
- FLOOR: Bottom 35% of image. FLAT warm gray-beige stone #B7ADA2. Smooth, matte. NOT marble, NOT wood, NOT tile.
- Wall-to-floor transition: Clean straight horizontal line at exactly 65% from top. No baseboards, no moldings.
- PRODUCT PLACEMENT: This is a COMPOSITING task. Cut the product out of the input photo and paste it dead center horizontally on the floor. Do NOT redraw it. Do NOT change its angle or orientation. Do NOT add lighting effects to it. The product in the output must be a PIXEL-PERFECT copy of the product in the input — same angle, same pose, same colors, same shadows that were already on it. Only the BACKGROUND changes (wall + floor). The product itself is UNTOUCHED.

${placardSection}

FINAL CHECKLIST (ALL MUST BE TRUE OR IMAGE IS REJECTED):
1. Product is PIXEL-IDENTICAL to input — same size, same colors, same lighting, NO modifications whatsoever.
2. Product size is UNCHANGED — not shrunk, not enlarged, not rescaled.
3. Lighting is FLAT and EVEN everywhere — ZERO spotlights, ZERO directional lights, ZERO light cones or beams.
4. Wall is #3A3A3A-#4A4A4A, floor is #B7ADA2 — uniform colors, NO lighting variation.
5. ${showPlacard ? 'Placard is a SMALL card (8% width, 12% height), bottom-left corner (3% from left, 2% from bottom), white #FFFFFF background, thin #333333 border, black serif text. It must look IDENTICAL in every single generated image — same tiny size, same position, same style. NEVER make it bigger or move it.' : 'NO text, labels, or placards anywhere.'}
6. No additional objects, decorations, or elements beyond product, wall, floor${showPlacard ? ', and placard' : ''}.
7. Photorealistic museum exhibit photograph style.`;

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
