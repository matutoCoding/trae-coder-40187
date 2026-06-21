import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'

interface WarningBannerProps {
  warnings: string[]
}

export default function WarningBanner({ warnings }: WarningBannerProps) {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (warnings.length === 0 || dismissed) return null

  const hasCritical = warnings.some((w) => w.includes('超出') || w.includes('较晚'))
  const bgColor = hasCritical ? 'bg-sunset-50 border-sunset-200' : 'bg-sand-100 border-sand-200'
  const textColor = hasCritical ? 'text-sunset-600' : 'text-sand-600'
  const iconColor = hasCritical ? 'text-sunset-400' : 'text-sand-400'

  return (
    <div className={`rounded-xl border ${bgColor} overflow-hidden transition-all duration-300`}>
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <AlertTriangle size={16} className={iconColor} />
        <span className={`text-sm font-medium flex-1 ${textColor}`}>
          {warnings.length}条提示
        </span>
        <button onClick={(e) => { e.stopPropagation(); setDismissed(true) }}>
          <X size={14} className="text-sand-400" />
        </button>
        {expanded ? (
          <ChevronUp size={14} className="text-sand-400" />
        ) : (
          <ChevronDown size={14} className="text-sand-400" />
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-2.5 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="text-xs text-sand-500 flex items-start gap-1.5">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-sunset-300 flex-shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
