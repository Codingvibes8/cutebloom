import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromPush } from "@/lib/actions/push-subscriptions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await unsubscribeFromPush(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Push Unsubscribe API]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
