import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    const { filename } = await params

    // Find the video by filename (check multiple possible paths)
    const video = await prisma.video.findFirst({
      where: {
        OR: [
          { filename: `/uploads/videos/${filename}` },
          { filename: `/videos/${filename}` },
          { filename: { endsWith: filename } }
        ]
      },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user is enrolled in the course
    const enrollment = video.course.enrollments[0]
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Check if enrollment has expired
    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Course access expired" }, { status: 403 })
    }

    // Check if payment is required
    if (!enrollment.hasPaid && video.course.price > 0) {
      return NextResponse.json({ error: "Payment required" }, { status: 403 })
    }

    // Serve the video file - handle both public paths
    let videoPath = video.filename.startsWith('/')
      ? join(process.cwd(), "public", video.filename)
      : join(process.cwd(), "public", video.filename)

    const videoBuffer = await readFile(videoPath)

    // Get range request for video streaming
    const range = request.headers.get("range")
    const videoSize = videoBuffer.length

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1
      const chunksize = end - start + 1
      const chunk = videoBuffer.slice(start, end + 1)

      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-User-Email": user.email, // Add user tracking
        },
      })
    }

    return new NextResponse(new Uint8Array(videoBuffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoSize.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-User-Email": user.email,
      },
    })
  } catch (error) {
    console.error("Error streaming video:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
