import type { ItineraryData, DayRoute } from '@/types'

export function recalculateTime(itinerary: ItineraryData): ItineraryData {
  const avgSpeed = 60
  const warnings: string[] = []

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
      }
    })

    const newRoute: DayRoute = {
      ...route,
      spots,
      totalMileage: Math.round(totalMileage),
      drivingDuration: Math.round(totalDriveHours * 10) / 10,
      serviceAreas,
    }

    if (newRoute.drivingDuration > itinerary.params.dailyDriveHours) {
      warnings.push(`第${newRoute.day}天驾驶时长${newRoute.drivingDuration}小时，超出每日${itinerary.params.dailyDriveHours}小时限制`)
    }

    const hotel = spots.find((s) => s.type === 'hotel')
    if (hotel && parseInt(hotel.arrivalTime) > 21) {
      warnings.push(`第${newRoute.day}天预计${hotel.arrivalTime}到达酒店，较晚抵达`)
    }

    if (spots.some((s) => s.type === 'scenic') && spots.filter((s) => s.type === 'scenic').length > 4) {
      warnings.push(`第${newRoute.day}天景点较多，行程紧凑`)
    }

    return newRoute
  })

  if (itinerary.params.vehicleType === 'electric') {
    const longDay = routes.find((r) => r.totalMileage > 300)
    if (longDay) {
      warnings.push(`电动车出行，第${longDay.day}天里程较长(${longDay.totalMileage}km)，注意充电规划`)
    }
  }

  return {
    ...itinerary,
    routes,
    warnings,
  }
}
