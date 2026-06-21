import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare,
  Square,
  Plus,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { CHECKLIST_GROUPS, PLAN_STYLES } from '@/types'
import type { ChecklistItem } from '@/types'

const GROUP_OPTIONS = [
  { value: 'documents', label: '证件资料' },
  { value: 'vehicle', label: '车辆装备' },
  { value: 'energy', label: '补能用品' },
  { value: 'clothing', label: '衣物保暖' },
  { value: 'family', label: '亲子用品' },
  { value: 'camping', label: '露营装备' },
  { value: 'emergency', label: '应急药品' },
  { value: 'other', label: '其他物品' },
]

export default function Checklist() {
  const navigate = useNavigate()
  const {
    checklist,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    getSelectedItinerary,
    exportChecklist,
  } = useTripStore()
  const itinerary = getSelectedItinerary()

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['documents', 'vehicle']))
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemGroup, setNewItemGroup] = useState<string>('other')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkedCount = checklist.filter((i) => i.checked).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  const groupedByGroup = useMemo(() => {
    const grouped: Record<string, { groupLabel: string; icon: string; categories: Record<string, ChecklistItem[]> }> = {}
    checklist.forEach((item) => {
      const groupInfo = CHECKLIST_GROUPS[item.group] || { label: item.group, icon: '📦', order: 99 }
      if (!grouped[item.group]) {
        grouped[item.group] = {
          groupLabel: groupInfo.label,
          icon: groupInfo.icon,
          categories: {},
        }
      }
      if (!grouped[item.group].categories[item.category]) {
        grouped[item.group].categories[item.category] = []
      }
      grouped[item.group].categories[item.category].push(item)
    })
    return grouped
  }, [checklist])

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addChecklistItem(
        newItemGroup as ChecklistItem['group'],
        newItemCategory.trim() || CHECKLIST_GROUPS[newItemGroup]?.label || '自定义',
        newItemName.trim()
      )
      setNewItemName('')
      setNewItemCategory('')
      setShowAddForm(false)
    }
  }

  const handleCopy = async () => {
    const text = exportChecklist()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const text = exportChecklist()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `路书行-出发清单.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!itinerary || checklist.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-6">
        <div className="text-sand-300 mb-4">
          <CheckSquare size={64} strokeWidth={1} />
        </div>
        <p className="text-sand-400 text-sm text-center mb-2">还没有出发清单</p>
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

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-sand-800">出发清单</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                itinerary.style === 'relaxed' ? 'bg-forest-100 text-forest-700' :
                itinerary.style === 'scenic' ? 'bg-sunset-100 text-sunset-700' :
                'bg-sand-100 text-sand-700'
              }`}>
                {PLAN_STYLES[itinerary.style].icon} {itinerary.styleName}
              </span>
              <span className="text-xs text-sand-400">{checkedCount}/{totalCount} 项已完成</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-sand-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-sand-500">准备进度</span>
            <span className="text-sm font-medium text-forest-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-sand-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {Object.entries(groupedByGroup)
          .sort((a, b) => {
            const orderA = CHECKLIST_GROUPS[a[0]]?.order || 99
            const orderB = CHECKLIST_GROUPS[b[0]]?.order || 99
            return orderA - orderB
          })
          .map(([group, data]) => {
            const isExpanded = expandedGroups.has(group)
            const catChecked = Object.values(data.categories)
              .flat()
              .filter((i) => i.checked).length
            const catTotal = Object.values(data.categories).flat().length

            return (
              <div
                key={group}
                className="bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-3 px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-sand-50 flex items-center justify-center text-base">
                    {data.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-sand-700">{data.groupLabel}</div>
                    <div className="text-xs text-sand-400">{catChecked}/{catTotal} 项</div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-sand-400" />
                  ) : (
                    <ChevronDown size={16} className="text-sand-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-2">
                        {Object.entries(data.categories).map(([category, items]) => {
                          const hasMultipleCategories = Object.keys(data.categories).length > 1
                          return (
                            <div key={category} className="space-y-1">
                              {hasMultipleCategories && (
                                <div className="text-xs text-sand-400 font-medium mt-2 first:mt-0">
                                  · {category}
                                </div>
                              )}
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2.5 group py-1 pl-2"
                                  style={{ paddingLeft: hasMultipleCategories ? '1rem' : '0.5rem' }}
                                >
                                  <button
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className="flex-shrink-0"
                                  >
                                    {item.checked ? (
                                      <CheckSquare size={18} className="text-forest-500" />
                                    ) : (
                                      <Square size={18} className="text-sand-300 hover:text-sand-400" />
                                    )}
                                  </button>
                                  <span
                                    className={`text-sm flex-1 transition-all ${
                                      item.checked
                                        ? 'line-through text-sand-300'
                                        : 'text-sand-700'
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  {!item.autoGenerated && (
                                    <button
                                      onClick={() => removeChecklistItem(item.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-sand-300 hover:text-sunset-400"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 space-y-2">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-white rounded-2xl shadow-xl border border-sand-100 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sand-700">添加自定义项</span>
                <button onClick={() => setShowAddForm(false)}>
                  <X size={16} className="text-sand-400" />
                </button>
              </div>
              <select
                value={newItemGroup}
                onChange={(e) => setNewItemGroup(e.target.value)}
                className="w-full px-3 py-2 bg-sand-50 border border-sand-100 rounded-xl text-sm text-sand-700 focus:outline-none focus:border-forest-400"
              >
                {GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                placeholder="分类（可选，如：儿童用品）"
                className="w-full px-3 py-2 bg-sand-50 border border-sand-100 rounded-xl text-sm focus:outline-none focus:border-forest-400"
              />
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="物品名称"
                className="w-full px-3 py-2 bg-sand-50 border border-sand-100 rounded-xl text-sm focus:outline-none focus:border-forest-400"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="w-full py-2 bg-forest-500 text-white rounded-xl text-sm font-medium disabled:opacity-40"
              >
                添加
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showExport && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-white rounded-2xl shadow-xl border border-sand-100 p-3 space-y-1.5"
            >
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                  <Copy size={16} className="text-forest-500" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-sand-700">
                    {copied ? '已复制！' : '复制文本'}
                  </div>
                  <div className="text-xs text-sand-400">复制清单到剪贴板</div>
                </div>
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-sunset-50 flex items-center justify-center">
                  <Download size={16} className="text-sunset-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-sand-700">下载文件</div>
                  <div className="text-xs text-sand-400">保存为文本文件</div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowExport(false) }}
            className="flex-1 py-3 bg-white border border-sand-200 text-sand-600 rounded-2xl font-medium text-sm flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            添加物品
          </button>
          <button
            onClick={() => { setShowExport(!showExport); setShowAddForm(false) }}
            className="flex-1 py-3 bg-gradient-to-r from-forest-600 to-forest-500 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Download size={16} />
            一键导出
          </button>
        </div>
      </div>
    </div>
  )
}
