"use client"

import { useRouter } from "next/navigation"

export default function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/delete`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert("Failed to delete course")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete course")
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-sm"
    >
      Delete
    </button>
  )
}
