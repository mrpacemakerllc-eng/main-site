import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, examType, passingScore, courseId, questions } = body

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        examType: examType || "regular",
        passingScore,
        courseId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            type: q.type,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            category: q.category || null,
            order: index,
          })),
        },
      },
      include: { questions: true },
    })

    // If it's a pre-test or post-test, enable pre-post test mode on the course
    if (examType === "pre-test" || examType === "post-test") {
      await prisma.course.update({
        where: { id: courseId },
        data: { prePostTestEnabled: true },
      })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
