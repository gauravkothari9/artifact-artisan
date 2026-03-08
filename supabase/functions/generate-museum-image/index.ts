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

    const { imageBase64, artifactNumber, title, origin, material, estimatedAge } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const prompt = `You are a professional product photographer for a high-end antique ecommerce store.

Create a museum-style product display image with the following specifications:

BACKGROUND: Dark charcoal-to-gray gradient museum wall. The wall should have subtle texture.
FLOOR: Neutral stone/concrete floor in a warm gray-beige tone (#B7ADA2).
LIGHTING: Soft spotlight from above, focused on the product. Subtle vignette at edges.
PRODUCT: Place the product from the provided image centered on the floor, naturally sitting on the surface. Add a realistic soft shadow beneath it.

MUSEUM LABEL: Place a small white/cream museum information placard in the bottom-left corner of the image, sitting on the floor. The placard should have:
- Light cream/stone colored background
- Elegant serif typography
- The following text layout:
  Line 1 (bold, centered): "Artifact #${artifactNumber}"
  Line 2 (centered): "${title}"
  Line 3 (centered): "Origin: ${origin}"
  Line 4 (centered): "Material: ${material}"  
  Line 5 (centered): "Estimated Age: ${estimatedAge}"

The image must be a 1:1 square format. Make it look like a real museum exhibit photograph - professional, elegant, and consistent.

IMPORTANT: Keep the product exactly as it appears in the provided image. Do not modify the product itself. Only place it in the museum setting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
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
