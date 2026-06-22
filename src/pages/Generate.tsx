import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Car, Clock, Compass, Sparkles, Check, Gauge, Camera, Zap, TrendingUp, Users2, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '@/store/tripStore'
import { PREFERENCE_LABELS, VEHICLE_LABELS, PLAN_STYLES } from '@/types'
import type { Preference, VehicleType, ItineraryData, DayCompareInfo } from '@/types'
import RouteCard from '@/components/RouteCard'

const DEPARTURES = ['成都', '重庆', '昆明', '西安', '兰州', '西宁', '贵阳', '大理', '丽江', '拉萨']

const STYLE_ICONS = {
  relaxed: <Gauge size={18} />,
  scenic: <Camera size={18} />,
  efficient: <Zap size={18} />,
}

const STYLE_COLORS = {
  relaxed: 'from-forest-500 to-forest-600',
  scenic: 'from-sunset-400 to-sunset-500',
  efficient: 'from-sand-500 to-sand-600',
}

const INTENSITY_COLORS: Record<DayCompareInfo['intensity'], string> = {
  '轻松': 'bg-forest-100 text-forest-700',
  '适中': 'bg-sand-100 text-sand-700',
  '较累': 'bg-sunset-100 text-sunset-700',
  '很累': 'bg-sunset-200 text-sunset-800',
}

function AlternativeCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: ItineraryData
  isSelected: boolean
  onSelect: () => void
}) {
  const totalMileage = plan.routes.reduce((sum, r) => sum + r.totalMileage, 0)
  const totalDriveHours = plan.routes.reduce((sum, r) => sum + r.drivingDuration, 0)
  const avgDailyMileage = Math.round(totalMileage / plan.routes.length)
  const scenicSpots = plan.routes
    .flatMap((r) => r.spots.filter((s) => s.type === 'scenic'))
    .slice(0, 3)
    .map((s) => s.name)
    .join('、')

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-forest-500 bg-forest-50/30 shadow-md'
          : 'border-sand-100 bg-white hover:border-sand-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${STYLE_COLORS[plan.style]} flex items-center justify-center text-white`}>
            {STYLE_ICONS[plan.style]}
          </div>
          <div>
            <div className="text-base font-display font-semibold text-sand-800 flex items-center gap-1.5">
              {PLAN_STYLES[plan.style].icon} {plan.styleName}
              {isSelected && <Check size={14} className="text-forest-500" />}
            </div>
            <div className="text-xs text-sand-400">{plan.styleDesc}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-sand-400 flex items-center gap-0.5 justify-end">
            <DollarSign size={11} />
            预估
          </div>
          <div className="text-sm font-bold text-sand-700">{plan.costEstimate?.totalCostRange || '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-forest-600">{totalMileage}</div>
          <div className="text-xs text-sand-400">总里程(km)</div>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-sunset-500">{Math.round(totalDriveHours)}h</div>
          <div className="text-xs text-sand-400">总驾驶时长</div>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-sand-600">{avgDailyMileage}</div>
          <div className="text-xs text-sand-400">日均里程</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp size={11} className="text-sand-400" />
          <span className="text-sand-400">最累日：</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${INTENSITY_COLORS[plan.dayCompare?.[plan.hardestDay - 1]?.intensity || '适中']}`}>
            D{plan.hardestDay} {plan.dayCompare?.[plan.hardestDay - 1]?.intensity || ''}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Users2 size={11} className="text-sand-400" />
          <span className="text-sand-500 truncate max-w-[140px]">{plan.targetAudience || '通用'}</span>
        </div>
      </div>

      {scenicSpots && (
        <div className="text-xs text-sand-500">
          <span className="text-sand-400">主要景点：</span>
          {scenicSpots}
        </div>
      )}
    </motion.div>
  )
}

function PlanCompareView({ plans }: { plans: ItineraryData[] }) {
  const maxDay = Math.max(...plans.map((p) => p.routes.length))
  const maxHours = Math.max(...plans.flatMap((p) => p.dayCompare.map((d) => d.drivingHours)))

  return (
    <div className="bg-white rounded-2xl border border-sand-100 p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-forest-500" />
        <h3 className="text-sm font-display font-semibold text-sand-800">方案对比</h3>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded ${STYLE_COLORS[plan.style]} text-white`}>
                  {plan.styleName}
                </span>
                <span className="text-xs text-sand-400">每天驾驶时长</span>
              </div>
              <span className="text-xs text-sand-500">
                最累D{plan.hardestDay} {plan.dayCompare?.[plan.hardestDay - 1]?.drivingHours}h
              </span>
            </div>
            <div className="flex gap-1">
              {plan.dayCompare.map((day) => {
                const width = Math.max(8, (day.drivingHours / Math.max(maxHours, 1)) * 100)
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full h-6 bg-sand-50 rounded overflow-hidden flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${width}%` }}
                        transition={{ duration: 0.4, delay: day.day * 0.05 }}
                        className={`w-full rounded-t ${STYLE_COLORS[plan.style]} opacity-80`}
                      />
                    </div>
                    <span className="text-[10px] text-sand-400">D{day.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1 mt-0.5">
              {plan.dayCompare.map((day) => (
                <div key={day.day} className="flex-1 text-center">
                  <span className={`text-[9px] px-1 py-0.5 rounded ${INTENSITY_COLORS[day.intensity]}`}>
                    {day.intensity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-sand-100 grid grid-cols-3 gap-2 text-center">
        {plans.map((plan) => (
          <div key={plan.id}>
            <div className="text-xs text-sand-400 mb-0.5">{plan.styleName}</div>
            <div className="text-xs text-sand-600 leading-snug">
              {plan.targetAudience || '通用'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Generate() {
  const navigate = useNavigate()
  const { generatePlans, alternatives, isGenerating, selectItinerary, selectedItineraryId } = useTripStore()

  const [departure, setDeparture] = useState('')
  const [days, setDays] = useState(3)
  const [companions, setCompanions] = useState(2)
  const [vehicleType, setVehicleType] = useState<VehicleType>('fuel')
  const [dailyDriveHours, setDailyDriveHours] = useState(6)
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [showDepartures, setShowDepartures] = useState(false)

  const togglePreference = (p: Preference) => {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleGenerate = () => {
    generatePlans({
      departure: departure || '成都',
      days,
      companions,
      vehicleType,
      dailyDriveHours,
      preferences,
    })
  }

  const handleViewItinerary = () => {
    navigate('/itinerary')
  }

  const handleSelectPlan = (id: string) => {
    selectItinerary(id)
  }

  const preferenceEntries = Object.entries(PREFERENCE_LABELS) as [Preference, string][]

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-700 via-forest-600 to-sand-400" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 left-8 w-20 h-20 border border-white/30 rounded-full" />
          <div className="absolute top-16 right-6 w-12 h-12 border border-white/20 rounded-full" />
          <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/10 rounded-full" />
        </div>
        <div className="relative px-5 pt-12 pb-8">
          <h1 className="text-2xl font-display font-bold text-white tracking-wide">
            路书行
          </h1>
          <p className="text-sand-200 text-sm mt-1 font-light">
            一句话出发愿望，编排可落地路书
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {alternatives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-100 p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-sand-500 mb-1.5 block">出发地</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  onFocus={() => setShowDepartures(true)}
                  onBlur={() => setTimeout(() => setShowDepartures(false), 200)}
                  placeholder="输入或选择出发城市"
                  className="w-full pl-9 pr-4 py-2.5 bg-sand-50 border border-sand-100 rounded-xl text-sm text-sand-700 placeholder:text-sand-300 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-400/20 transition-all"
                />
                <AnimatePresence>
                  {showDepartures && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-sand-100 z-20 overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 p-2.5">
                        {DEPARTURES.map((city) => (
                          <button
                            key={city}
                            onMouseDown={() => { setDeparture(city); setShowDepartures(false) }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-sand-50 text-sand-600 hover:bg-forest-50 hover:text-forest-600 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-sand-500 mb-1.5 block">
                  <Calendar size={12} className="inline mr-1" />出行天数
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="w-8 h-8 rounded-lg bg-sand-50 text-sand-500 flex items-center justify-center hover:bg-sand-100 transition-colors text-lg font-light"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium text-sand-800 w-8 text-center">{days}</span>
                  <button
                    onClick={() => setDays(Math.min(10, days + 1))}
                    className="w-8 h-8 rounded-lg bg-sand-50 text-sand-500 flex items-center justify-center hover:bg-sand-100 transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-sand-500 mb-1.5 block">
                  <Users size={12} className="inline mr-1" />同行人
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCompanions(Math.max(1, companions - 1))}
                    className="w-8 h-8 rounded-lg bg-sand-50 text-sand-500 flex items-center justify-center hover:bg-sand-100 transition-colors text-lg font-light"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium text-sand-800 w-8 text-center">{companions}</span>
                  <button
                    onClick={() => setCompanions(Math.min(8, companions + 1))}
                    className="w-8 h-8 rounded-lg bg-sand-50 text-sand-500 flex items-center justify-center hover:bg-sand-100 transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-sand-500 mb-1.5 block">
                <Car size={12} className="inline mr-1" />车辆类型
              </label>
              <div className="flex gap-2">
                {(Object.entries(VEHICLE_LABELS) as [VehicleType, string][]).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={`flex-1 py-2 rounded-xl text-sm transition-all duration-200 ${
                      vehicleType === type
                        ? 'bg-forest-500 text-white shadow-sm'
                        : 'bg-sand-50 text-sand-500 hover:bg-sand-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-sand-500 mb-1.5 flex items-center gap-1">
                <Clock size={12} />每日驾驶时长
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={0.5}
                  value={dailyDriveHours}
                  onChange={(e) => setDailyDriveHours(parseFloat(e.target.value))}
                  className="flex-1 accent-forest-500 h-1.5"
                />
                <span className="text-sm font-medium text-forest-600 w-12 text-right">
                  {dailyDriveHours}h
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-sand-500 mb-1.5 flex items-center gap-1">
                <Compass size={12} />出行偏好
              </label>
              <div className="flex flex-wrap gap-2">
                {preferenceEntries.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => togglePreference(key)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      preferences.includes(key)
                        ? 'bg-sunset-400 text-white shadow-sm'
                        : 'bg-sand-50 text-sand-500 hover:bg-sand-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-forest-600 to-forest-500 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  正在为您编排多套方案...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  生成路书方案
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold text-sand-800">
                为您生成了 {alternatives.length} 套方案
              </h2>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs text-forest-600 font-medium"
              >
                重新生成
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {alternatives.map((plan) => (
                <AlternativeCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedItineraryId === plan.id}
                  onSelect={() => handleSelectPlan(plan.id)}
                />
              ))}
            </div>

            {alternatives.length > 1 && <PlanCompareView plans={alternatives} />}

            {selectedItineraryId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-display font-semibold text-sand-800">
                    方案详情
                  </h3>
                  <button
                    onClick={handleViewItinerary}
                    className="flex items-center gap-1 text-sm text-forest-600 font-medium"
                  >
                    去编辑路书
                  </button>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const selected = alternatives.find((a) => a.id === selectedItineraryId)
                    if (!selected) return null
                    return selected.routes.map((route) => (
                      <RouteCard key={route.day} route={route} vehicleType={selected.params.vehicleType} />
                    ))
                  })()}
                </div>

                {(() => {
                  const selected = alternatives.find((a) => a.id === selectedItineraryId)
                  if (!selected || selected.warnings.length === 0) return null
                  return (
                    <div className="mt-3 bg-sunset-50 border border-sunset-100 rounded-xl p-3">
                      <div className="text-xs font-medium text-sunset-600 mb-1">行程提示</div>
                      {selected.warnings.map((w, i) => (
                        <div key={i} className="text-xs text-sunset-500 flex items-start gap-1.5">
                          <span className="mt-0.5 w-1 h-1 rounded-full bg-sunset-300 flex-shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </motion.div>
            )}

            {!selectedItineraryId && (
              <div className="text-center py-4 text-sand-400 text-sm">
                请选择一个方案查看详情
              </div>
            )}
          </>
        )}

        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex flex-col items-center py-8"
            >
              <div className="relative w-48 h-2 bg-sand-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-forest-500 to-sunset-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-forest-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-sand-500">正在编排多套方案...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
