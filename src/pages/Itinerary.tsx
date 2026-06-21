import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Hotel, UtensilsCrossed, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import SpotCard from '@/components/SpotCard'
import WarningBanner from '@/components/WarningBanner'
import type { OptimizationType } from '@/types'

const OPTIMIZATIONS: { type: OptimizationType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    type: 'less_drive',
    icon: <Car size={16} />,
    label: '少开车',
    desc: '减少每日景点数量',
  },
  {
    type: 'early_hotel',
    icon: <Hotel size={16} />,
    label: '早到酒店',
    desc: '提前入住时间',
  },
  {
    type: 'add_lunch',
    icon: <UtensilsCrossed size={16} />,
    label: '加午餐点',
    desc: '添加沿途餐厅',
  },
]

export default function Itinerary() {
  const navigate = useNavigateStore()
  const { itinerary, moveSpot, applyOptimization } = useTripStore()
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null)
  const [showOptimizations, setShowOptimizations] = useState(false)
  const [optimizingType, setOptimizingType] = useState<OptimizationType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-6">
        <div className="text-sand-300 mb-4">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M28 40 L52 40 M40 28 L40 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sand-400 text-sm text-center mb-4">还没有行程方案</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-forest-500 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          去生成路书
        </button>
      </div>
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSpotId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSpotId(null)
    const { active, over } = event
    if (!over) return

    const spotId = active.id as string
    const overId = over.id as string

    let fromDay = 0
    let toDay = 0
    let toIndex = 0

    for (const route of itinerary.routes) {
      const fromIdx = route.spots.findIndex((s) => s.id === spotId)
      if (fromIdx !== -1) fromDay = route.day

      const toIdx = route.spots.findIndex((s) => s.id === overId)
      if (toIdx !== -1) {
        toDay = route.day
        toIndex = toIdx
      }
    }

    if (fromDay && toDay) {
      moveSpot(spotId, fromDay, toDay, toIndex)
    }
  }

  const handleOptimize = (type: OptimizationType) => {
    setOptimizingType(type)
    setTimeout(() => {
      applyOptimization(type)
      setOptimizingType(null)
      setShowOptimizations(false)
    }, 600)
  }

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-display font-bold text-sand-800">路书编辑</h1>
        <p className="text-sm text-sand-400 mt-0.5">拖拽景点调整行程</p>
      </div>

      {itinerary.warnings.length > 0 && (
        <div className="px-4 mb-3">
          <WarningBanner warnings={itinerary.warnings} />
        </div>
      )}

      <div className="px-4 space-y-3 pb-4">
        {itinerary.routes.map((route) => {
          const isExpanded = expandedDay === route.day
          return (
            <motion.div
              key={route.day}
              layout
              className="bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleDay(route.day)}
                className="w-full flex items-center gap-3 px-4 py-3"
              >
                <span className="bg-forest-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  D{route.day}
                </span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-sand-700">{route.date}</div>
                  <div className="text-xs text-sand-400">
                    {route.totalMileage}km · {route.drivingDuration}h驾驶
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-sand-400" />
                ) : (
                  <ChevronRight size={16} className="text-sand-400" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight size={12} className="text-sand-300" />
                        <span className="text-xs text-sand-400">行程路线</span>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={route.spots.map((s) => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {route.spots.map((spot) => (
                              <SpotCard key={spot.id} spot={spot} />
                            ))}
                          </div>
                        </SortableContext>
                        <DragOverlay>
                          {activeSpotId ? (
                            <div className="bg-white rounded-xl p-2.5 shadow-xl border border-forest-300 opacity-90">
                              <span className="text-sm text-sand-700">
                                {route.spots.find((s) => s.id === activeSpotId)?.name}
                              </span>
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <AnimatePresence>
          {showOptimizations && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-white rounded-2xl shadow-xl border border-sand-100 p-3 mb-2"
            >
              <div className="text-xs font-medium text-sand-500 mb-2">快捷优化</div>
              <div className="space-y-1.5">
                {OPTIMIZATIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleOptimize(opt.type)}
                    disabled={optimizingType !== null}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      optimizingType === opt.type
                        ? 'bg-forest-50 border border-forest-200'
                        : 'hover:bg-sand-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      optimizingType === opt.type
                        ? 'bg-forest-500 text-white'
                        : 'bg-sand-100 text-sand-500'
                    }`}>
                      {optimizingType === opt.type ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        >
                          {opt.icon}
                        </motion.div>
                      ) : (
                        opt.icon
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-sand-700">{opt.label}</div>
                      <div className="text-xs text-sand-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowOptimizations(!showOptimizations)}
          className="w-full py-3 bg-gradient-to-r from-sunset-400 to-sunset-500 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          {showOptimizations ? '收起优化面板' : '快捷优化'}
        </button>
      </div>
    </div>
  )
}

function useNavigateStore() {
  return useNavigate()
}
