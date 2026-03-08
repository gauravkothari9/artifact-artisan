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

    const prompt = `You are compositing a product into a museum gallery photograph. The output must be photorealistic — indistinguishable from a real DSLR photo (Canon 5D, 50mm lens, f/4, ISO 400) taken inside a prestigious gallery at the Louvre or MoMA.

PRODUCT:
- Preserve the product EXACTLY from the input: same angle, orientation, colors, textures, proportions, lighting.
- Do not redraw, re-render, stylize, or alter the product in any way. Treat it as a pixel-accurate cutout composited into the scene.

ENVIRONMENT — DARK GALLERY WITH WARM MARBLE FLOOR:

WALL (upper ~65% of frame):
- Color: Dark charcoal gray (#4A4A4E to #55555A). NOT light, NOT medium gray — truly DARK.
- Surface: Smooth matte plaster with a velvety, slightly chalky texture visible at close inspection. Think freshly painted museum gallery wall.
- Gradient: Very subtle — fractionally darker at top, fractionally lighter approaching the floor, as natural ambient light creates.
- The wall extends edge-to-edge and top-to-bottom of the upper 65%. No ceiling line, no fixtures, no track lights, no rails, no moldings. Pure uninterrupted dark wall.

FLOOR (lower ~35% of frame):
- Material: Polished light-toned marble — light warm beige/cream base (#D9CFC2 to #E5DDD2) with subtle soft warm veining.
- The marble is LIGHT and WARM-TONED: light beige, cream, ivory, light tan. NOT dark brown, NOT dark marble, NOT Emperador Dark. Think light Crema Marfil or Botticino marble.
- Surface: Highly polished with a glossy sheen. Soft reflections of the product's base visible on the floor.
- Tile joints: Very faint, subtle tile seam lines in a large-format pattern.
- Veining: Subtle, low-contrast — soft warm tan/light brown veins blending gently into the light base. Elegant and understated.

WALL-FLOOR JUNCTION:
- A clean, sharp horizontal line at approximately 65% from the top. No baseboard, no molding, no shadow line — just a crisp material transition.
- Very subtle ambient occlusion darkening right at the junction where wall meets floor.

PHOTOGRAPHIC REALISM (crucial for believability):
- LIGHTING: Soft, warm, diffused ambient light from hidden overhead sources (no visible fixtures). Color temperature ~3200K (warm tungsten/gallery lighting). Creates gentle, even illumination across the wall and floor. Soft light falloff from center toward edges — subtle natural vignette.
- SHADOWS: The product casts a realistic soft contact shadow on the marble directly beneath and slightly behind it. Shadow opacity ~30-40%, soft-edged, matching the product's silhouette. The shadow grounds the product in the space.
- REFLECTIONS: The polished marble shows a soft, slightly blurred reflection of the product's base — visible but not mirror-sharp. The reflection fades naturally with distance from the product.
- DEPTH: Subtle atmospheric perspective — very slight warm haze/tonal softening between the camera and the back wall, giving a sense of real 3D space with air in it.
- GRAIN: Very subtle photographic film grain consistent with ISO 400 — gives the image a real-camera feel rather than a CGI-clean look.
- COLOR GRADING: Slightly warm overall tone. Rich, deep shadows. Smooth highlight rolloff on the marble surface.

FORBIDDEN (never include any of these):
- Track lights, spotlights, ceiling lights, any visible light fixtures
- Visible ceiling or ceiling line
- Pedestals, display cases, ropes, stanchions, museum furniture
- Other objects, people, signage, or text (except placard if enabled)
- Architectural details: columns, rails, baseboards, doorways
- Any element not explicitly described above

COMPOSITION:
- Format: ${aspectRatio === '3:2' ? 'Landscape 3:2 (1536×1024 pixels)' : 'Square 1:1 (1024×1024 pixels)'}
- Product CENTERED horizontally in the frame — dead center, not shifted left or right
- Product sits on the floor in the lower-center area, naturally grounded
- Camera: Straight-on view, slightly elevated (~15° above floor level), typical museum/gallery product photography angle
- Framing: Product occupies roughly 40-50% of the image height, with breathing room above and to the sides

${placardSection}

The final image must feel like an editorial photograph from a museum catalog — warm, atmospheric, grounded, and unmistakably real.`;

    const systemPrompt = `You are a world-class museum photography compositor specializing in creating photorealistic gallery images. Every image you create follows these IMMUTABLE rules:
- WALL: Always dark charcoal gray (#4A4A4E–#55555A), smooth matte plaster. No ceiling, no lights, no fixtures ever visible.
- FLOOR: Always warm brown Emperador marble (#C4B5A4 base) with subtle, low-contrast warm veining. Highly polished glossy surface with visible reflections. The floor is NEVER white, NEVER gray, NEVER Carrara, NEVER cool-toned. Always warm brown/tan/beige. Veining is gentle and muted, not bold or dramatic.
- LIGHTING: Warm diffused ambient (~3200K), no visible sources. Soft contact shadows. Subtle film grain.
- COMPOSITION: Product always dead-center horizontally, grounded on the floor with realistic shadow and marble reflection.
- ATMOSPHERE: Subtle depth haze, warm color grading, photographic quality indistinguishable from a real DSLR photograph.`;

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
            role: "system",
            content: systemPrompt,
          },
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
