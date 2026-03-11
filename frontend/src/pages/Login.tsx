import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { PawPrint, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useStore(state => state.login)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data } = await api.auth.login(email, password)
      
      // Map backend user to frontend store user
      const user = {
        id: data.user.id,
        name: data.profile?.nickname || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || ''
      }
      
      login(user)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 p-6 rounded-full inline-block">
          <PawPrint size={64} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Pet Health</h1>
        <p className="text-gray-500">您的智能宠物健康管家</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱 / 手机号
          </label>
          <input
            type="text"
            id="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="输入您的账号"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            id="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="输入您的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 active:scale-95 transition-all hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : '立即开启'}
        </button>
      </form>
      
      <p className="text-xs text-gray-400 text-center mt-8">
        点击开启即代表同意《用户协议》与《隐私政策》
      </p>
    </div>
  )
}
