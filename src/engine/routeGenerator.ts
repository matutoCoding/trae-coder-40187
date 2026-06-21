import type { TripParams, DayRoute, Spot, ItineraryData, PlanStyle, TimeSegment } from '@/types'
import { PLAN_STYLES } from '@/types'

const MOUNTAIN_KEYWORDS = ['峡谷', '栈道', '高山', '山顶', '悬崖', '云端', '海拔', '山峰', '山谷', '陡峭', '盘山', '天路', '险峻', '攀登']

const ALL_SPOTS = [
  { name: '朝阳观景台', description: '日出最佳观赏点，视野开阔无遮挡', duration: 1.5 },
  { name: '碧水湾', description: '清澈湖水，适合拍照休闲', duration: 2 },
  { name: '古镇老街', description: '百年老街，体验当地民俗', duration: 2.5 },
  { name: '森林步道', description: '天然氧吧，亲子徒步路线平缓', duration: 1.5 },
  { name: '田园风光带', description: '金色稻田，田园牧歌', duration: 1 },
  { name: '湿地保护区', description: '候鸟栖息地，生态观赏', duration: 1.5 },
  { name: '温泉度假村', description: '天然温泉，放松身心', duration: 3 },
  { name: '民俗文化村', description: '非遗展示，手工体验', duration: 2 },
  { name: '石窟艺术群', description: '千年石窟，文化瑰宝', duration: 1.5 },
  { name: '万亩花海', description: '四季花开，拍照圣地', duration: 1.5 },
  { name: '滨湖湿地公园', description: '湖水清澈，沿湖步道平缓舒适', duration: 2 },
  { name: '农耕文化园', description: '体验传统农耕，亲子互动', duration: 2 },
  { name: '葡萄采摘园', description: '新鲜采摘，品尝美酒', duration: 1.5 },
  { name: '湖滨步道', description: '沿湖漫步，景色宜人', duration: 1.5 },
  { name: '古村落建筑群', description: '保存完好的明清古村', duration: 2 },
  { name: '平原森林', description: '高大乔木，清凉避暑', duration: 1.5 },
  { name: '农业科技馆', description: '现代农业展示，科普教育', duration: 2 },
  { name: '滨江公园', description: '江景开阔，适合骑行', duration: 1.5 },
  { name: '蝴蝶生态园', description: '观蝶赏花，自然教育', duration: 2 },
  { name: '荷花园', description: '盛夏荷花，清香四溢', duration: 1.5 },
  { name: '草莓采摘基地', description: '亲子采摘，甜蜜时光', duration: 1.5 },
  { name: '茶文化博览园', description: '采茶制茶，体验茶道', duration: 2 },
  { name: '滨江步道', description: '沿江而行，微风拂面', duration: 1.5 },
  { name: '薰衣草庄园', description: '紫色花海，浪漫唯美', duration: 1.5 },
]

const FAMILY_SPOTS = [
  { name: '亲子农庄', description: '采摘喂养，亲子互动', duration: 2.5 },
  { name: '儿童乐园', description: '室内外游乐设施', duration: 3 },
  { name: '海洋馆', description: '海洋生物观赏，科普教育', duration: 2 },
  { name: '动物园', description: '近距离接触小动物', duration: 2.5 },
  { name: '自然博物馆', description: '恐龙化石，自然科普', duration: 2 },
]

const CAMPING_SPOTS = [
  { name: '湖畔营地', description: '临湖扎营，星空入眠', duration: 10 },
  { name: '草原露营区', description: '广阔草原，看日出日落', duration: 10 },
  { name: '森林营地', description: '松林掩映，虫鸣伴眠', duration: 10 },
]

const RESTAURANT_SPOTS = [
  { name: '湖畔渔庄', description: '河鲜美食，临湖用餐', duration: 1 },
  { name: '农家大院', description: '地道农家菜，现摘现做', duration: 1 },
  { name: '古镇食府', description: '传统名菜，百年老店', duration: 1 },
]

const PLAIN_SERVICE_AREAS = ['清河服务区', '阳光服务区', '绿洲服务区', '麦田服务区', '荷风服务区', '稻香服务区', '平湖服务区', '花海服务区']

function isMountainSpot(spot: { name: string; description: string }): boolean {
  return MOUNTAIN_KEYWORDS.some(
    (k) => spot.name.includes(k) || spot.description.includes(k)
  )
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function getTimeSegment(hour: number, type: Spot['type']): TimeSegment {
  if (type === 'hotel') return 'hotel'
  if (type === 'restaurant') return 'lunch'
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 18) return 'afternoon'
  return 'evening'
}

