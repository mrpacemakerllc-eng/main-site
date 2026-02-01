"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface QuestionDetail {
  id: string
  question: string
  options: string[]
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string | null
  category: string
}

interface CategoryStats {
  correct: number
  total: number
  percentage: number
}

interface ExamResult {
  id: string
  examId: string
  examTitle: string
  examType: string
  score: number
  passed: boolean
  takenAt: string
  questions: QuestionDetail[]
  totalQuestions: number
  correctCount: number
  categoryStats: Record<string, CategoryStats>
}

export default function CourseResultsPage() {
  const params = useParams()
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}/results`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading results...</div>
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href={`/course/${params.id}`} className="text-blue-600 hover:underline">
              ← Back to Course
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">No Exam Results Yet</h1>
          <p className="text-gray-600 mb-8">
            You haven't taken any exams for this course yet. Complete an exam to see your results here.
          </p>
          <Link
            href={`/course/${params.id}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Course
          </Link>
        </div>
      </div>
    )
  }

  const preTestResults = results.filter((r) => r.examType === "pre-test")
  const postTestResults = results.filter((r) => r.examType === "post-test")
  const latestPreTest = preTestResults[0]
  const latestPostTest = postTestResults[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/course/${params.id}`} className="text-blue-600 hover:underline">
            ← Back to Course
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Exam Results & Performance Analysis</h1>

        {/* Pre-Test vs Post-Test Comparison */}
        {(latestPreTest || latestPostTest) && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Pre-Test vs Post-Test Comparison</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pre-Test */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Pre-Test</h3>
                {latestPreTest ? (
                  <>
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {latestPreTest.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {latestPreTest.correctCount} / {latestPreTest.totalQuestions} correct
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(latestPreTest.takenAt).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="text-gray-400 py-8">Not taken yet</div>
                )}
              </div>

              {/* Post-Test */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Post-Test</h3>
                {latestPostTest ? (
                  <>
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {latestPostTest.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {latestPostTest.correctCount} / {latestPostTest.totalQuestions} correct
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(latestPostTest.takenAt).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="text-gray-400 py-8">Not taken yet</div>
                )}
              </div>
            </div>

            {/* Improvement Indicator */}
            {latestPreTest && latestPostTest && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-gray-700 mb-1">Your Improvement</p>
                <div
                  className={`text-3xl font-bold ${
                    latestPostTest.score > latestPreTest.score
                      ? "text-green-600"
                      : latestPostTest.score < latestPreTest.score
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {latestPostTest.score > latestPreTest.score && "+"}
                  {latestPostTest.score - latestPreTest.score}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topic Performance Breakdown */}
        {latestPostTest && Object.keys(latestPostTest.categoryStats).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Performance by Topic</h2>
            <p className="text-gray-600 mb-6">
              See which CCDS exam topics you've mastered and which need more review:
            </p>
            <div className="space-y-4">
              {Object.entries(latestPostTest.categoryStats)
                .sort(([, a], [, b]) => a.percentage - b.percentage)
                .map(([category, stats]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{category}</h3>
                      <span
                        className={`text-2xl font-bold ${
                          stats.percentage >= 80
                            ? "text-green-600"
                            : stats.percentage >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${
                            stats.percentage >= 80
                              ? "bg-green-600"
                              : stats.percentage >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        {stats.correct} / {stats.total}
                      </span>
                    </div>
                    {stats.percentage < 80 && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Review this topic to improve your score
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Exam Results List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">All Exam Attempts</h2>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg">
                <button
                  onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{result.examTitle}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.examType === "pre-test"
                            ? "bg-blue-100 text-blue-700"
                            : result.examType === "post-test"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {result.examType === "pre-test"
                          ? "Pre-Test"
                          : result.examType === "post-test"
                          ? "Post-Test"
                          : "Regular Exam"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Score: {result.score}% • {result.correctCount}/{result.totalQuestions} correct •{" "}
                      {new Date(result.takenAt).toLocaleString()}
                    </p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      selectedResult === result.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedResult === result.id && (
                  <div className="p-4 border-t bg-gray-50">
                    <h4 className="font-semibold mb-4">Question Breakdown</h4>
                    <div className="space-y-4">
                      {result.questions.map((q, index) => (
                        <div
                          key={q.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            q.isCorrect
                              ? "bg-green-50 border-green-500"
                              : "bg-red-50 border-red-500"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`text-xl font-bold ${
                                q.isCorrect ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {q.isCorrect ? "✓" : "✗"}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">Q{index + 1}:</span>
                                {q.category && q.category !== "General" && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                    {q.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-800 mb-3">{q.question}</p>
                              <div className="space-y-1 mb-2">
                                {q.options.map((option, oIndex) => {
                                  const isUserAnswer = String(oIndex) === q.userAnswer
                                  const isCorrectAnswer = String(oIndex) === q.correctAnswer
                                  return (
                                    <div
                                      key={oIndex}
                                      className={`p-2 rounded text-sm ${
                                        isCorrectAnswer
                                          ? "bg-green-100 border border-green-300"
                                          : isUserAnswer
                                          ? "bg-red-100 border border-red-300"
                                          : "bg-white border border-gray-200"
                                      }`}
                                    >
                                      {isCorrectAnswer && "✓ "}
                                      {isUserAnswer && !isCorrectAnswer && "✗ "}
                                      {option}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <span className="text-red-600 ml-2">(Your answer)</span>
                                      )}
                                      {isCorrectAnswer && (
                                        <span className="text-green-600 ml-2">(Correct)</span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {q.explanation && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">
                                    Explanation:
                                  </p>
                                  <p className="text-sm text-blue-800">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
