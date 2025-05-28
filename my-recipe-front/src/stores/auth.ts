import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器：添加 token
api.interceptors.request.use((config) => {
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

  const setAuth = (authData: { user: any; access_token: string }) => {
    user.value = authData.user
    token.value = authData.access_token
    localStorage.setItem('token', authData.access_token)
  }

  const login = async (login: string, password: string) => {
    try {
      console.log('Sending login request with:', { login }) // 不要打印密码
      const response = await api.post('/login', { 
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
      const response = await api.post('/register', data)
      setAuth(response.data)
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // 初始化时从 localStorage 恢复 token
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    initAuth
  }
})