import type { TripParams, DayRoute, Spot, ItineraryData } from '@/types'

const MOUNTAIN_KEYWORDS = ['峡谷', '栈道', '高山', '山顶', '悬崖', '云端', '海拔', '山峰', '山谷', '陡峭', '盘山']

const SCENIC_SPOTS_DEFAULT = [
  { name: '朝阳观景台', description: '日出最佳观赏点，视野开阔', duration: 1.5 },
  { name: '碧水湾', description: '清澈湖水，适合拍照休闲', duration: 2 },
  { name: '古镇老街', description: '百年老街，体验当地民俗', duration: 2.5 },
  { name: '森林步道', description: '天然氧吧，亲子徒步', duration: 1.5 },
  { name: '云端栈道', description: '悬崖栈道，壮丽山景', duration: 2 },
  { name: '田园风光带', description: '金色稻田，田园牧歌', duration: 1 },
  { name: '湿地保护区', description: '候鸟栖息地，生态观赏', duration: 1.5 },
  { name: '温泉度假村', description: '天然温泉，放松身心', duration: 3 },
  { name: '民俗文化村', description: '非遗展示，手工体验', duration: 2 },
  { name: '峡谷漂流', description: '夏日消暑，刺激好玩', duration: 2.5 },
  { name: '高山草甸', description: '广袤草原，星空露营', duration: 2 },
  { name: '石窟艺术群', description: '千年石窟，文化瑰宝', duration: 1.5 },
]

const PLAIN_SPOTS = [
  { name: '万亩花海', description: '四季花开，拍照圣地', duration: 1.5 },
  { name: '滨湖湿地公园', description: '湖水清澈，栈道平缓', duration: 2 },
  { name: '农耕文化园', description: '体验传统农耕，亲子互动', duration: 2 },
  { name: '葡萄采摘园', description: '新鲜采摘，品尝美酒', duration: 1.5 },
  { name: '湖滨步道', description: '沿湖漫步，景色宜人', duration: 1.5 },
  { name: '古村落建筑群', description: '保存完好的明清古村', duration: 2 },
  { name: '平原森林', description: '高大乔木，清凉避暑', duration: 1.5 },
  { name: '农业科技馆', description: '现代农业展示，科普教育', duration: 2 },
  { name: '滨江公园', description: '江景开阔，适合骑行', duration: 1.5 },
  { name: '蝴蝶生态园', description: '观蝶赏花，自然教育', duration: 2 },
]

const FAMILY_SPOTS = [
  { name: '亲子农庄', description: '采摘喂养，亲子互动', duration: 2.5 },
  { name: '儿童乐园', description: '室内外游乐设施', duration: 3 },
  { name: '海洋馆', description: '海洋生物观赏，科普教育', duration: 2 },
  { name: '动物园', description: '近距离接触小动物', duration: 2.5 },
]

const CAMPING_SPOTS = [
  { name: '湖畔营地', description: '临湖扎营，星空入眠', duration: 10 },
  { name: '草原露营区', description: '广阔草原，看日出日落', duration: 10 },
  { name: '森林营地', description: '松林掩映，虫鸣伴眠', duration: 10 },
]

const MOUNTAIN_SERVICE_AREAS = ['望山服务区', '云海服务区', '天路服务区', '盘山服务区']
const PLAIN_SERVICE_AREAS = ['清河服务区', '阳光服务区', '绿洲服务区', '麦田服务区', '荷风服务区', '稻香服务区']

