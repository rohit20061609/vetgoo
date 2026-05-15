import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { VETERINARY_SYSTEM_PROMPT } from "@/lib/ai";
import { chatMessageSchema } from "@/lib/schemas";
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
    const { message, conversationId } = chatMessageSchema.parse(body);

    // Get or create conversation
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let conversation = null;
    let messages: any[] = [];

    if (conversationId) {
      conversation = await prisma.conversationSession.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      messages = conversation.messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
    } else {
      conversation = await prisma.conversationSession.create({
        data: {
          userId: user.id,
          title: message.substring(0, 50),
        },
      });
    }

    // Add user message
    await prisma.conversationMessage.create({
      data: {
        sessionId: conversation.id,
        role: "USER",
        content: message,
      },
    });

    messages.push({ role: "user" as const, content: message });

    // Stream response from Claude
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          const response = await client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: VETERINARY_SYSTEM_PROMPT,
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

          // Save full response to database
          await prisma.conversationMessage.create({
            data: {
              sessionId: conversation!.id,
              role: "ASSISTANT",
              content: fullResponse,
            },
          });

          controller.close();
        } catch (error) {
          console.error("Chat streaming error:", error?.message || error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error?.message || error);

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
