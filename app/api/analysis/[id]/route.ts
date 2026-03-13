import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/Analysis";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid analysis ID" }, { status: 400 });
    }

    await connectDB();
    const analysis = await Analysis.findById(id).lean();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Public analyses are accessible without auth
    if (!analysis.isPublic) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (analysis.userId && analysis.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const suspectedCommit = analysis.analyzedCommits?.find(
      (c) => c.sha === analysis.aiResult?.suspected_commit_sha
    );

    return NextResponse.json({
      id: analysis._id.toString(),
      repoUrl: analysis.repoUrl,
      errorMessage: analysis.errorMessage,
      branch: analysis.branch,
      aiResult: analysis.aiResult,
      analyzedCommits: analysis.analyzedCommits.map((c) => ({
        sha: c.sha,
        message: c.message,
        author: c.author,
        date: c.date,
      })),
      suspectedCommitDiff: suspectedCommit?.diff,
      isPublic: analysis.isPublic ?? false,
      createdAt: analysis.createdAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
