import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const courseId = formData.get("courseId") as string
    const videoFile = formData.get("video") as File

    if (!videoFile) {
      return NextResponse.json({ error: "No video file" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadsDir, { recursive: true })

    // Save file
    const bytes = await videoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${videoFile.name}`
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Get current video count for order
    const videoCount = await prisma.video.count({ where: { courseId } })

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description,
        filename: `/uploads/videos/${filename}`,
        courseId,
        order: videoCount,
      },
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
