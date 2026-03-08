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
MUSEUM PLACARD — CRITICAL ELEMENT, MUST BE PERFECT:

VISIBILITY & Z-ORDER (HIGHEST PRIORITY):
- The placard MUST be clearly visible, fully readable, and NEVER obscured by the product or any other element.
- The placard is the TOP-MOST LAYER — it renders IN FRONT of everything else. If the product and placard overlap, the placard is ALWAYS on top.
- The placard must be LARGE ENOUGH to read all text clearly. Width = 15% of image width (larger than before for readability).

POSITION:
- Bottom-left corner of the image.
- Left edge = 3% from left edge of image. Bottom edge = 3% from bottom edge of image.
- The placard sits on the floor, leaning slightly against an invisible support. It faces the camera directly.
- NEVER floating, NEVER centered, NEVER on the right side.

SIZE & SHAPE:
- 3:2 aspect ratio (wider than tall). Width = 15% of image width. Height = width × (2/3).
- Landscape-oriented. Same physical size in both 1:1 and 3:2 images.

APPEARANCE:
- A FLAT, CLEAN white card (#FFFFFF background) with a thin dark border (#333333, 1px).
- Sharp 90-degree corners. NO rounded corners.
- The card should look like a real physical museum label card — clean, crisp, professional.
- Subtle small shadow beneath the card to ground it on the floor.

TEXT (MUST BE SHARP, CRISP, AND FULLY READABLE — this is critical):
- Font: Classic serif (Times New Roman style). Pure black (#000000) text.
- ALL text must be SHARP and CRISP — no blurring, no fuzziness, no artifacts. Every letter must be clearly legible.
- Text is LEFT-aligned with generous padding inside the card.
- Line 1 (BOLD, largest size): Artifact No. ${artifactNumber}
- Line 2 (normal weight, smaller): ${title}
- Line 3 (normal weight, smaller): Origin: ${origin}
- Line 4 (normal weight, smaller): Material: ${material}
- Line 5 (normal weight, smaller): Size: ${size}
- Line 6 (normal weight, smaller): Est. Age: ${estimatedAge}
- ONLY Line 1 is bold. Lines 2-6 are regular weight.
- Do NOT include formatting instructions as visible text.

CONSISTENCY: The placard must look identical in every generated image — same size, style, font, colors, position.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are compositing a product into a museum gallery photograph. The output must be photorealistic — indistinguishable from a real DSLR photo (Canon 5D, 50mm lens, f/4, ISO 400) taken inside a prestigious gallery at the Louvre or MoMA.

PRODUCT — ABSOLUTE HIGHEST PRIORITY RULE:
- The product in the input image is SACRED. You MUST NOT change it in ANY way.
- Do NOT redraw, re-render, re-imagine, regenerate, stylize, or artistically interpret the product.
- Do NOT change the product's shape, proportions, colors, textures, details, angle, orientation, or perspective.
- Do NOT add new lighting, shadows, highlights, reflections, or color shifts to the product itself.
- Do NOT simplify, smooth, sharpen, blur, or modify any surface detail of the product.
- The product must appear as an EXACT pixel-perfect copy from the input photo, simply placed into the museum scene.
- Think of this as a photo editing task: cut out the product from the original photo and paste it onto the museum background. The product pixels must be IDENTICAL to the input.

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
- FLOOR: Always LIGHT warm-toned marble (#D9CFC2 to #E5DDD2 base) — light beige/cream/ivory with subtle soft warm veining. Highly polished glossy surface. NOT dark brown, NOT Emperador Dark, NOT gray, NOT cool-toned. Think Crema Marfil or Botticino marble.
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
