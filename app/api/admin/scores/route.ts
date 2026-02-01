import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const examResults = await prisma.examResult.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        exam: {
          select: {
            title: true,
            examType: true,
            courseId: true,
          },
        },
      },
      orderBy: {
        takenAt: "desc",
      },
    })

    // Enrich with enrollment info (to get hasPaid status)
    const enrichedResults = await Promise.all(
      examResults.map(async (result) => {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: result.user.id,
              courseId: result.exam.courseId,
            },
          },
          select: {
            hasPaid: true,
          },
        })

        return {
          ...result,
          enrollment,
        }
      })
    )

    return NextResponse.json(enrichedResults)
  } catch (error) {
    console.error("Error fetching scores:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
