import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the latest exam result for this exam
    const result = await prisma.examResult.findFirst({
      where: {
        examId: id,
        userId: user.id,
      },
      orderBy: {
        takenAt: "desc",
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ taken: false, score: null, percentage: null })
    }

    // Calculate score
    const totalQuestions = result.exam.questions.length
    const answers = JSON.parse(result.answers)
    const correctAnswers = result.exam.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length

    return NextResponse.json({
      taken: true,
      score: result.score,
      percentage: result.score,
      totalQuestions,
      correctAnswers,
      passed: result.passed,
      submittedAt: result.takenAt,
    })
  } catch (error) {
    console.error("Error fetching exam result:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
