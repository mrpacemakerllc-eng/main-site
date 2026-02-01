"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/admin/scores")
      const data = await res.json()
      setScores(data)
    } catch (error) {
      console.error("Error fetching scores:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredScores = scores.filter((result) => {
    const searchLower = searchTerm.toLowerCase()
    const name = (result.user.name || "").toLowerCase()
    const email = result.user.email.toLowerCase()
    const examTitle = result.exam.title.toLowerCase()

    return name.includes(searchLower) || email.includes(searchLower) || examTitle.includes(searchLower)
  })

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Test Scores</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by student name, email, or exam..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredScores.length} of {scores.length} results
          </p>
        </div>

        {filteredScores.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? "No results found" : "No test results yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScores.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.user.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.user.email}
                          </div>
                        </div>
                        {result.enrollment?.hasPaid && (
                          <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">
                            PAID
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.exam.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.exam.examType === 'pre-test' ? 'bg-blue-100 text-blue-800' :
                        result.exam.examType === 'post-test' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.exam.examType === 'pre-test' ? 'Pre-Test' :
                         result.exam.examType === 'post-test' ? 'Post-Test' :
                         'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${
                        result.score >= 80 ? 'text-green-600' :
                        result.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.takenAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
