import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { courseId } = await params

    // Check if course is free
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { price: true },
    })

    // Set expiration to 1 year from now
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        hasPaid: course?.price === 0, // Auto-mark as paid if course is free
        expiresAt,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error enrolling:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
