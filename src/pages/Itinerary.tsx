import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Hotel, UtensilsCrossed, ChevronDown, ChevronRight, ArrowRight, GripVertical, MapPin, Clock, DollarSign, Fuel, Zap, CircleParking } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import SpotCard from '@/components/SpotCard'
import WarningBanner from '@/components/WarningBanner'
import { TIME_SEGMENT_LABELS, PLAN_STYLES } from '@/types'
import type { OptimizationType, Spot, TimeSegment } from '@/types'

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

interface DayContainerProps {
  day: number
  date: string
  totalMileage: number
  drivingDuration: number
  spots: Spot[]
  isExpanded: boolean
  isOver: boolean
  onToggle: () => void
  activeSpotId: string | null
  renderSortable: (spots: Spot[]) => React.ReactNode
  renderTimeline: (spots: Spot[]) => React.ReactNode
  showTimeline: boolean
}

function DayContainer({
  day,
  date,
  totalMileage,
  drivingDuration,
  spots,
  isExpanded,
  isOver,
  onToggle,
  activeSpotId,
  renderSortable,
  renderTimeline,
  showTimeline,
}: DayContainerProps) {
  const { setNodeRef } = useDroppable({ id: `day-${day}` })

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isOver ? 'border-forest-400 bg-forest-50/50 ring-2 ring-forest-200' : 'border-sand-100 bg-white'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <span className="bg-forest-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          D{day}
        </span>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-sand-700">{date}</div>
          <div className="text-xs text-sand-400">
            {totalMileage}km · {drivingDuration}h驾驶
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-sand-400" />
        ) : (
          <ChevronRight size={16} className="text-sand-400" />
        )}
      </button>

      <AnimatePresence mode="popLayout">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              {showTimeline ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={12} className="text-sand-300" />
                    <span className="text-xs text-sand-400">时间轴</span>
                  </div>
                  {renderTimeline(spots)}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight size={12} className="text-sand-300" />
                    <span className="text-xs text-sand-400">行程路线（可拖拽调整）</span>
                  </div>
                  <SortableContext
                    items={spots.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {renderSortable(spots)}
                  </SortableContext>
                </>
              )}
            </div>
          </motion.div>
        ) : activeSpotId ? (
          <motion.div
            key="collapsed-drop"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2">
              <div className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all ${
                isOver ? 'border-forest-400 bg-forest-50' : 'border-sand-200 bg-sand-50'
              }`}>
                <span className="text-xs text-sand-400">
                  {isOver ? `松开放置到 D${day}` : `拖拽到此处添加到 D${day}`}
                </span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function TimelineView({ spots }: { spots: Spot[] }) {
  const segments: TimeSegment[] = ['morning', 'lunch', 'afternoon', 'evening', 'hotel']

  const grouped = useMemo(() => {
    const result: Record<TimeSegment, Spot[]> = {
      morning: [],
      lunch: [],
      afternoon: [],
      evening: [],
      hotel: [],
    }
    spots.forEach((spot) => {
      result[spot.timeSegment].push(spot)
    })
    return result
  }, [spots])

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-sand-100" />
      {segments.map((segment, idx) => {
        const items = grouped[segment]
        const style = TIME_SEGMENT_LABELS[segment]
        if (items.length === 0) return null

        return (
          <div key={segment} className="relative mb-3 last:mb-0">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1.5 relative z-10 ${
                segment === 'morning' ? 'bg-amber-400' :
                segment === 'lunch' ? 'bg-sunset-400' :
                segment === 'afternoon' ? 'bg-forest-400' :
                segment === 'evening' ? 'bg-sand-400' :
                'bg-sand-500'
              }`} />
              <div className="flex-1">
                <div className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${style.color}`}>
                  {style.label}
                </div>
                <div className="space-y-1.5">
                  {items.map((spot) => (
                    <div
                      key={spot.id}
                      className="flex items-center justify-between bg-sand-50 rounded-lg px-3 py-2 border border-sand-100"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-sand-400" />
                        <span className="text-sm text-sand-700">{spot.name}</span>
                      </div>
                      <div className="text-xs text-sand-500">{spot.arrivalTime}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Itinerary() {
  const navigate = useNavigate()
  const { getSelectedItinerary, moveSpot, applyOptimization } = useTripStore()
  const itinerary = getSelectedItinerary()

  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null)
  const [showOptimizations, setShowOptimizations] = useState(false)
  const [optimizingType, setOptimizingType] = useState<OptimizationType | null>(null)
  const [overDay, setOverDay] = useState<number | null>(null)
  const [showTimeline, setShowTimeline] = useState(true)
  const [showCostEstimate, setShowCostEstimate] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeSpot = useMemo(() => {
    if (!itinerary || !activeSpotId) return null
    for (const route of itinerary.routes) {
      const spot = route.spots.find((s) => s.id === activeSpotId)
      if (spot) return spot
    }
    return null
  }, [itinerary, activeSpotId])

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-6">
        <div className="text-sand-300 mb-4">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M28 40 L52 40 M40 28 L40 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sand-400 text-sm text-center mb-2">还没有选择方案</p>
        <p className="text-sand-300 text-xs text-center mb-4">请先在首页生成并选择一套路书方案</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-forest-500 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          去选择方案
        </button>
      </div>
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSpotId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over && over.id.toString().startsWith('day-')) {
      setOverDay(parseInt(over.id.toString().replace('day-', '')))
    } else {
      setOverDay(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSpotId(null)
    setOverDay(null)

    const { active, over } = event
    if (!over) return

    const spotId = active.id as string
    const overId = over.id as string

    let fromDay = 0
    let fromIndex = -1

    for (const route of itinerary.routes) {
      const idx = route.spots.findIndex((s) => s.id === spotId)
      if (idx !== -1) {
        fromDay = route.day
        fromIndex = idx
        break
      }
    }

    if (!fromDay || fromIndex === -1) return

    if (overId.toString().startsWith('day-')) {
      const toDay = parseInt(overId.toString().replace('day-', ''))
      if (toDay !== fromDay) {
        const toRoute = itinerary.routes.find((r) => r.day === toDay)
        if (toRoute) {
          const hotelIndex = toRoute.spots.findIndex((s) => s.type === 'hotel')
          const toIndex = hotelIndex > 0 ? hotelIndex : toRoute.spots.length
          moveSpot(spotId, fromDay, toDay, toIndex)
          setExpandedDay(toDay)
        }
      }
      return
    }

    let toDay = 0
    let toIndex = -1

    for (const route of itinerary.routes) {
      const idx = route.spots.findIndex((s) => s.id === overId)
      if (idx !== -1) {
        toDay = route.day
        toIndex = idx
        break
      }
    }

    if (fromDay && toDay) {
      if (fromDay !== toDay) {
        setExpandedDay(toDay)
      }
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

  const renderSortableSpots = (spots: Spot[]) => (
    <div className="space-y-2">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  )

  const renderTimelineSpots = (spots: Spot[]) => (
    <TimelineView spots={spots} />
  )

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-sand-800">路书编辑</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                itinerary.style === 'relaxed' ? 'bg-forest-100 text-forest-700' :
                itinerary.style === 'scenic' ? 'bg-sunset-100 text-sunset-700' :
                'bg-sand-100 text-sand-700'
              }`}>
                {PLAN_STYLES[itinerary.style].icon} {itinerary.styleName}
              </span>
              <span className="text-xs text-sand-400">拖拽景点调整行程</span>
            </div>
          </div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              showTimeline ? 'bg-forest-500 text-white' : 'bg-sand-100 text-sand-500'
            }`}
          >
            {showTimeline ? '时间轴' : '列表'}
          </button>
        </div>
      </div>

      {itinerary.warnings.length > 0 && (
        <div className="px-4 mb-3">
          <WarningBanner warnings={itinerary.warnings} />
        </div>
      )}

      {itinerary.costEstimate && (
        <div className="px-4 mb-3">
          <motion.div
            layout
            className="bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setShowCostEstimate(!showCostEstimate)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sunset-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-sunset-500" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-sand-700">费用与补能预估</div>
                  <div className="text-xs text-sand-400">
                    总计约 {itinerary.costEstimate.totalCostRange}
                  </div>
                </div>
              </div>
              {showCostEstimate ? (
                <ChevronDown size={16} className="text-sand-400" />
              ) : (
                <ChevronRight size={16} className="text-sand-400" />
              )}
            </button>

            <AnimatePresence>
              {showCostEstimate && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      {itinerary.params.vehicleType !== 'electric' && (
                        <div className="bg-sand-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Fuel size={13} className="text-sand-500" />
                            <span className="text-xs text-sand-500">油费</span>
                          </div>
                          <div className="text-sm font-semibold text-sand-700">
                            {itinerary.costEstimate.fuelCostRange}
                          </div>
                        </div>
                      )}
                      {(itinerary.params.vehicleType === 'electric' || itinerary.params.vehicleType === 'hybrid') && (
                        <div className="bg-sand-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={13} className="text-forest-500" />
                            <span className="text-xs text-sand-500">电费</span>
                          </div>
                          <div className="text-sm font-semibold text-sand-700">
                            约{itinerary.costEstimate.chargeCost}元
                            {itinerary.costEstimate.chargeStops > 0 && (
                              <span className="text-xs text-sand-400 ml-1">
                                · 约{itinerary.costEstimate.chargeStops}次补能
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="bg-sand-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CircleParking size={13} className="text-sand-500" />
                          <span className="text-xs text-sand-500">停车费</span>
                        </div>
                        <div className="text-sm font-semibold text-sand-700">
                          {itinerary.costEstimate.parkingCostRange}
                        </div>
                      </div>
                      <div className="bg-sand-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Hotel size={13} className="text-sand-500" />
                          <span className="text-xs text-sand-500">住宿</span>
                        </div>
                        <div className="text-sm font-semibold text-sand-700">
                          {itinerary.costEstimate.hotelCostRange}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-sunset-50 to-sand-50 rounded-xl p-3 border border-sunset-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-sand-500">预估总费用</span>
                        <span className="text-base font-bold text-sunset-600">
                          {itinerary.costEstimate.totalCostRange}
                        </span>
                      </div>
                      <div className="text-[10px] text-sand-400 mt-1">
                        * 按{itinerary.params.days}天预估，实际费用因消费水平而异
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="px-4 space-y-3 pb-4">
          {itinerary.routes.map((route) => (
            <DayContainer
              key={route.day}
              day={route.day}
              date={route.date}
              totalMileage={route.totalMileage}
              drivingDuration={route.drivingDuration}
              spots={route.spots}
              isExpanded={expandedDay === route.day}
              isOver={overDay === route.day}
              onToggle={() => toggleDay(route.day)}
              activeSpotId={activeSpotId}
              renderSortable={renderSortableSpots}
              renderTimeline={renderTimelineSpots}
              showTimeline={showTimeline}
            />
          ))}
        </div>

        <DragOverlay>
          {activeSpotId && activeSpot ? (
            <div className="bg-white rounded-xl p-3 shadow-2xl border border-forest-300 opacity-95 min-w-[260px]">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-sand-300" />
                <span className="text-sm font-medium text-sand-700">
                  {activeSpot.name}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
