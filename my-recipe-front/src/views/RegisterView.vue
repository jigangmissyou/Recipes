<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Logo和欢迎文字 -->
      <div class="welcome-section">
        <!-- 使用内联SVG作为logo -->
        <div class="logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="40" fill="#FF5252"/>
            <path d="M40 20C28.954 20 20 28.954 20 40C20 51.046 28.954 60 40 60C51.046 60 60 51.046 60 40C60 28.954 51.046 20 40 20ZM40 56C31.163 56 24 48.837 24 40C24 31.163 31.163 24 40 24C48.837 24 56 31.163 56 40C56 48.837 48.837 56 40 56Z" fill="white"/>
            <path d="M40 28C33.373 28 28 33.373 28 40C28 46.627 33.373 52 40 52C46.627 52 52 46.627 52 40C52 33.373 46.627 28 40 28ZM40 48C35.582 48 32 44.418 32 40C32 35.582 35.582 32 40 32C44.418 32 48 35.582 48 40C48 44.418 44.418 48 40 48Z" fill="white"/>
            <circle cx="40" cy="40" r="4" fill="white"/>
          </svg>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Join our community of food lovers</p>
      </div>

      <!-- 注册表单 -->
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="username"
              class="form-control"
              placeholder="Username"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input
              type="email"
              v-model="email"
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

        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              class="form-control"
              placeholder="Confirm Password"
              required
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="agreeTerms" required>
            <span>I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a></span>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="!loading">Create Account</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <div class="divider">
          <span>or sign up with</span>
        </div>

        <div class="social-login">
          <div id="g_id_onload"
               data-client_id="YOUR_GOOGLE_CLIENT_ID"
               data-callback="handleGoogleCredential">
          </div>
          <div class="g_id_signin"
               data-type="standard"
               data-size="large"
               data-theme="outline"
               data-text="sign_up_with"
               data-shape="rectangular"
               data-logo_alignment="left"
               data-width="100%">
          </div>
        </div>
      </form>

      <p class="signup-prompt">
        Already have an account? 
        <router-link to="/login" class="signup-link">Sign In</router-link>
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

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  try {
    loading.value = true
    await authStore.register({
      nickname: username.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    })
    router.push('/recipes')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessage = Object.values(errors).flat().join('\n')
      alert(errorMessage)
    } else {
      alert('Registration failed')
    }
  } finally {
    loading.value = false
  }
}

// 使用相同的全局回调函数
window.handleGoogleCredential = async (response: { credential: string }) => {
  try {
    loading.value = true
    await authStore.googleLogin(response.credential)
    router.push('/recipes')
  } catch (error: any) {
    console.error('Google login failed:', error)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Google登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  delete window.handleGoogleCredential
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
}

.register-container {
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

.register-form {
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

.remember-me a {
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
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-social {
  background: white;
  border: 2px solid #e0e0e0;
  color: #333;
  font-weight: 500;
}

.btn-social:hover {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.social-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
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

/* 响应式调整 */
@media (max-width: 480px) {
  .register-container {
    padding: 32px 24px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .social-login {
    grid-template-columns: 1fr;
  }
}

/* 自定义 Google 登录按钮样式 */
:deep(.g_id_signin) {
  width: 100% !important;
}

:deep(.g_id_signin > div) {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}

:deep(.g_id_signin iframe) {
  width: 100% !important;
  height: 40px !important;
}
</style>
