import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
})

// 请求拦截器：添加 token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{
    id: number
    nickname: string
    email?: string
    phone?: string
  } | null>(null)
  const token = ref<string | null>(null)
  const lastVisitedPath = ref<string>('/recipes')

  const setAuth = (authData: { user: any; access_token: string }) => {
    user.value = authData.user
    token.value = authData.access_token
    localStorage.setItem('token', authData.access_token)
  }

  const login = async (login: string, password: string) => {
    try {
      console.log('Sending login request with:', { login }) // 不要打印密码
      const response = await authApi.post('/login', { 
        login,  // 确保使用 login 作为字段名
        password 
      })
      console.log('Login response:', response.data)
      setAuth(response.data)
      return true
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  }

  const register = async (data: {
    nickname: string
    email?: string
    phone?: string
    password: string
    password_confirmation: string
  }) => {
    try {
      const response = await authApi.post('/register', data)
      setAuth(response.data)
      return true
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // 调用后端的登出接口
      await authApi.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 无论后端是否成功，都清除本地状态
      user.value = null
      token.value = null
      localStorage.removeItem('token')
    }
  }

  const setLastVisitedPath = (path: string) => {
    lastVisitedPath.value = path
  }

  // 初始化时从 localStorage 恢复 token
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  const googleLogin = async (credential: string) => {
    try {
      console.log('Sending Google credential to backend')
      const response = await authApi.post('/auth/google', { credential })
      console.log('Google login response:', response.data)
      setAuth(response.data)
      return true
    } catch (error: any) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  return {
    user,
    token,
    lastVisitedPath,
    login,
    register,
    logout,
    setLastVisitedPath,
    initAuth,
    googleLogin
  }
})