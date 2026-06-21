import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Car, Clock, Compass, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '@/store/tripStore'
import { PREFERENCE_LABELS, VEHICLE_LABELS } from '@/types'
import type { Preference, VehicleType } from '@/types'
import RouteCard from '@/components/RouteCard'

const DEPARTURES = ['成都', '重庆', '昆明', '西安', '兰州', '西宁', '贵阳', '大理', '丽江', '拉萨']

export default function Generate() {
  const navigate = useNavigate()
  const { generate, itinerary, isGenerating } = useTripStore()

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
    generate({
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
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full mt-4 py-3.5 bg-gradient-to-r from-forest-600 to-forest-500 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Sparkles size={18} />
              </motion.div>
              正在编排路线...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              生成路书
            </>
          )}
        </button>

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
                <span className="text-sm text-sand-500">路线编排中</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {itinerary && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold text-sand-800">路线方案</h2>
              <button
                onClick={handleViewItinerary}
                className="flex items-center gap-1 text-sm text-forest-500 font-medium"
              >
                编辑路书 <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {itinerary.routes.map((route) => (
                <RouteCard key={route.day} route={route} vehicleType={vehicleType} />
              ))}
            </div>

            {itinerary.warnings.length > 0 && (
              <div className="mt-3 bg-sunset-50 border border-sunset-100 rounded-xl p-3">
                <div className="text-xs font-medium text-sunset-600 mb-1">行程提示</div>
                {itinerary.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-sunset-500 flex items-start gap-1.5">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-sunset-300 flex-shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
