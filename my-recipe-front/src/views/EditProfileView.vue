<template>
    <div class="edit-profile-page">
      <!-- 顶部栏 -->
      <nav class="navbar">
        <button class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1>Edit Profile</h1>
      </nav>
  
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
  
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button class="btn btn-primary" @click="goBack">Go Back</button>
      </div>
  
      <!-- 编辑表单 -->
      <div v-else class="edit-profile-form">
        <div class="avatar-section">
          <div class="avatar-upload" @click="triggerAvatarUpload">
            <img :src="avatarPreview || user.avatar" alt="avatar" class="avatar">
            <div class="avatar-edit-mask">
              <i class="fas fa-camera"></i>
              <span>Change Photo</span>
            </div>
            <input
              type="file"
              ref="avatarInput"
              accept="image/*"
              @change="handleAvatarChange"
              style="display: none"
            >
          </div>
          <p class="avatar-tip">Tap to change profile photo</p>
        </div>
  
        <div class="form-section">
          <div class="form-group">
            <label>Nickname</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input
                type="text"
                v-model="user.nickname"
                class="form-control"
                maxlength="20"
                placeholder="Enter your nickname"
              >
            </div>
            <span class="char-count">{{ user.nickname?.length || 0 }}/20</span>
          </div>
  
          <div class="form-group">
            <label>Bio</label>
            <div class="input-wrapper">
              <i class="fas fa-pen"></i>
              <textarea
                v-model="user.bio"
                class="form-control"
                maxlength="60"
                rows="3"
                placeholder="Say something about yourself"
              ></textarea>
            </div>
            <span class="char-count">{{ user.bio?.length || 0 }}/60</span>
          </div>
        </div>
  
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveProfile">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { profileService } from '@/services/profile'
  import type { Profile, UpdateProfileData } from '@/services/profile'
  
  const router = useRouter()
  const route = useRoute()
  const avatarInput = ref(null)
  const avatarPreview = ref('')
  const loading = ref(true)
  const error = ref(null)
  const saving = ref(false)
  
  // 用户数据
  const user = ref<Profile>({
    id: 0,
    nickname: '',
    avatar: '',
    bio: '',
    recipes: 0,
    likes: 0,
    comments: 0
  })
  
  // 获取用户数据
  const fetchUserProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const profile = await profileService.getProfile()
      user.value = profile
    } catch (err) {
      error.value = 'Failed to load profile'
      console.error('Error fetching profile:', err)
    } finally {
      loading.value = false
    }
  }
  
  const goBack = () => {
    router.back()
  }
  
  const triggerAvatarUpload = () => {
    avatarInput.value && avatarInput.value.click()
  }
  
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        loading.value = true
        const result = await profileService.uploadAvatar(file)
        avatarPreview.value = result.avatar
        user.value.avatar = result.avatar
      } catch (err) {
        error.value = 'Failed to upload avatar'
        console.error('Error uploading avatar:', err)
      } finally {
        loading.value = false
      }
    }
  }
  
  const saveProfile = async () => {
    try {
      saving.value = true
      const updateData: UpdateProfileData = {
        nickname: user.value.nickname,
        bio: user.value.bio
      }
      
      if (avatarPreview.value) {
        updateData.avatar = avatarPreview.value
      }
      
      await profileService.updateProfile(updateData)
      router.push('/profile')
    } catch (err) {
      error.value = 'Failed to save profile'
      console.error('Error saving profile:', err)
    } finally {
      saving.value = false
    }
  }
  
  onMounted(() => {
    fetchUserProfile()
  })
  </script>
  
  <style scoped>
  .edit-profile-page {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 40px;
  }
  
  .navbar {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #fff;
    padding: 15px 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .btn-back {
    background: none;
    border: none;
    color: #333;
    font-size: 20px;
    padding: 5px;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .btn-back:hover {
    color: #ff5252;
  }
  
  .navbar h1 {
    font-size: 20px;
    color: #333;
    margin: 0;
    font-weight: 600;
  }
  
  .edit-profile-form {
    max-width: 500px;
    margin: 24px auto;
    padding: 0 20px;
  }
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }
  
  .avatar-upload {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 12px;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  
  .avatar-upload:hover {
    transform: scale(1.02);
  }
  
  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 4px solid #fff;
  }
  
  .avatar-edit-mask {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .avatar-upload:hover .avatar-edit-mask {
    opacity: 1;
  }
  
  .avatar-edit-mask i {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .avatar-tip {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
  
  .form-section {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  
  .form-group {
    margin-bottom: 24px;
  }
  
  .form-group:last-child {
    margin-bottom: 0;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
    font-size: 15px;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .input-wrapper i {
    position: absolute;
    left: 12px;
    color: #666;
    font-size: 16px;
  }
  
  .form-control {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 15px;
    background: #f8f9fa;
    transition: all 0.3s ease;
  }
  
  .form-control:focus {
    border-color: #ff5252;
    background: #fff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255,82,82,0.1);
  }
  
  textarea.form-control {
    min-height: 100px;
    resize: vertical;
  }
  
  .char-count {
    display: block;
    text-align: right;
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .form-actions {
    margin-top: 32px;
    text-align: center;
  }
  
  .btn {
    padding: 12px 32px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .btn-primary {
    background: #ff5252;
    color: white;
    box-shadow: 0 4px 12px rgba(255,82,82,0.2);
  }
  
  .btn-primary:hover {
    background: #ff3333;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255,82,82,0.3);
  }
  
  .btn-primary:active {
    transform: translateY(0);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 20px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff5252;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 20px;
    text-align: center;
  }
  
  .error-text {
    color: #ff5252;
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  /* 响应式调整 */
  @media (max-width: 480px) {
    .edit-profile-form {
      margin: 16px auto;
    }
    
    .form-section {
      padding: 20px;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>