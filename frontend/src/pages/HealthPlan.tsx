import { useState } from 'react'
import { Brain, Target, ChevronDown } from 'lucide-react'
import { useStore } from '../store'
import { clsx } from 'clsx'

type Plan = {
  goal: string
  target: string
  daily_calories: number
  schedule: { time: string; amount: string; type: string }[]
  exercise: string
  water: string
}

export default function HealthPlan() {
  const { pets, currentPetId, setCurrentPetId } = useStore()
  const currentPet = pets.find(p => p.id === currentPetId) || pets[0]

  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [goalType, setGoalType] = useState('lose')
  const [targetWeight, setTargetWeight] = useState('')
  const [showPetSwitcher, setShowPetSwitcher] = useState(false)

  const handleGenerate = () => {
    if ((goalType === 'lose' || goalType === 'gain') && !targetWeight) {
      alert('请输入目标体重')
      return
    }

    setGenerating(true)
    // Simulate AI API call
    setTimeout(() => {
      setPlan({
        goal: goalType === 'lose' ? '减重' : goalType === 'gain' ? '增重' : '保持健康',
        target: targetWeight ? `${targetWeight}kg` : `${currentPet?.weight || 4}kg`,
        daily_calories: goalType === 'lose' ? 200 : 300,
        schedule: [
          { time: '08:00', amount: '40g', type: '干粮' },
          { time: '14:00', amount: '20g', type: '湿粮' },
          { time: '20:00', amount: '40g', type: '干粮' },
        ],
        exercise: goalType === 'lose' ? '高强度互动：20分钟（早晚）' : '适度运动：15分钟',
        water: '确保每日饮用200ml新鲜水'
      })
      setGenerating(false)
    }, 2000)
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
                    setPlan(null) // Reset plan when switching pet
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

      {!plan ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <h2 className="text-xl font-bold">AI 规划师</h2>
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
              <>生成计划 ✨</>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Brain size={100} />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">当前计划</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  已保存并生效
                </span>
              </div>
              <button onClick={() => setPlan(null)} className="text-sm font-medium text-primary bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                重新调整
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500 uppercase">每日摄入</p>
                <p className="text-xl font-bold text-gray-900">{plan.daily_calories} kcal</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500 uppercase">目标体重</p>
                <p className="text-xl font-bold text-gray-900">{plan.target}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target size={18} className="text-primary" />
                喂食时间表
              </h4>
              <div className="space-y-3">
                {plan.schedule.map((item: any, i: number) => (
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
                {plan.exercise}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
