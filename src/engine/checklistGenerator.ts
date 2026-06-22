import type { ItineraryData, ChecklistItem } from '@/types'
import type { ChecklistItem as TChecklistItem } from '@/types'

type GroupType = TChecklistItem['group']

interface ChecklistEntry {
  group: GroupType
  category: string
  name: string
  isDaily?: boolean
}

const BASE_ITEMS: ChecklistEntry[] = [
  { group: 'documents', category: '证件资料', name: '身份证' },
  { group: 'documents', category: '证件资料', name: '驾驶证' },
  { group: 'documents', category: '证件资料', name: '行驶证' },
  { group: 'documents', category: '证件资料', name: '车辆保险单' },
  { group: 'documents', category: '证件资料', name: '身份证复印件' },
  { group: 'documents', category: '导航通讯', name: '离线地图下载' },
  { group: 'documents', category: '导航通讯', name: '对讲机(多车出行)' },

  { group: 'vehicle', category: '车辆检查', name: '轮胎胎压检查' },
  { group: 'vehicle', category: '车辆检查', name: '机油/冷却液检查' },
  { group: 'vehicle', category: '车辆检查', name: '刹车系统检查' },
  { group: 'vehicle', category: '车辆检查', name: '灯光系统检查' },
  { group: 'vehicle', category: '车辆检查', name: '备胎及换胎工具' },
  { group: 'vehicle', category: '车载装备', name: '手机支架' },
  { group: 'vehicle', category: '车载装备', name: '车载充电器' },
  { group: 'vehicle', category: '车载装备', name: '行车记录仪' },

  { group: 'energy', category: '补能用品', name: '加油卡' },
  { group: 'energy', category: '补能用品', name: '车载充电线' },
  { group: 'energy', category: '补能用品', name: '充电宝' },

  { group: 'clothing', category: '保暖衣物', name: '冲锋衣' },
  { group: 'clothing', category: '保暖衣物', name: '抓绒衣' },
  { group: 'clothing', category: '保暖衣物', name: '保暖内衣' },
  { group: 'clothing', category: '保暖衣物', name: '手套' },
  { group: 'clothing', category: '保暖衣物', name: '围巾' },
  { group: 'clothing', category: '防晒用品', name: '防晒霜SPF50+' },
  { group: 'clothing', category: '防晒用品', name: '太阳镜' },
  { group: 'clothing', category: '防晒用品', name: '遮阳帽' },
  { group: 'clothing', category: '防晒用品', name: '冰袖' },
  { group: 'clothing', category: '换洗衣物', name: '短袖T恤', isDaily: true },
  { group: 'clothing', category: '换洗衣物', name: '长裤/短裤', isDaily: true },
  { group: 'clothing', category: '换洗衣物', name: '舒适运动鞋', isDaily: true },
  { group: 'clothing', category: '换洗衣物', name: '内衣袜子', isDaily: true },
  { group: 'clothing', category: '换洗衣物', name: '睡衣' },

  { group: 'emergency', category: '急救用品', name: '急救包' },
  { group: 'emergency', category: '急救用品', name: '创可贴' },
  { group: 'emergency', category: '急救用品', name: '退烧药' },
  { group: 'emergency', category: '急救用品', name: '肠胃药' },
  { group: 'emergency', category: '急救用品', name: '晕车药' },
  { group: 'emergency', category: '急救用品', name: '防蚊液' },
  { group: 'emergency', category: '急救用品', name: '感冒药', isDaily: true },
  { group: 'emergency', category: '急救用品', name: '消炎药', isDaily: true },
  { group: 'emergency', category: '车辆应急', name: '三角警示牌' },
  { group: 'emergency', category: '车辆应急', name: '灭火器' },
  { group: 'emergency', category: '车辆应急', name: '拖车绳' },
  { group: 'emergency', category: '车辆应急', name: '搭电线' },
  { group: 'emergency', category: '车辆应急', name: '反光背心' },

  { group: 'other', category: '生活用品', name: '洗漱用品', isDaily: true },
  { group: 'other', category: '生活用品', name: '保温杯' },
  { group: 'other', category: '生活用品', name: '纸巾/湿巾', isDaily: true },
  { group: 'other', category: '生活用品', name: '垃圾袋', isDaily: true },
  { group: 'other', category: '生活用品', name: '雨具' },
  { group: 'other', category: '生活用品', name: '充电宝', isDaily: true },
]

const FAMILY_ITEMS: ChecklistEntry[] = [
  { group: 'family', category: '儿童用品', name: '儿童安全座椅' },
  { group: 'family', category: '儿童用品', name: '儿童推车' },
  { group: 'family', category: '儿童用品', name: '玩具/绘本' },
  { group: 'family', category: '儿童用品', name: '儿童专用餐具' },
  { group: 'family', category: '儿童用品', name: '尿不湿/湿巾' },
  { group: 'family', category: '儿童用品', name: '儿童常用药品' },
  { group: 'family', category: '食品饮料', name: '零食/水果' },
  { group: 'family', category: '食品饮料', name: '牛奶/酸奶' },
  { group: 'family', category: '食品饮料', name: '保温饭盒' },
]

