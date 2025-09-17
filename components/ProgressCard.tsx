'use client'

interface ProgressStats {
  checkins: number
  completed: number
  wins: number
}

interface ProgressCardProps {
  stats: ProgressStats
  onStartNew: () => void
}

export default function ProgressCard({ stats, onStartNew }: ProgressCardProps) {
  const totalActions = stats.checkins + stats.completed + stats.wins

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-display text-primary-600 mb-2">
          You're building momentum
        </h2>
        <p className="text-sm text-neutral-600">
          Here's your progress this month
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {stats.checkins}
          </div>
          <div className="text-xs text-neutral-600">
            Check-ins
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-600 mb-1">
            {stats.completed}
          </div>
          <div className="text-xs text-neutral-600">
            Completed
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600 mb-1">
            {stats.wins}
          </div>
          <div className="text-xs text-neutral-600">
            Little wins
          </div>
        </div>
      </div>

      {/* Growth Message */}
      <div className="bg-white rounded-lg p-4 text-center">
        {totalActions === 0 ? (
          <p className="text-sm text-neutral-600">
            Welcome! Every journey starts with a single step.
          </p>
        ) : totalActions < 5 ? (
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-primary-600">Great start!</span> You're building healthy habits.
          </p>
        ) : totalActions < 15 ? (
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-primary-600">Wonderful progress!</span> You're creating positive momentum.
          </p>
        ) : (
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-primary-600">Amazing consistency!</span> You're really taking care of yourself.
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onStartNew}
        className="
          w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-medium
          hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500
          transition-colors
        "
      >
        Start another check-in
      </button>
    </div>
  )
}