import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, LogOut, Edit2, Camera, Upload } from 'lucide-react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function PetProfile() {
  const { pets, setPets, user, logout } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    species: 'cat',
    breed: '',
    weight: '',
    gender: 'male',
    is_neutered: false,
    medical_history: '',
    avatar_url: ''
  })

  useEffect(() => {
    fetchPets()
  }, [])

  async function fetchPets() {
    try {
      if (!user?.id) return
      const { data } = await api.pets.list(user.id)
      setPets(data || [])
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'cat',
      breed: '',
      weight: '',
      gender: 'male',
      is_neutered: false,
      medical_history: '',
      avatar_url: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (pet: any) => {
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      weight: pet.weight?.toString() || '',
      gender: pet.gender || 'male',
      is_neutered: pet.is_neutered || false,
      medical_history: pet.medical_history || '',
      avatar_url: pet.avatar_url || ''
    })
    setEditingId(pet.id)
    setShowForm(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const petData = {
        ...formData,
        weight: parseFloat(formData.weight),
        user_id: user?.id, 
      }

      if (editingId) {
        // Update existing pet
        await api.pets.update(editingId, petData)
        // Refresh local list (since we are mocking, we might need to manually update store if api doesn't return list)
        // For now let's re-fetch or update store directly
        const updatedPets = pets.map(p => p.id === editingId ? { ...p, ...petData } : p)
        setPets(updatedPets as any)
      } else {
        // Create new pet
        const { data } = await api.pets.create(petData)
        setPets([...pets, data])
      }
      
      resetForm()
    } catch (error) {
      console.error(error)
      alert('操作失败')
    }
  }

  async function deletePet(id: string) {
    if (!confirm('确定要删除吗？')) return
    await api.pets.delete(id)
    setPets(pets.filter(p => p.id !== id))
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的宠物 🐾</h1>
        <button 
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="p-2 bg-primary text-white rounded-full shadow-lg"
        >
          <Plus size={24} />
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md space-y-4 animate-in slide-in-from-top-4">
          <h2 className="font-semibold text-lg">{editingId ? '编辑宠物' : '添加新宠物'}</h2>
          
          {/* Avatar Upload */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400" size={32} />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
              >
                <Upload size={14} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">昵称</label>
              <input 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">种类</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value as 'cat' | 'dog'})}
              >
                <option value="cat">猫</option>
                <option value="dog">狗</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">体重 (kg)</label>
              <input 
                type="number" step="0.1" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">品种</label>
              <input 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">既往病史</label>
            <textarea 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
              rows={3}
              value={formData.medical_history}
              onChange={e => setFormData({...formData, medical_history: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="neutered"
              checked={formData.is_neutered}
              onChange={e => setFormData({...formData, is_neutered: e.target.checked})}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="neutered" className="text-sm text-gray-700">已绝育 / 已去势</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600"
            >
              {editingId ? '保存修改' : '添加宠物'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {pets.map(pet => (
          <div key={pet.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl overflow-hidden border border-gray-200">
                {pet.avatar_url ? (
                  <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{pet.species === 'cat' ? '🐱' : '🐶'}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{pet.name}</h3>
                <p className="text-sm text-gray-500">
                  {pet.breed} • {pet.weight}kg • {pet.gender === 'male' ? '♂️' : '♀️'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => handleEdit(pet)}
                className="text-gray-400 hover:text-blue-500 p-2"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => deletePet(pet.id)}
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        
        {pets.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">
            <p>暂无宠物。请在上方添加！</p>
          </div>
        )}
      </div>

      <div className="pt-8 pb-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium"
        >
          <LogOut size={20} />
          退出登录
        </button>
      </div>
    </div>
  )
}
