<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo和欢迎文字 -->
      <div class="welcome-section">
        <div class="logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="40" fill="#FF5252"/>
            <path d="M40 20C28.954 20 20 28.954 20 40C20 51.046 28.954 60 40 60C51.046 60 60 51.046 60 40C60 28.954 51.046 20 40 20ZM40 56C31.163 56 24 48.837 24 40C24 31.163 31.163 24 40 24C48.837 24 56 31.163 56 40C56 48.837 48.837 56 40 56Z" fill="white"/>
            <path d="M40 28C33.373 28 28 33.373 28 40C28 46.627 33.373 52 40 52C46.627 52 52 46.627 52 40C52 33.373 46.627 28 40 28ZM40 48C35.582 48 32 44.418 32 40C32 35.582 35.582 32 40 32C44.418 32 48 35.582 48 40C48 44.418 44.418 48 40 48Z" fill="white"/>
            <circle cx="40" cy="40" r="4" fill="white"/>
          </svg>
        </div>
        <h1>Welcome Back!</h1>
        <p class="subtitle">Sign in to continue your culinary journey</p>
      </div>

      <!-- 登录表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="login"
              class="form-control"
              placeholder="Email"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="form-control"
              placeholder="Password"
              required
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="!loading">Sign In</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <div class="divider">
          <span>or continue with</span>
        </div>

        <div class="social-login">
          <button 
            type="button" 
            class="btn btn-social google"
            @click="handleGoogleLogin"
            :disabled="loading"
          >
            <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </form>

      <p class="signup-prompt">
        Don't have an account? 
        <router-link to="/register" class="signup-link">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const login = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    if (!login.value || !password.value) {
      alert('Please type in email and password')
      return
    }
    
    await authStore.login(login.value, password.value)
    // 登录成功后跳转到上次访问的页面
    router.push(authStore.lastVisitedPath)
  } catch (error: any) {
    console.error('Login error details:', error.response?.data)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else if (error.response?.status === 401) {
      alert('Your credentials are wrong')
    } else {
      alert('Ops, something is wrtong!! Please try again later')
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    // 加载 Google Sign-In 库
    await loadGoogleScript()
    
    // 使用 Google Sign-In
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '965296199534-ha1n65gf4444n7lc6navtubh211ahhf5.apps.googleusercontent.com',
      scope: 'email profile',
      callback: async (response: any) => {
        if (response.access_token) {
          try {
            // // 获取用户信息
            // const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            //   headers: { Authorization: `Bearer ${response.access_token}` }
            // }).then(res => res.json())
            
            // 发送到后端，使用相对路径
            await authStore.googleLogin(response.access_token)
            router.push('/recipes')
          } catch (error) {
            console.error('Failed to get user info:', error)
            alert('Google登录失败，请重试')
          }
        }
      }
    })
    
    client.requestAccessToken()
  } catch (error) {
    console.error('Google login failed:', error)
    alert('Google登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 动态加载 Google Sign-In 脚本
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-section h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 8px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 16px;
  color: #666;
  font-size: 18px;
}

.form-control {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-control:focus {
  border-color: #ff5252;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 82, 82, 0.1);
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
}

.forgot-password {
  color: #ff5252;
  text-decoration: none;
  font-weight: 500;
}

.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #ff5252;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #ff3333;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 82, 82, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 16px;
}

.social-login {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.btn-social {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  color: #333;
}

.btn-social.google {
  border-color: #e0e0e0;
}

.btn-social.google:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #d0d0d0;
  transform: translateY(-1px);
}

.btn-social:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .social-login {
    grid-template-columns: 1fr;
  }
}

.signup-prompt {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.signup-link {
  color: #ff5252;
  text-decoration: none;
  font-weight: 500;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
