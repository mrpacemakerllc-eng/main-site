import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { answers } = await request.json()
    const { id } = await params

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    let correctCount = 0
    exam.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / exam.questions.length) * 100)
    const passed = score >= exam.passingScore // Keep for backward compatibility

    const result = await prisma.examResult.create({
      data: {
        userId,
        examId: exam.id,
        score,
        passed,
        answers: JSON.stringify(answers),
      },
    })

    // Mark pre-test or post-test as completed (always, regardless of score)
    if (exam.examType === "pre-test" || exam.examType === "post-test") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: exam.courseId,
          },
        },
      })

      if (enrollment) {
        await prisma.enrollment.update({
          where: {
            userId_courseId: {
              userId,
              courseId: exam.courseId,
            },
          },
          data: {
            preTestCompleted: exam.examType === "pre-test" ? true : enrollment.preTestCompleted,
            postTestCompleted: exam.examType === "post-test" ? true : enrollment.postTestCompleted,
          },
        })
      }
    }

    return NextResponse.json({
      id: result.id,
      score,
      passed,
      correctCount,
      totalQuestions: exam.questions.length,
      examType: exam.examType,
      courseId: exam.courseId,
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