interface PlanConfig {
  maxDailyDriveHours: number
  avgSpeed: number
  spotsPerDay: number
  spotDurationMultiplier: number
  description: string
}

function getPlanConfig(style: PlanStyle): PlanConfig {
  switch (style) {
    case 'relaxed':
      return {
        maxDailyDriveHours: 4,
        avgSpeed: 65,
        spotsPerDay: 2,
        spotDurationMultiplier: 1.3,
        description: '轻松版：每日驾驶不超过4小时，景点少而精',
      }
    case 'scenic':
      return {
        maxDailyDriveHours: 5.5,
        avgSpeed: 55,
        spotsPerDay: 4,
        spotDurationMultiplier: 1.2,
        description: '风景版：精选沿途精华景点，拍照点多',
      }
    case 'efficient':
      return {
        maxDailyDriveHours: 7,
        avgSpeed: 75,
        spotsPerDay: 3,
        spotDurationMultiplier: 0.8,
        description: '效率版：每日驾驶5-6小时，覆盖更多目的地',
      }
  }
}

function getBaseSpots(params: TripParams, style: PlanStyle) {
  const lessMountain = params.preferences.includes('less_mountain')

  let base = [...ALL_SPOTS]

  if (lessMountain) {
    base = base.filter((s) => !isMountainSpot(s))
  }

  if (params.preferences.includes('family')) {
    base.push(...FAMILY_SPOTS)
  }
  if (params.preferences.includes('camping')) {
    base.push(...CAMPING_SPOTS)
  }

  return base
}