function isMountainSpot(spot: { name: string; description: string }): boolean {
  return MOUNTAIN_KEYWORDS.some(
    (k) => spot.name.includes(k) || spot.description.includes(k)
  )
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function getBaseSpots(params: TripParams) {
  const lessMountain = params.preferences.includes('less_mountain')

  let base = [...SCENIC_SPOTS_DEFAULT]

  if (lessMountain) {
    base = base.filter((s) => !isMountainSpot(s))
    base = [...base, ...PLAIN_SPOTS]
  }

  if (params.preferences.includes('family')) {
    base.push(...FAMILY_SPOTS)
  }
  if (params.preferences.includes('camping')) {
    base.push(...CAMPING_SPOTS)
  }

  return base
}

function getServiceAreas(params: TripParams) {
  if (params.preferences.includes('less_mountain')) {
    return PLAIN_SERVICE_AREAS
  }
  return [...PLAIN_SERVICE_AREAS, ...MOUNTAIN_SERVICE_AREAS]
}

function generateDayRoute(
  params: TripParams,
  day: number,
  startDate: Date,
  allSpots: ReturnType<typeof getBaseSpots>,
  usedSpotNames: Set<string>
): DayRoute {
  const date = new Date(startDate)
  date.setDate(date.getDate() + day - 1)
  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`

  const avgSpeed = params.preferences.includes('less_mountain') ? 70 : 60
  const maxDriveKm = params.dailyDriveHours * avgSpeed

  const availableSpots = allSpots.filter((s) => !usedSpotNames.has(s.name))
  const spotCount = Math.min(
    Math.floor(params.dailyDriveHours / 2.5) + 1,
    availableSpots.length
  )
  const selectedSpots = pickRandom(availableSpots, Math.max(spotCount, 2))
  selectedSpots.forEach((s) => usedSpotNames.add(s.name))

  let currentMileage = 0
  let currentHour = 8
  const spots: Spot[] = []
  const serviceAreas: string[] = []
  const availableServiceAreas = getServiceAreas(params)
  let totalDriveHours = 0

  selectedSpots.forEach((spotData, idx) => {
    const segmentKm = Math.round(
      idx === 0
        ? 80 + Math.random() * 60
        : 40 + Math.random() * 80
    )
    const driveHours = segmentKm / avgSpeed
    currentMileage += segmentKm
    totalDriveHours += driveHours

    currentHour += driveHours

    if (totalDriveHours > 2 && !serviceAreas.length) {
      serviceAreas.push(pickRandom(availableServiceAreas, 1)[0])
      currentHour += 0.3
    }

    if (totalDriveHours > 4 && serviceAreas.length < 2) {
      serviceAreas.push(pickRandom(availableServiceAreas, 1)[0])
      currentHour += 0.3
    }

    const arrivalHour = Math.min(Math.floor(currentHour), 20)
    const arrivalMin = Math.round((currentHour % 1) * 60 / 10) * 10
    const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`

    spots.push({
      id: `spot-${day}-${idx}`,
      name: spotData.name,
      type: spotData.duration >= 8 ? 'hotel' : 'scenic',
      arrivalTime,
      duration: spotData.duration,
      mileage: segmentKm,
      description: spotData.description,
    })

    currentHour += Math.min(spotData.duration, 4)
  })

  if (currentHour < 17 && availableSpots.length > selectedSpots.length) {
    const extraSpot = availableSpots.find((s) => !usedSpotNames.has(s.name))
    if (extraSpot) {
      usedSpotNames.add(extraSpot.name)
      const segmentKm = Math.round(30 + Math.random() * 40)
      currentMileage += segmentKm
      totalDriveHours += segmentKm / avgSpeed
      currentHour += segmentKm / avgSpeed
      const arrivalHour = Math.min(Math.floor(currentHour), 19)
      const arrivalMin = Math.round((currentHour % 1) * 60 / 10) * 10
      spots.push({
        id: `spot-${day}-${spots.length}`,
        name: extraSpot.name,
        type: 'scenic',
        arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`,
        duration: extraSpot.duration,
        mileage: segmentKm,
        description: extraSpot.description,
      })
    }
  }

  const hotelKm = Math.round(20 + Math.random() * 30)
  currentMileage += hotelKm
  totalDriveHours += hotelKm / avgSpeed

  const hotelArrivalHour = Math.min(Math.floor(currentHour + Math.min(spots[spots.length - 1]?.duration || 2, 4)), 22)
  spots.push({
    id: `hotel-${day}`,
    name: `第${day}晚住宿酒店`,
    type: 'hotel',
    arrivalTime: `${String(hotelArrivalHour).padStart(2, '0')}:00`,
    duration: 0,
    mileage: hotelKm,
    description: '舒适酒店，休息充电',
  })

  if (serviceAreas.length === 0) {
    serviceAreas.push(pickRandom(availableServiceAreas, 1)[0])
  }

  let fuelChargeSuggestion = ''
  if (params.vehicleType === 'electric') {
    const range = 350
    if (currentMileage > range * 0.7) {
      fuelChargeSuggestion = '建议在服务区快充补电30分钟'
    } else {
      fuelChargeSuggestion = '电量充足，可在目的地慢充'
    }
  } else if (params.vehicleType === 'hybrid') {
    if (currentMileage > 400) {
      fuelChargeSuggestion = '建议服务区加油，同时充电补能'
    } else {
      fuelChargeSuggestion = '油电充足，无需中途补能'
    }
  } else {
    if (currentMileage > 450) {
      fuelChargeSuggestion = '建议在服务区加油'
    } else {
      fuelChargeSuggestion = '油量充足，可到目的地加油'
    }
  }

  return {
    day,
    date: dateStr,
    totalMileage: Math.round(currentMileage),
    drivingDuration: Math.round(totalDriveHours * 10) / 10,
    serviceAreas,
    fuelChargeSuggestion,
    spots,
  }
}

export function generateRoute(params: TripParams): ItineraryData {
  const allSpots = getBaseSpots(params)
  const usedSpotNames = new Set<string>()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 3)
  const lessMountain = params.preferences.includes('less_mountain')

  const routes: DayRoute[] = []
  for (let day = 1; day <= params.days; day++) {
    routes.push(generateDayRoute(params, day, startDate, allSpots, usedSpotNames))
  }

  const warnings: string[] = []

  if (lessMountain) {
    warnings.push('✓ 少走山路偏好已生效，已避开峡谷、栈道、高山等山路景点，路线以平原、湖区为主')
  }

  routes.forEach((route) => {
    if (route.drivingDuration > params.dailyDriveHours) {
      warnings.push(`第${route.day}天驾驶时长${route.drivingDuration}小时，超出每日${params.dailyDriveHours}小时限制`)
    }
    const hotelSpot = route.spots.find((s) => s.type === 'hotel')
    if (hotelSpot && parseInt(hotelSpot.arrivalTime) > 21) {
      warnings.push(`第${route.day}天预计${hotelSpot.arrivalTime}到达酒店，建议调整行程`)
    }
  })

  if (params.vehicleType === 'electric') {
    const longDay = routes.find((r) => r.totalMileage > 300)
    if (longDay) {
      warnings.push(`电动车出行，第${longDay.day}天里程较长(${longDay.totalMileage}km)，请提前规划充电站`)
    }
  }

  if (params.preferences.includes('camping')) {
    warnings.push('露营偏好已生效，路线包含露营地，请准备相关装备')
  }

  return {
    params,
    routes,
    warnings,
  }
}
