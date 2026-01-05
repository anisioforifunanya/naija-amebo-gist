'use client'

import { useState } from 'react'

interface PollOption {
  id: number
  label: string
  votes: number
}

interface PollProps {
  id: number
  title: string
  description: string
  options?: PollOption[]
  image1?: string
  image2?: string
  label1?: string
  label2?: string
  votes1?: number
  votes2?: number
  active: boolean
}

export default function Poll(props: PollProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const handleVote = (optionId: number) => {
    setSelectedOption(optionId)
    setHasVoted(true)
    // Here you would send the vote to your backend
  }

  // For "Who Wore It Better" style poll
  if (props.image1 && props.image2) {
    const totalVotes = (props.votes1 || 0) + (props.votes2 || 0)
    const percent1 = totalVotes > 0 ? ((props.votes1 || 0) / totalVotes) * 100 : 50
    const percent2 = totalVotes > 0 ? ((props.votes2 || 0) / totalVotes) * 100 : 50

    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg p-6 my-8 shadow-lg">
        <h3 className="text-2xl font-bold text-center mb-2">{props.title}</h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">{props.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1 */}
          <div className="space-y-3">
            <button
              onClick={() => handleVote(1)}
              disabled={hasVoted}
              className={`w-full aspect-video rounded-lg overflow-hidden border-4 transition-all hover:shadow-lg ${
                selectedOption === 1
                  ? 'border-blue-500 ring-4 ring-blue-300 shadow-xl'
                  : hasVoted
                    ? 'border-gray-300 opacity-70 cursor-not-allowed'
                    : 'border-gray-300 hover:border-blue-400 cursor-pointer'
              }`}
            >
              <img src={props.image1} alt={props.label1} className="w-full h-full object-cover" />
            </button>
            <div>
              <p className="font-bold text-lg text-center">{props.label1}</p>
              <div className="mt-2 bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${percent1}%` }}
                ></div>
              </div>
              <p className="text-center text-sm mt-2 font-semibold">
                {props.votes1 || 0} votes ({percent1.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Option 2 */}
          <div className="space-y-3">
            <button
              onClick={() => handleVote(2)}
              disabled={hasVoted}
              className={`w-full aspect-video rounded-lg overflow-hidden border-4 transition-all hover:shadow-lg ${
                selectedOption === 2
                  ? 'border-purple-500 ring-4 ring-purple-300 shadow-xl'
                  : hasVoted
                    ? 'border-gray-300 opacity-70 cursor-not-allowed'
                    : 'border-gray-300 hover:border-purple-400 cursor-pointer'
              }`}
            >
              <img src={props.image2} alt={props.label2} className="w-full h-full object-cover" />
            </button>
            <div>
              <p className="font-bold text-lg text-center">{props.label2}</p>
              <div className="mt-2 bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${percent2}%` }}
                ></div>
              </div>
              <p className="text-center text-sm mt-2 font-semibold">
                {props.votes2 || 0} votes ({percent2.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {hasVoted && <p className="text-center mt-6 text-green-600 font-semibold">✓ Vote counted!</p>}
      </div>
    )
  }

  // For multi-option polls
  const totalVotes = (props.options || []).reduce((sum, opt) => sum + opt.votes, 0)

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 rounded-lg p-6 my-8 shadow-lg">
      <h3 className="text-2xl font-bold mb-2">{props.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{props.description}</p>

      <div className="space-y-4">
        {(props.options || []).map((option) => {
          const percent = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-300'
                  : hasVoted
                    ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{option.label}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{percent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.votes} votes</p>
            </button>
          )
        })}
      </div>

      {hasVoted && <p className="text-center mt-6 text-green-600 font-semibold">✓ Your vote has been counted!</p>}
      <p className="text-center text-sm text-gray-500 mt-4">Total votes: {totalVotes}</p>
    </div>
  )
}
