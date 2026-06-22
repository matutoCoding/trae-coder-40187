import type { ItineraryData, CostEstimate, DayCompareInfo, PlanStyle } from '@/types'

const FUEL_PRICE_PER_LITER = 7.5
const ELECTRIC_PRICE_PER_KWH = 1.5
const FUEL_CONSUMPTION_PER_100KM = 8
const ELECTRIC_CONSUMPTION_PER_100KM = 15
const HOTEL_PRICE_RANGE = {
  relaxed: { min: 400, max: 600 },
  scenic: { min: 300, max: 500 },
  efficient: { min: 200, max: 350 },
}
const PARKING_FEE_PER_DAY = 30

export function calculateCost(itinerary: ItineraryData): CostEstimate {
  const totalMileage = itinerary.routes.reduce((sum, r) => sum + r.totalMileage, 0)
  const days = itinerary.routes.length
  const { vehicleType } = itinerary.params
  const style = itinerary.style

  let fuelCost = 0
  let chargeCost = 0
  let chargeStops = 0

  if (vehicleType === 'fuel') {
    const liters = (totalMileage / 100) * FUEL_CONSUMPTION_PER_100KM
    fuelCost = Math.round(liters * FUEL_PRICE_PER_LITER)
  } else if (vehicleType === 'electric') {
    const kwh = (totalMileage / 100) * ELECTRIC_CONSUMPTION_PER_100KM
    chargeCost = Math.round(kwh * ELECTRIC_PRICE_PER_KWH)
    chargeStops = Math.max(1, Math.floor(totalMileage / 300))
  } else if (vehicleType === 'hybrid') {
    const liters = (totalMileage / 100) * (FUEL_CONSUMPTION_PER_100KM * 0.6)
    fuelCost = Math.round(liters * FUEL_PRICE_PER_LITER)
    const kwh = (totalMileage / 100) * (ELECTRIC_CONSUMPTION_PER_100KM * 0.3)
    chargeCost = Math.round(kwh * ELECTRIC_PRICE_PER_KWH)
  }

  const hotelRange = HOTEL_PRICE_RANGE[style] || HOTEL_PRICE_RANGE.scenic
  const hotelMin = hotelRange.min * days
  const hotelMax = hotelRange.max * days
  const hotelCost = Math.round((hotelMin + hotelMax) / 2)

  const parkingCost = PARKING_FEE_PER_DAY * days

  const totalCost = fuelCost + chargeCost + parkingCost + hotelCost
  const totalMin = fuelCost + chargeCost + parkingCost + hotelMin
  const totalMax = fuelCost + chargeCost + parkingCost + hotelMax

  return {
    fuelCost,
    fuelCostRange: vehicleType === 'electric' ? '—' : `约${fuelCost}元`,
    parkingCost,
    parkingCostRange: `${parkingCost - 10}~${parkingCost + 20}元`,
    hotelCost,
    hotelCostRange: `${hotelMin}~${hotelMax}元`,
    totalCost,
    totalCostRange: `${totalMin}~${totalMax}元`,
    chargeStops,
    chargeCost,
  }
}

export function getDayCompare(routes: ItineraryData['routes']): DayCompareInfo[] {
  return routes.map((route) => {
    const hours = route.drivingDuration
    let intensity: DayCompareInfo['intensity']
    if (hours <= 3) intensity = '轻松'
    else if (hours <= 4.5) intensity = '适中'
    else if (hours <= 6) intensity = '较累'
    else intensity = '很累'
    return {
      day: route.day,
      drivingHours: hours,
      intensity,
    }
  })
}

export function getHardestDay(dayCompare: DayCompareInfo[]): number {
  let hardest = dayCompare[0]?.day || 1
  let maxHours = 0
  dayCompare.forEach((d) => {
    if (d.drivingHours > maxHours) {
      maxHours = d.drivingHours
      hardest = d.day
    }
  })
  return hardest
}

export function getTargetAudience(style: PlanStyle, days: number, preferences: string[]): string {
  const audiences: string[] = []

  switch (style) {
    case 'relaxed':
      audiences.push('老人小孩同行')
      audiences.push('首次自驾')
      if (days > 4) audiences.push('长线度假')
      break
    case 'scenic':
      audiences.push('摄影爱好者')
      audiences.push('喜欢深度游览')
      if (preferences.includes('camping')) audiences.push('露营玩家')
      break
    case 'efficient':
      audiences.push('时间紧张')
      audiences.push('想多走几个地方')
      if (days <= 3) audiences.push('短途快游')
      break
  }

  if (preferences.includes('family')) audiences.push('亲子家庭')
  if (preferences.includes('less_mountain')) audiences.push('新手司机')

  return audiences.slice(0, 3).join('、')
}
