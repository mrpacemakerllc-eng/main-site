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
    const { title, description, price } = body

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price || 0, // Default to 0 (free) if not provided
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: { videos: true, exams: true },
    })
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
