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
    - In landscape (3:2), the left edge is still 3% from the left — do NOT move it to the center or further right.
    - The placard sits on the floor, leaning against the wall. NEVER floating, NEVER centered, NEVER on the right side.
    - Z-ORDER / LAYERING: The placard is ALWAYS rendered IN FRONT of the product and all other elements. It must NEVER be occluded, hidden, or partially covered by the product. The placard is the TOP-MOST layer in the scene.
  * SIZE & SHAPE RATIO: The placard card itself MUST have a 3:2 aspect ratio (wider than tall). Width = exactly 10% of image WIDTH. Height = width × (2/3). The placard is ALWAYS landscape-oriented (wider than tall). In landscape images, keep the SAME pixel size as in square — do NOT shrink it.
  * SHAPE & REALISM: The placard must look like a REAL PHYSICAL museum placard photographed in the scene. It should have realistic 3D perspective — slightly angled as if it's a small card sitting on the floor and leaning against the wall at a slight angle. It should look like a real object in the space, NOT a flat 2D overlay pasted on top. Add a subtle natural shadow beneath/behind the placard. The card should have slight depth and realistic lighting matching the scene. Sharp 90-degree corners, NO rounded corners, NO curling.
  * TEXT STYLING (CRITICAL — MUST BE EXACTLY THE SAME EVERY TIME, ZERO VARIATION):
    - Font: Classic serif font (Times New Roman style)
    - ONLY Line 1 is BOLD. Lines 2 through 6 are REGULAR/NORMAL weight — they must NOT be bold.
    - Color: Pure black #000000 text on solid pure white #FFFFFF background
    - ALL text is SHARP, CRISP, and FULLY READABLE. NO blurring, NO fuzzy text.
    - Text alignment: LEFT-aligned with generous internal padding
    - Border: Thin 1px solid #333333 on all 4 sides
    - This exact styling must be IDENTICAL in every generated image. NEVER make lines 2-6 bold.
  * TEXT CONTENT (exactly 6 lines, top to bottom):
    - Line 1 (BOLD, largest font size): Artifact No. ${artifactNumber}
    - Line 2 (NORMAL weight, smaller font): ${title}
    - Line 3 (NORMAL weight, smaller font): Origin: ${origin}
    - Line 4 (NORMAL weight, smaller font): Material: ${material}
    - Line 5 (NORMAL weight, smaller font): Size: ${size}
    - Line 6 (NORMAL weight, smaller font): Est. Age: ${estimatedAge}
    RULE: ONLY Line 1 is bold. Lines 2-6 must be regular/normal weight. Do NOT include any formatting instructions or style descriptors as visible text.
  * ABSOLUTE CONSISTENCY: The placard in a 3:2 landscape image must be VISUALLY IDENTICAL to the placard in a 1:1 square image — same card size on screen, same font size, same style, same colors. The ONLY difference is that in landscape there is more background space to the right. The placard itself NEVER changes.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are compositing a product into a museum gallery photograph. The museum environment is a FIXED TEMPLATE that NEVER changes between images. Every single image you generate must have the EXACT SAME wall and floor — as if photographed in the same room.

PRODUCT:
- Extract the product from the input photo and composite it into the scene. Preserve the product EXACTLY as-is: same angle, colors, proportions, scale, lighting. Do NOT redraw, re-render, or alter the product in any way.
- Place the product centered horizontally on the floor, grounded naturally.

MUSEUM ENVIRONMENT (FIXED TEMPLATE — IDENTICAL IN EVERY IMAGE):

WALL:
- Occupies the upper 65% of the image.
- Color: Solid uniform dark charcoal gray. Hex #3D3D3D. RGB(61,61,61).
- Surface: Smooth matte plaster finish. Uniform color across the entire wall — no gradients, no lighter patches, no darker corners, no color shifts. The wall is ONE flat color with a barely perceptible fine plaster texture.
- DO NOT make the wall blue-gray, brown-gray, green-gray, or any tinted gray. It is NEUTRAL charcoal gray #3D3D3D.

FLOOR:
- Occupies the lower 35% of the image.
- Material: Classic polished Carrara-style white marble.
- Color: Creamy white base (#E8E0D8) with thin subtle gray veins (a classic Carrara marble look).
- The marble must be a SINGLE CONTINUOUS slab — NO tile grid lines, NO grout lines, NO individual tiles visible. It is one seamless polished marble surface.
- The marble veining pattern should be subtle and elegant — thin gray lines on a warm white base.
- Finish: Gently polished with a soft natural sheen. Not mirror-reflective, but has the characteristic gentle glow of real polished marble.
- THIS EXACT SAME MARBLE must appear in every image. Imagine it is one real marble floor — every photo is taken in the same spot.

WALL-FLOOR JUNCTION:
- A single perfectly straight horizontal line where the wall meets the floor, at exactly 65% from the top of the image.
- NO baseboard, NO molding, NO shadow line at the junction. Just a clean edge.

LIGHTING:
- Soft, even, ambient overhead light — like diffused museum ceiling lighting.
- NO spotlights, NO directional beams, NO dramatic lighting effects on the wall or floor.
- The wall should be evenly lit with no visible light falloff.
- The floor should be evenly lit with a gentle natural marble sheen.
- The product casts a subtle soft contact shadow on the marble floor directly beneath it. This is the ONLY variable shadow.

SCENE COMPOSITION:
- ${aspectRatio === '3:2' ? 'Landscape 3:2 ratio (1536x1024 pixels). Wider than tall.' : 'Perfect square 1:1 ratio (1024x1024 pixels).'}
- Camera angle: Straight-on, slightly above eye level, like a museum catalog photograph.
- NOTHING else in the scene except the wall, marble floor, product${showPlacard ? ', and placard' : ''}. No pedestals, no other objects, no decorations.

${placardSection}

ABSOLUTE RULES:
1. Wall = #3D3D3D uniform charcoal gray. No tint. No variation.
2. Floor = Carrara white marble, seamless slab, no tile lines.
3. These two elements are a FIXED BACKDROP. They look IDENTICAL in every image regardless of the product.
4. Product is preserved exactly from input — not redrawn.
5. Only the product and its contact shadow change between images. Everything else is the same.`;

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
