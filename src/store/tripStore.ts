import { create } from 'zustand'
import type { TripParams, ItineraryData, ChecklistItem, OptimizationType } from '@/types'
import { generateAllPlans } from '@/engine/routeGenerator'
import { recalculateTime } from '@/engine/timeRecalculator'
import { generateChecklist } from '@/engine/checklistGenerator'
import { CHECKLIST_GROUPS, VEHICLE_LABELS, PREFERENCE_LABELS } from '@/types'

interface TripStore {
  params: TripParams | null
  alternatives: ItineraryData[]
  selectedItineraryId: string | null
  checklist: ChecklistItem[]
  isGenerating: boolean
  setParams: (params: TripParams) => void
  generatePlans: (params: TripParams) => void
  selectItinerary: (id: string) => void
  getSelectedItinerary: () => ItineraryData | null
  moveSpot: (spotId: string, fromDay: number, toDay: number, toIndex: number) => void
  applyOptimization: (type: OptimizationType) => void
  toggleChecklistItem: (id: string) => void
  addChecklistItem: (group: ChecklistItem['group'], category: string, name: string) => void
  removeChecklistItem: (id: string) => void
  buildChecklist: () => void
  exportChecklist: () => string
}

export const useTripStore = create<TripStore>((set, get) => ({
  params: null,
  alternatives: [],
  selectedItineraryId: null,
  checklist: [],
  isGenerating: false,

  setParams: (params) => set({ params }),

  generatePlans: (params) => {
    set({ isGenerating: true, params, alternatives: [], selectedItineraryId: null, checklist: [] })
    setTimeout(() => {
      const alternatives = generateAllPlans(params)
      set({ alternatives, isGenerating: false })
    }, 2000)
  },

  selectItinerary: (id) => {
    const { alternatives } = get()
    const selected = alternatives.find((a) => a.id === id)
    if (selected) {
      const checklist = generateChecklist(selected)
      set({ selectedItineraryId: id, checklist })
    }
  },

  getSelectedItinerary: () => {
    const { alternatives, selectedItineraryId } = get()
    return alternatives.find((a) => a.id === selectedItineraryId) || null
  },

  moveSpot: (spotId, fromDay, toDay, toIndex) => {
    const { alternatives, selectedItineraryId } = get()
    if (!selectedItineraryId) return

    const itinerary = alternatives.find((a) => a.id === selectedItineraryId)
    if (!itinerary) return

    const newRoutes = itinerary.routes.map((route) => ({
      ...route,
      spots: [...route.spots],
    }))

    const fromRoute = newRoutes.find((r) => r.day === fromDay)
    const toRoute = newRoutes.find((r) => r.day === toDay)
    if (!fromRoute || !toRoute) return

    const spotIndex = fromRoute.spots.findIndex((s) => s.id === spotId)
    if (spotIndex === -1) return

    const [movedSpot] = fromRoute.spots.splice(spotIndex, 1)
    toRoute.spots.splice(toIndex, 0, movedSpot)

    const updated = recalculateTime({ ...itinerary, routes: newRoutes })

    set((state) => ({
      alternatives: state.alternatives.map((a) => (a.id === selectedItineraryId ? updated : a)),
    }))
  },

  applyOptimization: (type) => {
    const { alternatives, selectedItineraryId } = get()
    if (!selectedItineraryId) return

    const itinerary = alternatives.find((a) => a.id === selectedItineraryId)
    if (!itinerary) return

    const newRoutes = itinerary.routes.map((route) => ({
      ...route,
      spots: [...route.spots],
    }))

    if (type === 'less_drive') {
      newRoutes.forEach((route) => {
        const scenicSpots = route.spots.filter(
          (s) => s.type === 'scenic' || s.type === 'rest'
        )
        if (scenicSpots.length > 2 && route.drivingDuration > 4) {
          const lastScenic = scenicSpots[scenicSpots.length - 1]
          const idx = route.spots.findIndex((s) => s.id === lastScenic.id)
          if (idx !== -1) {
            route.spots.splice(idx, 1)
          }
        }
      })
    }

    if (type === 'early_hotel') {
      newRoutes.forEach((route) => {
        const hotelIdx = route.spots.findIndex((s) => s.type === 'hotel')
        if (hotelIdx !== -1) {
          const hotel = route.spots.splice(hotelIdx, 1)[0]
          const scenicSpots = route.spots.filter((s) => s.type === 'scenic')
          if (scenicSpots.length > 1) {
            const insertAfter = route.spots.findIndex(
              (s) => s.id === scenicSpots[Math.floor(scenicSpots.length / 2)].id
            )
            route.spots.splice(insertAfter + 1, 0, hotel)
          } else {
            route.spots.push(hotel)
          }
        }
      })
    }

    if (type === 'add_lunch') {
      newRoutes.forEach((route) => {
        const hasRestaurant = route.spots.some((s) => s.type === 'restaurant')
        if (!hasRestaurant) {
          const scenicSpots = route.spots.filter((s) => s.type === 'scenic')
          if (scenicSpots.length >= 1) {
            const midIdx = Math.floor(scenicSpots.length / 2)
            const afterSpot = scenicSpots[midIdx]
            const insertIdx = route.spots.findIndex((s) => s.id === afterSpot.id) + 1
            route.spots.splice(insertIdx, 0, {
              id: `lunch-${route.day}-${Date.now()}`,
              name: '沿途特色餐厅',
              type: 'restaurant',
              arrivalTime: '12:00',
              duration: 1,
              mileage: 0,
              description: '当地特色美食，休息用餐',
              timeSegment: 'lunch',
            })
          }
        }
      })
    }

    const updated = recalculateTime({ ...itinerary, routes: newRoutes })
    const checklist = generateChecklist(updated)

    set((state) => ({
      alternatives: state.alternatives.map((a) => (a.id === selectedItineraryId ? updated : a)),
      checklist,
    }))
  },

  toggleChecklistItem: (id) => {
    set((state) => ({
      checklist: state.checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }))
  },

  addChecklistItem: (group, category, name) => {
    set((state) => ({
      checklist: [
        ...state.checklist,
        {
          id: `custom-${Date.now()}`,
          group,
          category,
          name,
          checked: false,
          autoGenerated: false,
        },
      ],
    }))
  },

  removeChecklistItem: (id) => {
    set((state) => ({
      checklist: state.checklist.filter((item) => item.id !== id),
    }))
  },

  buildChecklist: () => {
    const itinerary = get().getSelectedItinerary()
    if (!itinerary) return
    const checklist = generateChecklist(itinerary)
    set({ checklist })
  },

  exportChecklist: () => {
    const { checklist } = get()
    const itinerary = get().getSelectedItinerary()
    if (!itinerary) {
      let text = '🚗 路书行 - 出发清单\n\n'
      const groupedByGroup: Record<string, { groupLabel: string; categories: Record<string, typeof checklist> }> = {}
      checklist.forEach((item) => {
        const groupInfo = CHECKLIST_GROUPS[item.group] || { label: item.group, icon: '', order: 99 }
        if (!groupedByGroup[item.group]) {
          groupedByGroup[item.group] = { groupLabel: groupInfo.label, categories: {} }
        }
        if (!groupedByGroup[item.group].categories[item.category]) {
          groupedByGroup[item.group].categories[item.category] = []
        }
        groupedByGroup[item.group].categories[item.category].push(item)
      })
      Object.entries(groupedByGroup).sort((a, b) => {
        const orderA = CHECKLIST_GROUPS[a[0]]?.order || 99
        const orderB = CHECKLIST_GROUPS[b[0]]?.order || 99
        return orderA - orderB
      }).forEach(([_, data]) => {
        text += `【${data.groupLabel}】\n`
        Object.entries(data.categories).forEach(([cat, items]) => {
          if (Object.keys(data.categories).length > 1) {
            text += `  · ${cat}\n`
          }
          items.forEach((item) => {
            const indent = Object.keys(data.categories).length > 1 ? '    ' : '  '
            text += `${indent}${item.checked ? '✅' : '⬜'} ${item.name}\n`
          })
        })
        text += '\n'
      })
      return text
    }

    const totalMileage = itinerary.routes.reduce((sum, r) => sum + r.totalMileage, 0)
    const totalDriveHours = itinerary.routes.reduce((sum, r) => sum + r.drivingDuration, 0)
    const vehicleLabel = VEHICLE_LABELS[itinerary.params.vehicleType]
    const preferenceStr = itinerary.params.preferences
      .map((p) => PREFERENCE_LABELS[p] || p)
      .join('、') || '无'

    let header = `🚗 路书行 - 出发清单 (${itinerary.styleName})
━━━━━━━━━━━━━━━━━━━━━━━━
${itinerary.styleDesc}
━━━━━━━━━━━━━━━━━━━━━━━━
📍 出发地：${itinerary.params.departure}
📅 出行天数：${itinerary.params.days}天
👥 同行人数：${itinerary.params.companions}人
🚙 车辆类型：${vehicleLabel}
⏱️ 每日驾驶：${itinerary.params.dailyDriveHours}小时
🎯 出行偏好：${preferenceStr}
📊 总里程：约 ${totalMileage} km
⏰ 总驾驶时长：约 ${Math.round(totalDriveHours)} 小时
━━━━━━━━━━━━━━━━━━━━━━━━

📅 每日行程概览：
`
    itinerary.routes.forEach((route) => {
      const scenicSpots = route.spots.filter((s) => s.type === 'scenic').map((s) => s.name).join('、')
      header += `  D${route.day} (${route.date})：${route.totalMileage}km · ${route.drivingDuration}h驾驶
    景点：${scenicSpots || '无'}
`
    })

    header += `
━━━━━━━━━━━━━━━━━━━━━━━━
📋 物品清单：
`

    const groupedByGroup: Record<string, { groupLabel: string; categories: Record<string, typeof checklist> }> = {}
    checklist.forEach((item) => {
      const groupInfo = CHECKLIST_GROUPS[item.group] || { label: item.group, icon: '', order: 99 }
      if (!groupedByGroup[item.group]) {
        groupedByGroup[item.group] = { groupLabel: groupInfo.label, categories: {} }
      }
      if (!groupedByGroup[item.group].categories[item.category]) {
        groupedByGroup[item.group].categories[item.category] = []
      }
      groupedByGroup[item.group].categories[item.category].push(item)
    })

    let text = header
    Object.entries(groupedByGroup).sort((a, b) => {
      const orderA = CHECKLIST_GROUPS[a[0]]?.order || 99
      const orderB = CHECKLIST_GROUPS[b[0]]?.order || 99
      return orderA - orderB
    }).forEach(([_, data]) => {
      text += `\n【${data.groupLabel}】\n`
      Object.entries(data.categories).forEach(([cat, items]) => {
        if (Object.keys(data.categories).length > 1) {
          text += `  · ${cat}\n`
        }
        items.forEach((item) => {
          const indent = Object.keys(data.categories).length > 1 ? '    ' : '  '
          text += `${indent}${item.checked ? '✅' : '⬜'} ${item.name}\n`
        })
      })
    })

    return text
  },
}))
