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

    const prompt = `You are a world-class photographer capturing a real artifact on display in a prestigious museum gallery. The output must look like a high-resolution photograph taken with a professional DSLR camera inside a real museum — NOT a 3D render, NOT a digital composite, NOT a graphic design.

RULE #1 — PRODUCT PRESERVATION (HIGHEST PRIORITY):
The product in the provided photo is SACRED and UNTOUCHABLE.
- Extract the product from the input image and place it into the museum scene AS-IS. This is a compositing task.
- Do NOT re-draw, re-render, re-imagine, or regenerate the product. Use the EXACT pixels from the input.
- Do NOT change the product's ANGLE, ORIENTATION, PERSPECTIVE, SIZE, SCALE, COLORS, BRIGHTNESS, CONTRAST, SATURATION, or LIGHTING.
- Do NOT add spotlights, glow, rim light, highlights, or new shadows ON the product itself.
- Do NOT add or remove any details, textures, or features from the product.
- The product must look like it was carefully cut from the original photo and placed into the museum scene.

RULE #2 — IDENTICAL MUSEUM ENVIRONMENT (CRITICAL — MUST BE THE SAME IN EVERY IMAGE):
The museum background and floor must be EXACTLY THE SAME in every single generated image, regardless of the product. This is a FIXED, STANDARDIZED environment — like a real museum gallery that never changes. The ONLY thing that changes between images is the product itself.

ENVIRONMENT SPECIFICATION (FIXED — NEVER VARIES):
- WALL: Top exactly 65% of image. UNIFORM dark charcoal smooth plaster wall, flat color #3D3D3D. Smooth matte finish with very subtle fine plaster grain texture. NO dramatic lighting variations, NO color shifts, NO visible gradients across the wall. The wall must look IDENTICAL in every image — same color, same texture, same tone.
- FLOOR: Bottom exactly 35% of image. UNIFORM warm gray-beige polished stone, flat color #B7ADA2. Smooth polished surface with very subtle stone grain. NO dramatic reflections, NO color variations across the floor. The floor must look IDENTICAL in every image — same color, same texture, same tone.
- WALL-FLOOR JUNCTION: Clean, sharp, perfectly straight horizontal line at exactly 65% from top. NO baseboards, NO moldings, NO rounded transitions. Just a clean edge where wall meets floor.
- LIGHTING: Soft, even, diffused ambient museum lighting from above. NO spotlights, NO directional beams, NO dramatic shadows on the wall or floor. The lighting on the environment itself must be PERFECTLY UNIFORM and IDENTICAL in every image. Only the product's contact shadow changes.
- SHADOW: The product casts a soft, subtle contact shadow on the floor directly beneath it. This is the ONLY shadow variation between images.
- ATMOSPHERE: Very subtle atmospheric depth. Minimal — do NOT add heavy haze or fog. Keep it clean and consistent.
- CONSISTENCY RULE: If you generated 100 images with different products, the wall and floor should be PIXEL-PERFECT IDENTICAL in all 100. The background is a TEMPLATE — it never changes. Think of it as a fixed studio backdrop.

RULE #3 — LAYOUT:
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1536x1024 pixels). Wider than tall.' : 'PERFECT SQUARE — exactly 1:1 aspect ratio, 1024x1024 pixels.'}
- Wall-to-floor transition: Clean straight horizontal line at approximately 65% from top. No baseboards or moldings.
- PRODUCT PLACEMENT: Product is centered horizontally on the floor, sitting naturally as if displayed on the museum floor or a low invisible pedestal. The product should look GROUNDED — like it physically exists in this space.

${placardSection}

FINAL CHECKLIST:
1. The image looks like a REAL PHOTOGRAPH taken inside a museum — not a render or digital mockup.
2. Product is faithful to input — same orientation, colors, and proportions.
3. Museum environment has realistic textures, depth, atmosphere, and natural lighting.
4. Product casts a natural, soft shadow and looks physically present in the space.
5. ${showPlacard ? 'Placard is a realistic 3:2 physical card (width = 10% of image width), bottom-left corner (3% from left, 2% from bottom), white background, thin dark border, serif text with only line 1 bold.' : 'NO text, labels, or placards anywhere.'}
6. No additional objects beyond product, wall, floor${showPlacard ? ', and placard' : ''}.
7. Overall quality: museum-grade, editorial, gallery-worthy photograph.`;

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
