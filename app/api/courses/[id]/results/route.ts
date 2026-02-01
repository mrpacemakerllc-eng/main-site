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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id } = await params

    // Get all exam results for this user and course
    const results = await prisma.examResult.findMany({
      where: {
        userId,
        exam: {
          courseId: id,
        },
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { takenAt: "desc" },
    })

    // Transform the results to include detailed answer information and category breakdown
    const detailedResults = results.map((result) => {
      const answers = JSON.parse(result.answers)
      const questionDetails = result.exam.questions.map((q) => {
        const userAnswer = answers[q.id]
        const isCorrect = userAnswer === q.correctAnswer

        return {
          id: q.id,
          question: q.question,
          options: JSON.parse(q.options),
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
          category: q.category || "General",
        }
      })

      // Calculate category breakdown
      const categoryStats: Record<string, { correct: number; total: number; percentage: number }> = {}

      questionDetails.forEach((q) => {
        const category = q.category
        if (!categoryStats[category]) {
          categoryStats[category] = { correct: 0, total: 0, percentage: 0 }
        }
        categoryStats[category].total++
        if (q.isCorrect) {
          categoryStats[category].correct++
        }
      })

      // Calculate percentages
      Object.keys(categoryStats).forEach((category) => {
        const stats = categoryStats[category]
        stats.percentage = Math.round((stats.correct / stats.total) * 100)
      })

      return {
        id: result.id,
        examId: result.examId,
        examTitle: result.exam.title,
        examType: result.exam.examType,
        score: result.score,
        passed: result.passed,
        takenAt: result.takenAt,
        questions: questionDetails,
        totalQuestions: result.exam.questions.length,
        correctCount: questionDetails.filter((q) => q.isCorrect).length,
        categoryStats,
      }
    })

    return NextResponse.json(detailedResults)
  } catch (error) {
    console.error("Error fetching exam results:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
