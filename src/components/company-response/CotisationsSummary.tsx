import type React from "react"
import { Euro } from "lucide-react"

interface CotisationsSummaryProps {
  selectedCount: number
  totals: {
    totalPatronal: number
    totalSalarial: number
    totalCombined: number
  }
}

const CotisationsSummary: React.FC<CotisationsSummaryProps> = ({ selectedCount, totals }) => {
  if (selectedCount === 0) return null

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Euro className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-300">
              Total des cotisations sélectionnées
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-400">
              {selectedCount} organisme{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{totals.totalPatronal.toFixed(2)}%</div>
            <div className="text-xs text-blue-600 dark:text-blue-500 font-medium">Patronal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">
              {totals.totalSalarial.toFixed(2)}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-500 font-medium">Salarial</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {totals.totalCombined.toFixed(2)}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500 font-medium">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CotisationsSummary
