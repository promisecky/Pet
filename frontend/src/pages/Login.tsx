import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { PawPrint, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useStore(state => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isRegister) {
        await api.auth.register(email, password, nickname)
        // Auto login after register
        const { data } = await api.auth.login(email, password)
        handleLoginSuccess(data)
      } else {
        const { data } = await api.auth.login(email, password)
        handleLoginSuccess(data)
      }
    } catch (err: any) {
      console.error(err)
      setError(isRegister ? '注册失败，请重试' : '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (data: any) => {
    const user = {
      id: data.user.id,
      name: data.profile?.nickname || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || ''
    }
    login(user)
    navigate('/')
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

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="输入您的邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {isRegister && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              昵称
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="输入您的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
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
          {loading ? <Loader2 className="animate-spin" /> : (isRegister ? '立即注册' : '立即登录')}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="text-sm text-primary hover:underline"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </form>
      
      <p className="text-xs text-gray-400 text-center mt-8">
        点击{isRegister ? '注册' : '登录'}即代表同意《用户协议》与《隐私政策》
      </p>
    </div>
  )
}
