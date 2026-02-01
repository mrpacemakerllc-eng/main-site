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

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newExamType } = await request.json()
    const { id } = await params

    // Get the original exam with questions
    const originalExam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (!originalExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Create duplicate exam
    const newExam = await prisma.exam.create({
      data: {
        title: originalExam.title + " (Copy)",
        description: originalExam.description,
        courseId: originalExam.courseId,
        examType: newExamType || originalExam.examType,
        passingScore: originalExam.passingScore,
        questions: {
          create: originalExam.questions.map((q) => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order,
          })),
        },
      },
      include: { questions: true },
    })

    // If it's a pre-test or post-test, enable pre-post test mode on the course
    if (newExamType === "pre-test" || newExamType === "post-test") {
      await prisma.course.update({
        where: { id: originalExam.courseId },
        data: { prePostTestEnabled: true },
      })
    }

    return NextResponse.json(newExam)
  } catch (error) {
    console.error("Error duplicating exam:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
