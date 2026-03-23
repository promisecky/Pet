import { useState, useEffect } from 'react'
import { Brain, Target, ChevronDown, Edit3 } from 'lucide-react'
import { useStore } from '../store'
import { clsx } from 'clsx'
import { api } from '../lib/api'

type Plan = {
  id?: string
  goal_type: string
  target_weight: number
  daily_calories: number
  feeding_schedule: { time: string; amount: string; type: string }[]
  exercise_plan: string
  status: string
}

export default function HealthPlan() {
  const { pets, currentPetId, setCurrentPetId, setTasks } = useStore()
  const currentPet = pets.find(p => p.id === currentPetId) || pets[0]

  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [goalType, setGoalType] = useState('lose')
  const [targetWeight, setTargetWeight] = useState('')
  const [showPetSwitcher, setShowPetSwitcher] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (currentPetId) {
      fetchPlan()
    }
  }, [currentPetId])

  async function fetchPlan() {
    try {
      setLoading(true)
      const { data } = await api.healthPlans.get(currentPetId!)
      if (data) {
        setPlan(data)
        // Set form defaults from existing plan
        setGoalType(data.goal_type)
        setTargetWeight(data.target_weight?.toString() || '')
        setIsEditing(false)
      } else {
        setPlan(null)
        setIsEditing(true) // Show create form if no plan
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if ((goalType === 'lose' || goalType === 'gain') && !targetWeight) {
      alert('请输入目标体重')
      return
    }

    setGenerating(true)
    
    try {
      const targetW = targetWeight ? parseFloat(targetWeight) : undefined
      const { data } = await api.healthPlans.generate(currentPetId!, goalType, targetW)
      setPlan(data)
      setIsEditing(false)
      
      // Refresh tasks in store to sync with dashboard
      const { data: tasksData } = await api.tasks.list(currentPetId!)
      setTasks(tasksData)
    } catch (error) {
      console.error(error)
      alert('生成计划失败')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>
  }

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-center relative z-20">
        <div>
          <h1 className="text-2xl font-bold">健康计划 🩺</h1>
          <p className="text-gray-600">AI 驱动的个性化护理。</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowPetSwitcher(!showPetSwitcher)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs overflow-hidden">
               {currentPet?.avatar_url ? (
                 <img src={currentPet.avatar_url} alt="Pet" className="w-full h-full object-cover" />
               ) : (
                 <span>{currentPet?.species === 'dog' ? '🐶' : '🐱'}</span>
               )}
            </div>
            <span className="text-sm font-medium text-gray-700">{currentPet?.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showPetSwitcher && (
            <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
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
        </div>
      </header>

      {isEditing || !plan ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <h2 className="text-xl font-bold">{plan ? '调整计划' : 'AI 规划师'}</h2>
            </div>
            {plan && (
              <button onClick={() => setIsEditing(false)} className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                取消
              </button>
            )}
          </div>
          
          <p className="mb-6 opacity-90 text-sm">
            为 {currentPet?.name} ({currentPet?.weight}kg) 生成科学计划。
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <label className="block text-xs uppercase tracking-wider opacity-70 mb-1">目标类型</label>
              <select 
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-medium"
              >
                <option className="text-black" value="lose">减重 (Weight Loss)</option>
                <option className="text-black" value="gain">增重 (Weight Gain)</option>
                <option className="text-black" value="maintain">保持健康 (Maintain)</option>
              </select>
            </div>

            {(goalType === 'lose' || goalType === 'gain') && (
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm animate-in slide-in-from-top-2">
                <label className="block text-xs uppercase tracking-wider opacity-70 mb-1">目标体重 (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="请输入目标体重"
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-medium placeholder-white/30"
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>正在生成计划...</>
            ) : (
              <>{plan ? '生成新计划 ✨' : '生成计划 ✨'}</>
            )}
          </button>
        </div>
      ) : null}

      {plan ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 mt-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Brain size={100} />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">当前计划</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  {plan.goal_type === 'lose' ? '减重模式' : plan.goal_type === 'gain' ? '增重模式' : '健康保持'}
                </span>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit3 size={14} />
                  修改计划
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500 uppercase">每日摄入</p>
                <p className="text-xl font-bold text-gray-900">{plan.daily_calories} kcal</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500 uppercase">目标体重</p>
                <p className="text-xl font-bold text-gray-900">{plan.target_weight} kg</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target size={18} className="text-primary" />
                喂食时间表
              </h4>
              <div className="space-y-3">
                {plan.feeding_schedule && plan.feeding_schedule.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <span className="font-mono text-gray-500 font-medium">{item.time}</span>
                    <span className="font-medium text-gray-700">{item.type}</span>
                    <span className="text-primary font-bold">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
              <h4 className="font-semibold text-gray-900 mb-2">运动建议</h4>
              <p className="text-gray-600 text-sm bg-indigo-50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                {plan.exercise_plan}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
