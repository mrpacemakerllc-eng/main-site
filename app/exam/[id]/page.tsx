"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ScreenshotProtection from "@/app/components/ScreenshotProtection"
import Watermark from "@/app/components/Watermark"

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [exam, setExam] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchExam()
  }, [])

  const fetchExam = async () => {
    const res = await fetch(`/api/exams/${params.id}`)
    const data = await res.json()
    setExam(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch(`/api/exams/${params.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    })

    const data = await res.json()
    setResult(data)
    setSubmitted(true)
  }

  if (!exam) return <div className="p-8">Loading...</div>

  if (submitted && result) {
    const showExplanations = result.examType === "post-test"
    const isPerfectScore = result.score === 100

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Screenshot Protection */}
        <ScreenshotProtection />

        {/* Company Watermark */}
        <Watermark />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {result.examType === "post-test" && isPerfectScore ? "Perfect Score!" :
               result.examType === "post-test" ? "Good Effort!" :
               "Complete!"}
            </h1>
            <div className={`text-6xl font-bold mb-4 ${isPerfectScore ? "text-green-600" : "text-blue-600"}`}>
              {result.score}%
            </div>
            <p className="text-gray-600 mb-4">
              You got {result.correctCount} out of {result.totalQuestions} questions correct.
            </p>
            {result.examType === "pre-test" && (
              <p className="text-sm text-blue-600 mb-6">
                Great! Now you can watch the course videos.
              </p>
            )}
            {result.examType === "post-test" && !isPerfectScore && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  We recommend aiming for 100% to master this material!
                </p>
                <p className="text-xs text-yellow-700">
                  Review the explanations below and retake the exam as many times as you'd like.
                </p>
              </div>
            )}
            {result.examType === "post-test" && isPerfectScore && (
              <p className="text-sm text-green-600 mb-6">
                Excellent! You've mastered this course material. Compare your pre-test and post-test scores to see your improvement!
              </p>
            )}
            <div className="flex gap-4 justify-center">
              {result.examType === "post-test" && !isPerfectScore && (
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setResult(null)
                    setAnswers({})
                  }}
                  className="bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700"
                >
                  Retake Exam
                </button>
              )}
              <Link
                href={result.courseId ? `/course/${result.courseId}` : "/dashboard"}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                {result.examType === "pre-test" || result.examType === "post-test" ? "Continue Course" : "Back to Dashboard"}
              </Link>
            </div>
          </div>

          {/* Show answer explanations for post-test only */}
          {showExplanations && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Answer Explanations</h2>
              {exam.questions?.map((q: any, index: number) => {
                const options = JSON.parse(q.options)
                const userAnswer = answers[q.id]
                const isCorrect = userAnswer === q.correctAnswer

                return (
                  <div key={q.id} className={`bg-white rounded-lg shadow p-6 ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                    <div className="flex items-start gap-2 mb-4">
                      <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {index + 1}. {q.question}
                        </h3>
                        <div className="space-y-2 mb-4">
                          {options.map((option: string, oIndex: number) => {
                            const isUserAnswer = String(oIndex) === userAnswer
                            const isCorrectAnswer = String(oIndex) === q.correctAnswer

                            return (
                              <div
                                key={oIndex}
                                className={`p-2 rounded ${
                                  isCorrectAnswer ? 'bg-green-50 border border-green-300' :
                                  isUserAnswer ? 'bg-red-50 border border-red-300' :
                                  'bg-gray-50'
                                }`}
                              >
                                <span className="font-medium">
                                  {isCorrectAnswer && '✓ '}
                                  {isUserAnswer && !isCorrectAnswer && '✗ '}
                                  {option}
                                </span>
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-sm text-red-600 ml-2">(Your answer)</span>
                                )}
                                {isCorrectAnswer && (
                                  <span className="text-sm text-green-600 ml-2">(Correct answer)</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {q.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screenshot Protection */}
      <ScreenshotProtection />

      {/* Company Watermark */}
      <Watermark />

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
          <p className="text-gray-600 mb-4">{exam.description}</p>
          <p className="text-sm text-gray-500">
            Passing score: {exam.passingScore}% • {exam.questions?.length} questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {exam.questions?.map((q: any, index: number) => {
            const options = JSON.parse(q.options)
            return (
              <div key={q.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {q.question}
                </h3>
                <div className="space-y-2">
                  {options.map((option: string, oIndex: number) => (
                    <label
                      key={oIndex}
                      className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={String(oIndex)}
                        required
                        className="mr-3"
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 text-lg font-semibold"
          >
            Submit Exam
          </button>
        </form>
      </div>
    </div>
  )
}
