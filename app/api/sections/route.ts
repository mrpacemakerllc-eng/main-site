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
    const { courseId, title, description, order, videoCount, preTestId, examWeight } = body

    const section = await prisma.section.create({
      data: {
        courseId,
        title,
        description: description || null,
        order: order || 0,
        videoCount: videoCount || 0,
        preTestId: preTestId || null,
        examWeight: examWeight || null,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
