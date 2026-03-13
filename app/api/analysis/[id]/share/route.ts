import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/Analysis";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid analysis ID" }, { status: 400 });
    }

    await connectDB();
    const analysis = await Analysis.findById(id).lean();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newIsPublic = !analysis.isPublic;
    await Analysis.findByIdAndUpdate(id, { isPublic: newIsPublic });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.json({
      isPublic: newIsPublic,
      shareUrl: newIsPublic ? `${baseUrl}/share/${id}` : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
