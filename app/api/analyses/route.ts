import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/Analysis";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    await connectDB();
    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("repoUrl errorMessage branch aiResult createdAt")
        .lean(),
      Analysis.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      analyses: analyses.map((a) => ({
        id: a._id.toString(),
        repoUrl: a.repoUrl,
        errorPreview: a.errorMessage.slice(0, 200) + (a.errorMessage.length > 200 ? "…" : ""),
        branch: a.branch,
        suspectedSha: a.aiResult?.suspected_commit_sha?.slice(0, 7),
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
