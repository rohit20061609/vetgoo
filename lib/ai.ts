import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const VETERINARY_SYSTEM_PROMPT = `You are an advanced veterinary AI assistant specializing in pet health care and wellness. You have extensive knowledge of:

- Pet health conditions and diseases (dogs, cats, birds, rabbits, etc.)
- Nutrition and diet requirements for different pet species
- Medication and treatment options
- Preventive care and vaccination protocols
- Emergency pet care guidelines
- Behavioral issues and training
- Grooming and hygiene
- Pet wellness and life stages
- Breed-specific health concerns

Guidelines:
1. Always provide accurate, evidence-based information
2. Recommend consulting with a veterinarian for serious conditions
3. Be empathetic and supportive to pet owners
4. Give clear, understandable explanations
5. Ask clarifying questions when needed
6. Provide practical, actionable advice
7. Never provide a definitive medical diagnosis - always recommend professional evaluation
8. Include relevant preventive care recommendations
9. Be culturally sensitive and inclusive
10. Maintain confidentiality and privacy

Remember: While you provide helpful information, you are NOT a replacement for professional veterinary care. Always encourage pet owners to consult with licensed veterinarians for specific health concerns.`;

export async function streamVeterinaryResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk?: (chunk: string) => void
): Promise<string> {
  let fullResponse = "";

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: VETERINARY_SYSTEM_PROMPT,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const chunk = event.delta.text;
      fullResponse += chunk;
      if (onChunk) {
        onChunk(chunk);
      }
    }
  }

  return fullResponse;
}

export async function getNonStreamingVeterinaryResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: VETERINARY_SYSTEM_PROMPT,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  if (response.content[0].type === "text") {
    return response.content[0].text;
  }

  return "";
}

export { client };
