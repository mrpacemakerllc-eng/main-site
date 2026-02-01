'use client'

import { useState } from 'react'

interface Answer {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

interface InteractiveQuestionProps {
  questionNumber: number
  section: string
  sectionName: string
  questionText: string
  answers: Answer[]
  explanation: {
    correctAnswer: string
    ibhreSection: string
    clinicalPearl: string
    management: string
  }
}

export default function InteractiveQuestion({
  questionNumber,
  section,
  sectionName,
  questionText,
  answers,
  explanation
}: InteractiveQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAnswerClick = (answerId: string) => {
    if (selectedAnswer) return // Already answered
    setSelectedAnswer(answerId)
    setShowExplanation(true)
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-start mb-4">
        <span className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
          {questionNumber}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {section}
            </span>
            <span className="text-xs text-gray-500">{sectionName}</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-4">
            {questionText}
          </p>
          <div className="space-y-2">
            {answers.map((answer) => {
              const isSelected = selectedAnswer === answer.id
              const isCorrect = answer.isCorrect

              let className = "border rounded p-3 transition "
              if (!selectedAnswer) {
                className += "bg-white border-gray-300 hover:bg-blue-50 cursor-pointer"
              } else if (isSelected && isCorrect) {
                className += "bg-green-100 border-2 border-green-500 cursor-default"
              } else if (isSelected && !isCorrect) {
                className += "bg-red-100 border-2 border-red-500 cursor-default"
              } else {
                className += "bg-white border-gray-300 cursor-default opacity-60"
              }

              return (
                <div
                  key={answer.id}
                  onClick={() => handleAnswerClick(answer.id)}
                  className={className}
                >
                  <span className="font-semibold">{answer.label}.</span> {answer.text}
                  {isSelected && isCorrect && (
                    <span className="float-right text-green-600 font-bold">✓ Correct</span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="float-right text-red-600 font-bold">✗ Incorrect</span>
                  )}
                </div>
              )
            })}
          </div>
          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold text-blue-900 mb-2">
                Correct Answer: {explanation.correctAnswer}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>{explanation.ibhreSection}</strong>
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Clinical Pearl:</strong> {explanation.clinicalPearl}
              </p>
              <p className="text-gray-700">
                <strong>Management:</strong> {explanation.management}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
