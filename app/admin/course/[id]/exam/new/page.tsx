"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function NewExamPage() {
  const params = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [examType, setExamType] = useState("regular")
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState<any[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: "0", explanation: "", category: "", type: "multiple_choice" }
  ])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "0",
      explanation: "",
      category: "",
      type: "multiple_choice"
    }])
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          examType,
          passingScore,
          courseId: params.id,
          questions,
        }),
      })

      if (response.ok) {
        router.push(`/admin/course/${params.id}`)
      }
    } catch (error) {
      console.error("Error creating exam:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/admin/course/${params.id}`} className="text-blue-600 hover:underline">
            ← Back to Course
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Exam</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Title
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="regular">Regular Exam</option>
                <option value="pre-test">Pre-Test (before videos)</option>
                <option value="post-test">Post-Test (after videos)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pre/Post tests are used to measure learning progress
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic/Category (CCDS Exam Content)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={q.category || ""}
                  onChange={(e) => updateQuestion(qIndex, "category", e.target.value)}
                >
                  <option value="">Select a topic...</option>
                  <option value="Cardiac Anatomy & Physiology">Cardiac Anatomy & Physiology</option>
                  <option value="Device Programming & Optimization">Device Programming & Optimization</option>
                  <option value="Rhythm Recognition & Analysis">Rhythm Recognition & Analysis</option>
                  <option value="Patient Assessment & Management">Patient Assessment & Management</option>
                  <option value="Safety & Troubleshooting">Safety & Troubleshooting</option>
                  <option value="Device Follow-up & Monitoring">Device Follow-up & Monitoring</option>
                  <option value="Pacing Modes & Settings">Pacing Modes & Settings</option>
                  <option value="ICD Therapy & Programming">ICD Therapy & Programming</option>
                  <option value="CRT Therapy">CRT Therapy</option>
                  <option value="Pharmacology">Pharmacology</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Categorize questions by CCDS exam topic for better performance tracking
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options (select the correct answer)
                </label>
                {q.options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === String(oIndex)}
                      onChange={() => updateQuestion(qIndex, "correctAnswer", String(oIndex))}
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional - shown after post-test only)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this is the correct answer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={q.explanation || ""}
                  onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This explanation will only be shown to students after they complete the post-test
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Add Question
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </form>
      </div>
    </div>
  )
}
