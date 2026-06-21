import type { ItineraryData, DayRoute, TimeSegment } from '@/types'
import { PLAN_STYLES } from '@/types'

function getPlanAvgSpeed(style: string) {
  switch (style) {
    case 'relaxed': return 65
    case 'scenic': return 55
    case 'efficient': return 75
    default: return 60
  }
}

function getPlanMaxHours(style: string) {
  switch (style) {
    case 'relaxed': return 4
    case 'scenic': return 5.5
    case 'efficient': return 7
    default: return 6
  }
}

function getTimeSegment(hour: number, type: string): TimeSegment {
  if (type === 'hotel') return 'hotel'
  if (type === 'restaurant') return 'lunch'
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 18) return 'afternoon'
  return 'evening'
}

export function recalculateTime(itinerary: ItineraryData): ItineraryData {
  const avgSpeed = getPlanAvgSpeed(itinerary.style)
  const maxHours = getPlanMaxHours(itinerary.style)
  const styleName = PLAN_STYLES[itinerary.style]?.name || ''
  const warnings: string[] = []

  if (itinerary.params.preferences.includes('less_mountain')) {
    const plainSpots = itinerary.alternativeSpots?.filter((n: string) =>
      ['湿地', '湖', '滨', '平原', '花', '园', '农田', '村', '森林', '江', '河', '荷'].some((k) => n.includes(k))
    ) || []
    const plainExamples = plainSpots.slice(0, 4).join('、')
    warnings.push(`✓ 少走山路偏好已生效，已避开峡谷、栈道、高山等山路景点，路线以平原、湖区、湿地为主`)
    if (plainExamples) {
      warnings.push(`  本次选用的平原/湖区景点：${plainExamples} 等`)
    }
  }

  const routes = itinerary.routes.map((route) => {
    let currentHour = 8
    let totalMileage = 0
    let totalDriveHours = 0
    const serviceAreas: string[] = [...route.serviceAreas]

    const spots = route.spots.map((spot, idx) => {
      if (idx > 0) {
        const prevSpot = route.spots[idx - 1]
        const driveHours = spot.mileage / avgSpeed
        currentHour += driveHours
        totalDriveHours += driveHours

        if (totalDriveHours > 2.5 && serviceAreas.length < 1) {
          serviceAreas.push('途停服务区')
          currentHour += 0.3
        }
        if (totalDriveHours > 4.5 && serviceAreas.length < 2) {
          serviceAreas.push('补停服务区')
          currentHour += 0.3
        }
      } else {
        const driveHours = spot.mileage / avgSpeed
        currentHour += driveHours
        totalDriveHours += driveHours
      }

      const clampedHour = Math.min(Math.floor(currentHour), 22)
      const clampedMin = Math.round((currentHour % 1) * 60 / 10) * 10
      const arrivalTime = `${String(clampedHour).padStart(2, '0')}:${String(clampedMin === 60 ? 0 : clampedMin).padStart(2, '0')}`

      totalMileage += spot.mileage

      const visitDuration = spot.type === 'hotel' ? 0 : Math.min(spot.duration, 4)
      currentHour += visitDuration

      return {
        ...spot,
        arrivalTime,
        timeSegment: getTimeSegment(clampedHour, spot.type),
      }
    })

    const newRoute: DayRoute = {
      ...route,
      spots,
      totalMileage: Math.round(totalMileage),
      drivingDuration: Math.round(totalDriveHours * 10) / 10,
      serviceAreas,
    }

    if (newRoute.drivingDuration > maxHours) {
      warnings.push(`⚠️ 第${newRoute.day}天驾驶时长${newRoute.drivingDuration}小时，超出${styleName}推荐的${maxHours}小时`)
    }

    const hotel = spots.find((s) => s.type === 'hotel')
    if (hotel && parseInt(hotel.arrivalTime) > 21) {
      warnings.push(`⚠️ 第${newRoute.day}天预计${hotel.arrivalTime}到达酒店，较晚抵达`)
    }

    if (spots.some((s) => s.type === 'scenic') && spots.filter((s) => s.type === 'scenic').length > 4) {
      warnings.push(`⚠️ 第${newRoute.day}天景点较多，行程紧凑`)
    }

    return newRoute
  })

  if (itinerary.params.vehicleType === 'electric') {
    const longDay = routes.find((r) => r.totalMileage > 300)
    if (longDay) {
      warnings.push(`🔋 电动车出行，第${longDay.day}天里程较长(${longDay.totalMileage}km)，注意充电规划`)
    }
  }

  if (itinerary.params.preferences.includes('camping')) {
    warnings.push('⛺ 露营偏好已生效，路线包含露营地，请准备相关装备')
  }

  if (itinerary.params.preferences.includes('family')) {
    warnings.push('👶 亲子偏好已生效，景点中包含亲子农庄、儿童乐园等适合家庭的内容')
  }

  return {
    ...itinerary,
    routes,
    warnings,
  }
}
