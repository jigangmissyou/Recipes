import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{
    id: string
    name: string
    email: string
  } | null>(null)
  const token = ref<string | null>(null)

  const login = async (email: string, password: string) => {
    // 模拟登录API调用
    return new Promise<boolean>((resolve: (value: boolean) => void) => {
      setTimeout(() => {
        user.value = {
          id: '1',
          name: 'Test User',
          email: email
        }
        token.value = 'mock-token'
        resolve(true)
      }, 1000)
    })
  }

  const register = async (name: string, email: string, password: string) => {
    // 模拟注册API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        user.value = {
          id: '1',
          name: name,
          email: email
        }
        token.value = 'mock-token'
        resolve(true)
      }, 1000)
    })
  }

  const logout = () => {
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    login,
    register,
    logout
  }
})