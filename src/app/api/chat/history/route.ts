// ============================================
// app/api/chat/history/route.ts - Get Chat History for a Session
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getChatHistory } from "@/lib/chatHistory";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (userId, sessionId)" },
        { status: 400 }
      );
    }

    const history = await getChatHistory(userId, sessionId);

    if (!history) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: history.messages });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
