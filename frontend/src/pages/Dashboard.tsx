import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Droplets, Utensils, CloudSun, Check, Sparkles, Smile, Gamepad2, Moon, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../store'
import { api } from '../lib/api'
import { Task } from '../types'

const ICON_MAP: Record<string, any> = {
  'utensils': Utensils,
  'droplets': Droplets,
  'activity': Activity,
  'sparkles': Sparkles,
}

export default function Dashboard() {
  const { user, pets, currentPetId, setCurrentPetId, setPets, tasks, setTasks } = useStore()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showPetSwitcher, setShowPetSwitcher] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const currentPet = pets.find(p => p.id === currentPetId) || pets[0]

  const STATUS_MAP: Record<string, { icon: any, color: string, label: string }> = {
    'happy': { icon: Smile, color: 'bg-yellow-400', label: '开心' },
    'playing': { icon: Gamepad2, color: 'bg-blue-400', label: '玩耍' },
    'sleeping': { icon: Moon, color: 'bg-purple-400', label: '睡觉' }
  }
  
  const currentStatus = currentPet?.status ? STATUS_MAP[currentPet.status] : null

  useEffect(() => {
    if (user?.id) {
      fetchPets()
    }
  }, [user?.id])
  
  useEffect(() => {
    if (currentPetId) {
      fetchTasks()
      fetchWeights()
    }
  }, [currentPetId])

  async function fetchPets() {
    try {
      if (!user?.id) return
      const { data } = await api.pets.list(user.id)
      if (data) {
        setPets(data)
        if (!currentPetId && data.length > 0) {
          setCurrentPetId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    }
  }

  async function fetchTasks() {
    try {
      if (!currentPetId) return
      const { data } = await api.tasks.list(currentPetId)
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleComplete = async (id: string) => {
    setCompletingId(id)
    try {
      // Optimistic update locally first
      setTasks(prev => {
        const newTasks = [...prev]
        const index = newTasks.findIndex(t => t.id === id)
        if (index !== -1) {
           const [task] = newTasks.splice(index, 1)
           task.completed = true
           newTasks.push(task)
        }
        return newTasks
      })
      
      await api.tasks.updateStatus(id, true)
    } catch (e) {
      console.error(e)
      fetchTasks() // Revert on error
    } finally {
      setCompletingId(null)
    }
  }

  const handleAddStatus = async (statusKey: string) => {
    if (!currentPetId) return
    try {
      // Optimistic update
      const updatedPets = pets.map(p => p.id === currentPetId ? { ...p, status: statusKey } : p)
      setPets(updatedPets)
      setShowStatusMenu(false)

      await api.pets.update(currentPetId, { status: statusKey })
    } catch (e) {
      console.error(e)
      // Revert if failed (optional, but good practice)
      fetchPets()
    }
  }

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  const [weightData, setWeightData] = useState<{ date: string; weight: number | null }[]>([])

  useEffect(() => {
    if (currentPetId) {
      fetchWeights()
    }
  }, [currentPetId])

  async function fetchWeights() {
    try {
      if (!currentPetId) return
      const { data } = await api.weights.list(currentPetId)
      
      // Process data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
      })

      // Sort data by date
      data.sort((a: any, b: any) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())

      let lastKnownWeight: number | null = null;

      const chartData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0]
        const record = data.find((r: any) => r.recordDate.startsWith(dateStr))
        
        if (record) {
           lastKnownWeight = parseFloat(record.weight.toFixed(2))
        }

        return {
          date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
          weight: lastKnownWeight
        }
      })
      
      setWeightData(chartData)
    } catch (error) {
      console.error('Error fetching weights:', error)
    }
  }

  const handleOpenWeightModal = () => {
    if (!currentPetId) return
    setWeightInput('')
    setShowWeightModal(true)
  }

  const handleConfirmWeight = async () => {
    const weight = parseFloat(weightInput)
    if (!isNaN(weight) && currentPetId) {
      try {
        await api.weights.add(currentPetId, weight)
        fetchWeights() // Refresh chart
        // Update pet in store
        const updatedPets = pets.map(p => p.id === currentPetId ? { ...p, weight } : p)
        setPets(updatedPets)
        setShowWeightModal(false)
      } catch (error) {
        console.error(error)
        alert('记录失败')
      }
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-orange-100 relative z-20">
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setShowPetSwitcher(!showPetSwitcher)}
            className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-2xl overflow-hidden active:scale-95 transition-transform"
          >
             {currentPet?.avatar_url ? (
               <img src={currentPet.avatar_url} alt="Pet" className="w-full h-full object-cover" />
             ) : (
               <span>{currentPet?.species === 'dog' ? '🐶' : '🐱'}</span>
             )}
          </button>
          
          {showPetSwitcher && (
            <div className="absolute top-14 left-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs text-gray-400 px-2 py-1 mb-1">切换宠物</p>
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => {
                    setCurrentPetId(pet.id)
                    setShowPetSwitcher(false)
                  }}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2",
                    currentPetId === pet.id ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-gray-50"
                  )}
                >
                  <span>{pet.species === 'dog' ? '🐶' : '🐱'}</span>
                  {pet.name}
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                {currentPet?.name || '毛孩子'}
                <ChevronDown size={14} className="text-gray-400" />
              </h1>
              {currentStatus && (
                <div className={`p-1 rounded-full ${currentStatus.color} animate-in zoom-in duration-300`}>
                  <currentStatus.icon size={14} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">今天也要元气满满哦</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1 text-orange-500">
            <CloudSun size={24} />
            <span className="font-bold text-lg">25°C</span>
          </div>
          <span className="text-xs text-gray-400">晴朗微风</span>
        </div>
      </header>

      {/* Today's Tasks Queue */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-lg font-semibold text-gray-900">今日任务</h2>
          <div className="flex gap-2">
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              待办 {pendingCount}
            </span>
            {completedCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                已办 {completedCount}
              </span>
            )}
          </div>
        </div>
        
        <div className="relative h-[270px] overflow-y-auto pr-2 custom-scrollbar"> 
          {tasks.map((task, index) => {
            const Icon = ICON_MAP[task.icon] || Activity
            const isCompleting = completingId === task.id
            const bgClass = {
              orange: 'bg-orange-50 text-orange-600',
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600'
            }[task.color] || 'bg-gray-50 text-gray-600'

            const checkboxClass = {
              orange: 'text-orange-500 border-orange-200',
              blue: 'text-blue-500 border-blue-200',
              green: 'text-green-500 border-green-200',
              purple: 'text-purple-500 border-purple-200'
            }[task.color] || 'text-gray-500'

            // Add opacity/grayscale for completed tasks
            const containerClass = task.completed 
              ? "bg-gray-50 border-gray-100 opacity-60 grayscale" 
              : "bg-white border-gray-100"

            return (
              <div 
                key={task.id}
                className={clsx(
                  "flex items-center justify-between p-4 mb-3 rounded-xl shadow-sm border transition-all duration-500 ease-in-out transform",
                  isCompleting ? "opacity-0 translate-x-full scale-95" : "opacity-100 translate-x-0 scale-100",
                  "animate-in slide-in-from-bottom-2 fade-in duration-300",
                  containerClass
                )}
                style={{ zIndex: 10 - index }}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx("p-3 rounded-full", bgClass)}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className={clsx("font-bold text-gray-800", (isCompleting || task.completed) && "line-through text-gray-400")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">{task.detail}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={isCompleting || task.completed}
                  className={clsx(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-90",
                    (isCompleting || task.completed) ? "bg-green-500 border-green-500 text-white" : `bg-transparent ${checkboxClass} hover:bg-gray-50`
                  )}
                >
                  {(isCompleting || task.completed) ? <Check size={16} /> : <div className="w-4 h-4 rounded-full" />}
                </button>
              </div>
            )
          })}
          
          {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              <Sparkles className="mx-auto mb-2 opacity-50" />
              <p>所有任务已完成！太棒了！</p>
            </div>
          )}
        </div>
      </section>

      {/* Weight Trend */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          体重趋势 
          <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded">近7天</span>
        </h2>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af' }}
                interval={0} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                hide 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} KG`, '体重']}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#f97316" 
                strokeWidth={3} 
                connectNulls={true}
                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 pb-6">
        <div className="relative">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-transform"
          >
            <Smile className="mb-2 opacity-90" size={28} />
            <span className="font-bold">添加状态</span>
          </button>
          
          {showStatusMenu && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in slide-in-from-bottom-2 duration-200 z-30">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleAddStatus('happy')} className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-yellow-100 text-yellow-500 rounded-full mb-1"><Smile size={20} /></div>
                  <span className="text-xs text-gray-500">开心</span>
                </button>
                <button onClick={() => handleAddStatus('playing')} className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-full mb-1"><Gamepad2 size={20} /></div>
                  <span className="text-xs text-gray-500">玩耍</span>
                </button>
                <button onClick={() => handleAddStatus('sleeping')} className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 text-purple-500 rounded-full mb-1"><Moon size={20} /></div>
                  <span className="text-xs text-gray-500">睡觉</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleOpenWeightModal}
          className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-transform"
        >
          <Activity className="mb-2 opacity-90" size={28} />
          <span className="font-bold">记录体重</span>
        </button>
      </div>

      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">记录今日体重</h3>
            <div className="relative mb-6">
              <input
                type="number"
                autoFocus
                step="0.01"
                className="w-full px-4 py-3 text-2xl font-bold text-center text-orange-600 border-2 border-orange-100 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                placeholder="0.00"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">KG</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowWeightModal(false)}
                className="flex-1 py-3 text-gray-600 bg-gray-50 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmWeight}
                disabled={!weightInput}
                className="flex-1 py-3 text-white bg-orange-500 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
