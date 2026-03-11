import { useState } from 'react'
import { Wifi, RefreshCw, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { Device } from '../types'

const MOCK_DEVICES: Device[] = [
  { id: '1', user_id: '1', name: '智能投食器 Pro', type: 'feeder', status: 'online', created_at: '' },
  { id: '2', user_id: '1', name: '智能饮水机', type: 'waterer', status: 'offline', created_at: '' },
]

export default function DeviceControl() {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES)
  const [feeding, setFeeding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeviceName, setNewDeviceName] = useState('')
  const [newDeviceType, setNewDeviceType] = useState<'feeder' | 'waterer'>('feeder')
  
  const handleFeed = () => {
    setFeeding(true)
    setTimeout(() => setFeeding(false), 2000)
  }

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeviceName) return

    const newDevice: Device = {
      id: Math.random().toString(),
      user_id: '1',
      name: newDeviceName,
      type: newDeviceType,
      status: 'online',
      created_at: new Date().toISOString()
    }

    setDevices([...devices, newDevice])
    setShowAddForm(false)
    setNewDeviceName('')
  }

  const removeDevice = (id: string) => {
    if (confirm('确定要解绑该设备吗？')) {
      setDevices(devices.filter(d => d.id !== id))
    }
  }

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">智能设备 🤖</h1>
          <p className="text-gray-600">管理您的智能硬件。</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="p-2 bg-primary text-white rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Add Device Modal/Form Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">添加新设备</h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
                <input 
                  autoFocus
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary"
                  placeholder="例如：客厅投食器"
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">设备类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setNewDeviceType('feeder')}
                    className={clsx(
                      "p-3 rounded-xl border-2 font-medium transition-colors",
                      newDeviceType === 'feeder' ? "border-primary text-primary bg-orange-50" : "border-gray-100 text-gray-500"
                    )}
                  >
                    投食器
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewDeviceType('waterer')}
                    className={clsx(
                      "p-3 rounded-xl border-2 font-medium transition-colors",
                      newDeviceType === 'waterer' ? "border-primary text-primary bg-orange-50" : "border-gray-100 text-gray-500"
                    )}
                  >
                    饮水机
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200"
                >
                  绑定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {devices.map(device => (
          <div key={device.id} className={clsx(
            "bg-white rounded-xl shadow-sm border overflow-hidden transition-all",
            device.status === 'offline' ? "border-gray-100 opacity-80" : "border-green-100"
          )}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  device.status === 'online' ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
                <h3 className="font-bold text-gray-900">{device.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                {device.status === 'online' ? (
                   <Wifi size={18} className="text-green-500" />
                ) : (
                   <AlertCircle size={18} className="text-red-500" />
                )}
                <button onClick={() => removeDevice(device.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {device.status === 'online' ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1 border-r border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">剩余{device.type === 'feeder' ? '粮' : '水'}量</p>
                      <p className="text-xl font-bold text-gray-900">85%</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">上次{device.type === 'feeder' ? '喂食' : '加水'}</p>
                      <p className="text-xl font-bold text-gray-900">08:00</p>
                    </div>
                  </div>

                  {device.type === 'feeder' && (
                    <button 
                      onClick={handleFeed}
                      disabled={feeding}
                      className={clsx(
                        "w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95",
                        feeding ? "bg-gray-400" : "bg-primary hover:bg-orange-600 shadow-orange-200"
                      )}
                    >
                      {feeding ? '投食中...' : '立即投食 (50克)'}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-2 text-gray-500">
                  <p className="mb-4 text-sm">设备已离线，请检查网络连接</p>
                  <button className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <RefreshCw size={16} /> 尝试重连
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {devices.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p>暂无设备，点击右上角添加</p>
          </div>
        )}
      </div>
    </div>
  )
}
