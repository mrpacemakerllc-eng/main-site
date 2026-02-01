import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const userId = (session.user as any).id

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 404 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error fetching enrollment:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
