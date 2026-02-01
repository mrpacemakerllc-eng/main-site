"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function ViewExamPage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)

  useEffect(() => {
    fetchExam()
  }, [])

  const fetchExam = async () => {
    const res = await fetch(`/api/exams/${params.id}`)
    const data = await res.json()
    setExam(data)
  }

  if (!exam) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin Dashboard
          </Link>
          <span className={`px-3 py-1 text-sm rounded ${
            exam.examType === 'pre-test' ? 'bg-blue-100 text-blue-800' :
            exam.examType === 'post-test' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {exam.examType === 'pre-test' ? 'Pre-Test' :
             exam.examType === 'post-test' ? 'Post-Test' :
             'Regular Exam'}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
          <p className="text-gray-600 mb-4">{exam.description}</p>
          <p className="text-sm text-gray-500">
            Passing score: {exam.passingScore}% • {exam.questions?.length || 0} questions
          </p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Admin Preview:</strong> This is a read-only view showing all questions, correct answers, and explanations.
          </p>
        </div>

        <div className="space-y-6">
          {exam.questions?.map((q: any, index: number) => {
            const options = JSON.parse(q.options)
            return (
              <div key={q.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {q.question}
                </h3>
                <div className="space-y-2 mb-4">
                  {options.map((option: string, oIndex: number) => {
                    const isCorrect = String(oIndex) === q.correctAnswer

                    return (
                      <div
                        key={oIndex}
                        className={`p-3 border rounded ${
                          isCorrect ? 'bg-green-50 border-green-300 border-2' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect && (
                            <span className="text-green-600 font-bold text-xl">✓</span>
                          )}
                          <span className={isCorrect ? 'font-semibold' : ''}>
                            {option}
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="text-sm text-green-600 ml-2">(Correct Answer)</span>
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
                {!q.explanation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">No explanation provided for this question.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {exam.questions?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No questions in this exam yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
