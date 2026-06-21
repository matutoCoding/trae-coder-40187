import type { Spot } from '@/types'
import { GripVertical, Camera, Utensils, Hotel, Fuel, Coffee } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SPOT_ICONS: Record<string, React.ReactNode> = {
  scenic: <Camera size={16} className="text-forest-500" />,
  restaurant: <Utensils size={16} className="text-sunset-400" />,
  hotel: <Hotel size={16} className="text-sand-500" />,
  service_area: <Fuel size={16} className="text-forest-300" />,
  rest: <Coffee size={16} className="text-sand-400" />,
}

interface SpotCardProps {
  spot: Spot
}

export default function SpotCard({ spot }: SpotCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 bg-white rounded-xl p-2.5 border transition-all duration-200 ${
        isDragging
          ? 'border-forest-400 shadow-lg scale-[1.02] opacity-90'
          : 'border-sand-100 hover:border-sand-200 hover:shadow-sm'
      }`}
    >
      <button
        className="touch-none cursor-grab active:cursor-grabbing text-sand-300 hover:text-sand-500 p-0.5"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sand-50 flex items-center justify-center">
        {SPOT_ICONS[spot.type] || <Camera size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-sand-800 truncate">{spot.name}</div>
        <div className="text-xs text-sand-400">{spot.description}</div>
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="text-xs font-medium text-forest-600">{spot.arrivalTime}</div>
        <div className="text-xs text-sand-400">
          {spot.type !== 'hotel' ? `${spot.duration}h` : ''}
        </div>
      </div>
    </div>
  )
}