const CAMPING_ITEMS: ChecklistEntry[] = [
  { group: 'camping', category: '露营装备', name: '帐篷' },
  { group: 'camping', category: '露营装备', name: '睡袋' },
  { group: 'camping', category: '露营装备', name: '防潮垫' },
  { group: 'camping', category: '露营装备', name: '营地灯' },
  { group: 'camping', category: '露营装备', name: '折叠桌椅' },
  { group: 'camping', category: '露营装备', name: '天幕' },
  { group: 'camping', category: '炊具用品', name: '卡式炉' },
  { group: 'camping', category: '炊具用品', name: '气罐' },
  { group: 'camping', category: '炊具用品', name: '锅具套装' },
  { group: 'camping', category: '炊具用品', name: '餐具' },
  { group: 'camping', category: '炊具用品', name: '打火机/火柴' },
  { group: 'camping', category: '其他露营', name: '露营灯' },
  { group: 'camping', category: '其他露营', name: '折叠水桶' },
  { group: 'camping', category: '其他露营', name: '防蚊网' },
]

const ELECTRIC_ITEMS: ChecklistEntry[] = [
  { group: 'energy', category: '电动车补能', name: '充电卡/充电APP' },
  { group: 'energy', category: '电动车补能', name: '便携充电枪' },
  { group: 'energy', category: '电动车补能', name: '充电延长线' },
  { group: 'energy', category: '电动车补能', name: '充电桩离线地图' },
  { group: 'energy', category: '电动车补能', name: '放电插座(V2L)' },
]

export function generateChecklist(itinerary: ItineraryData): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let idCounter = 0

  const addEntry = (entry: ChecklistEntry) => {
    items.push({
      id: `cl-${idCounter++}`,
      group: entry.group,
      category: entry.category,
      name: entry.name,
      checked: false,
      autoGenerated: true,
      isDaily: entry.isDaily || false,
    })
  }

  BASE_ITEMS.forEach(addEntry)

  if (itinerary.params.preferences.includes('family')) {
    FAMILY_ITEMS.forEach(addEntry)
  }

  if (itinerary.params.preferences.includes('camping')) {
    CAMPING_ITEMS.forEach(addEntry)
  }

  if (itinerary.params.vehicleType === 'electric') {
    ELECTRIC_ITEMS.forEach(addEntry)
  }

  const totalMileage = itinerary.routes.reduce((sum, r) => sum + r.totalMileage, 0)
  if (totalMileage > 1000) {
    addEntry({ group: 'vehicle', category: '长途建议', name: '出行前做一次全面保养' })
  }

  const maxDayMileage = Math.max(...itinerary.routes.map((r) => r.totalMileage))
  if (maxDayMileage > 400) {
    if (itinerary.params.vehicleType === 'fuel') {
      addEntry({ group: 'energy', category: '燃油补能', name: '备用油桶(合规)' })
    } else if (itinerary.params.vehicleType === 'hybrid') {
      addEntry({ group: 'energy', category: '补能建议', name: '沿途加油站标记' })
    }
  }

  const days = itinerary.params.days

  if (days > 3) {
    addEntry({ group: 'other', category: '生活用品', name: '洗衣液/晾衣绳' })
    addEntry({ group: 'other', category: '生活用品', name: '多功能插线板' })
    addEntry({ group: 'other', category: '生活用品', name: '一次性用品', isDaily: true })
    addEntry({ group: 'clothing', category: '换洗衣物', name: `备用衣物${days - 2}套`, isDaily: true })
    addEntry({ group: 'emergency', category: '急救用品', name: '常用药储备' })
    addEntry({ group: 'other', category: '补给储备', name: '瓶装水/饮用水', isDaily: true })
    addEntry({ group: 'other', category: '补给储备', name: '应急干粮零食', isDaily: true })
  }

  if (days > 5) {
    addEntry({ group: 'other', category: '生活用品', name: '折叠洗衣盆' })
    addEntry({ group: 'other', category: '生活用品', name: '衣物收纳袋' })
    addEntry({ group: 'other', category: '生活用品', name: '压缩袋' })
    addEntry({ group: 'clothing', category: '换洗衣物', name: '厚外套/备用鞋' })
    addEntry({ group: 'emergency', category: '急救用品', name: '外伤处理包' })
    addEntry({ group: 'vehicle', category: '长途建议', name: '备用车钥匙' })
    addEntry({ group: 'other', category: '补给储备', name: '便携急救食品' })
    addEntry({ group: 'documents', category: '证件资料', name: '行程保险单' })
  }

  if (days > 7) {
    addEntry({ group: 'other', category: '生活用品', name: '小型脱水机/晾衣架' })
    addEntry({ group: 'clothing', category: '换洗衣物', name: '多季节衣物' })
    addEntry({ group: 'emergency', category: '急救用品', name: '慢性病常用药足量' })
    addEntry({ group: 'vehicle', category: '长途建议', name: '车辆保养记录' })
    addEntry({ group: 'energy', category: '补能用品', name: '备用电源/逆变器' })
  }

  return items
}
