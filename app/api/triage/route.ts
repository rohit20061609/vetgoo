import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { VET_SYSTEM_PROMPT } from "@/lib/ai/systemPrompt";
import { triageSchema } from "@/lib/schemas";
import { z } from "zod";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input with schema
    const { message, species, history } = triageSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format conversation history for Claude
    const messages = history.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messages.push({ role: "user" as const, content: message });

    // Stream response from Claude
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          const response = await client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: VET_SYSTEM_PROMPT,
            messages: messages,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = event.delta.text;
              fullResponse += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Extract JSON from markdown code blocks if needed
          let jsonResponse = fullResponse;
          const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            jsonResponse = jsonMatch[1];
          }

          // Note: TriageSession model does not exist in Prisma schema
          // To save triage sessions, you would need to either:
          // 1. Add a TriageSession model to prisma/schema.prisma
          // 2. Or use ConversationSession for storing conversations
          // For now, the response is streamed but not persisted
          try {
            JSON.parse(jsonResponse);
            // Optionally log the response for analytics
            console.log("Triage response generated for user:", user.id, "Pet type:", species);
          } catch (e) {
            // If parsing fails, still continue - the response is already sent
            console.error("Error parsing triage response:", e);
          }

          controller.close();
        } catch (error) {
          console.error("Triage error:", error instanceof Error ? error.message : String(error));
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Triage error:", error instanceof Error ? error.message : String(error));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