function generateDayRoute(
  params: TripParams,
  style: PlanStyle,
  day: number,
  startDate: Date,
  allSpots: ReturnType<typeof getBaseSpots>,
  usedSpotNames: Set<string>
): { route: DayRoute; usedNames: string[] } {
  const config = getPlanConfig(style)
  const date = new Date(startDate)
  date.setDate(date.getDate() + day - 1)
  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`

  const availableSpots = allSpots.filter((s) => !usedSpotNames.has(s.name))
  const selectedSpots = pickRandom(availableSpots, Math.max(config.spotsPerDay, 2))
  const usedNames = selectedSpots.map((s) => s.name)
  selectedSpots.forEach((s) => usedSpotNames.add(s.name))

  let currentMileage = 0
  let currentHour = 8
  const spots: Spot[] = []
  const serviceAreas: string[] = []
  let totalDriveHours = 0

  selectedSpots.forEach((spotData, idx) => {
    const segmentKm = Math.round(
      idx === 0
        ? 60 + Math.random() * 50
        : 40 + Math.random() * 60
    )
    const driveHours = segmentKm / config.avgSpeed
    currentMileage += segmentKm
    totalDriveHours += driveHours
    currentHour += driveHours

    if (totalDriveHours > 2 && !serviceAreas.length) {
      serviceAreas.push(pickRandom(PLAIN_SERVICE_AREAS, 1)[0])
      currentHour += 0.3
    }
    if (totalDriveHours > 4 && serviceAreas.length < 2) {
      serviceAreas.push(pickRandom(PLAIN_SERVICE_AREAS, 1)[0])
      currentHour += 0.3
    }

    const arrivalHour = Math.floor(currentHour)
    const arrivalMin = Math.round((currentHour % 1) * 60 / 10) * 10
    const arrivalTime = `${String(Math.min(arrivalHour, 20)).padStart(2, '0')}:${String(arrivalMin === 60 ? 0 : arrivalMin).padStart(2, '0')}`

    const duration = Math.round(spotData.duration * config.spotDurationMultiplier * 10) / 10

    spots.push({
      id: `spot-${day}-${idx}`,
      name: spotData.name,
      type: spotData.duration >= 8 ? 'hotel' : 'scenic',
      arrivalTime,
      duration,
      mileage: segmentKm,
      description: spotData.description,
      timeSegment: getTimeSegment(arrivalHour, spotData.duration >= 8 ? 'hotel' : 'scenic'),
    })

    currentHour += Math.min(duration, 4)

    if (currentHour >= 11.5 && currentHour <= 13.5 && !spots.some((s) => s.type === 'restaurant')) {
      const restaurant = pickRandom(RESTAURANT_SPOTS, 1)[0]
      spots.push({
        id: `restaurant-${day}-${idx}`,
        name: restaurant.name,
        type: 'restaurant',
        arrivalTime: `${String(Math.floor(currentHour)).padStart(2, '0')}:00`,
        duration: 1,
        mileage: 5,
        description: restaurant.description,
        timeSegment: 'lunch',
      })
      currentHour += 1.5
    }
  })

  const hotelKm = Math.round(20 + Math.random() * 30)
  currentMileage += hotelKm
  totalDriveHours += hotelKm / config.avgSpeed
  currentHour += hotelKm / config.avgSpeed
  const hotelArrivalHour = Math.min(Math.floor(currentHour), 22)

  spots.push({
    id: `hotel-${day}`,
    name: `第${day}晚住宿酒店`,
    type: 'hotel',
    arrivalTime: `${String(hotelArrivalHour).padStart(2, '0')}:00`,
    duration: 0,
    mileage: hotelKm,
    description: '舒适酒店，休息充电',
    timeSegment: 'hotel',
  })

  if (serviceAreas.length === 0) {
    serviceAreas.push(pickRandom(PLAIN_SERVICE_AREAS, 1)[0])
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
    route: {
      day,
      date: dateStr,
      totalMileage: Math.round(currentMileage),
      drivingDuration: Math.round(totalDriveHours * 10) / 10,
      serviceAreas,
      fuelChargeSuggestion,
      spots,
    },
    usedNames,
  }
}

export function generateRoute(params: TripParams, style: PlanStyle): ItineraryData {
  const allSpots = getBaseSpots(params, style)
  const usedSpotNames = new Set<string>()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 3)
  const lessMountain = params.preferences.includes('less_mountain')
  const styleInfo = PLAN_STYLES[style]

  const routes: DayRoute[] = []
  const usedNamesList: string[] = []
  for (let day = 1; day <= params.days; day++) {
    const result = generateDayRoute(params, style, day, startDate, allSpots, usedSpotNames)
    routes.push(result.route)
    usedNamesList.push(...result.usedNames)
  }

  const warnings: string[] = []
  const config = getPlanConfig(style)

  if (lessMountain) {
    const plainSpots = usedNamesList.filter((n) =>
      ['湿地', '湖', '滨', '平原', '花', '园', '农田', '村', '森林', '江', '河', '荷'].some((k) => n.includes(k))
    )
    const plainExamples = plainSpots.slice(0, 4).join('、')
    warnings.push(`✓ 少走山路偏好已生效，已避开峡谷、栈道、高山等山路景点，路线以平原、湖区、湿地为主`)
    if (plainExamples) {
      warnings.push(`  本次选用的平原/湖区景点：${plainExamples} 等`)
    }
  }

  warnings.push(`📌 ${config.description}`)

  routes.forEach((route) => {
    if (route.drivingDuration > config.maxDailyDriveHours) {
      warnings.push(`⚠️ 第${route.day}天驾驶时长${route.drivingDuration}小时，超出${styleInfo.name}推荐的${config.maxDailyDriveHours}小时`)
    }
    const hotelSpot = route.spots.find((s) => s.type === 'hotel')
    if (hotelSpot && parseInt(hotelSpot.arrivalTime) > 21) {
      warnings.push(`⚠️ 第${route.day}天预计${hotelSpot.arrivalTime}到达酒店，较晚抵达`)
    }
  })

  if (params.vehicleType === 'electric') {
    const longDay = routes.find((r) => r.totalMileage > 300)
    if (longDay) {
      warnings.push(`🔋 电动车出行，第${longDay.day}天里程较长(${longDay.totalMileage}km)，请提前规划充电站`)
    }
  }

  if (params.preferences.includes('camping')) {
    warnings.push('⛺ 露营偏好已生效，路线包含露营地，请准备相关装备')
  }

  if (params.preferences.includes('family')) {
    warnings.push('👶 亲子偏好已生效，景点中包含亲子农庄、儿童乐园等适合家庭的内容')
  }

  return {
    id: `${style}-${Date.now()}`,
    style,
    styleName: styleInfo.name,
    styleDesc: styleInfo.desc,
    params,
    routes,
    warnings,
    alternativeSpots: usedNamesList,
  }
}

export function generateAllPlans(params: TripParams): ItineraryData[] {
  const styles: PlanStyle[] = ['relaxed', 'scenic', 'efficient']
  return styles.map((style) => generateRoute(params, style))
}
