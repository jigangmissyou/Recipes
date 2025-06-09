<template>
  <div class="profile-page">
    <nav class="navbar">
      <h1>Profile</h1>
      <button class="btn-edit" @click="editProfile">
        <i class="fas fa-edit"></i>
      </button>
    </nav>
    <div class="profile-card">
      <img :src="user.avatar" alt="avatar" class="avatar">
      <div class="user-info">
        <h2>{{ user.nickname }}</h2>
        <p class="user-id">ID: {{ user.id }}</p>
        <p class="user-bio">{{ user.bio }}</p>
      </div>
    </div>
    <div class="profile-menu">
      <div class="menu-item" @click="goToMyRecipes">
        <i class="fas fa-book"></i>
        <span>My Recipes</span>
        <i class="fas fa-chevron-right right-arrow"></i>
      </div>
      <div class="menu-item" @click="goToLiked">
        <i class="fas fa-heart"></i>
        <span>Liked Recipes</span>
        <i class="fas fa-chevron-right right-arrow"></i>
      </div>
      <div class="menu-item" @click="goToComments">
        <i class="fas fa-comment"></i>
        <span>My Comments</span>
        <i class="fas fa-chevron-right right-arrow"></i>
      </div>
      <div class="menu-item" @click="goToHome">
        <i class="fas fa-home"></i>
        <span>Home</span>
        <i class="fas fa-chevron-right right-arrow"></i>
      </div>
      <div class="menu-item" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { profileService } from '@/services/profile'
import type { Profile } from '@/services/profile'

const router = useRouter()
const authStore = useAuthStore()

const user = ref<Profile>({
  id: 0,
  nickname: '',
  avatar: '',
  bio: '',
  recipes: 0,
  likes: 0,
  comments: 0
})

const loading = ref(true)
const error = ref(null)

const fetchProfile = async () => {
  try {
    loading.value = true
    const profile = await profileService.getProfile()
    user.value = profile
  } catch (err) {
    console.error('Failed to fetch profile:', err)
    error.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const editProfile = () => {
  router.push(`/edit-profile/${user.value.id}`)
}

const goToMyRecipes = () => {
  router.push('/my-recipes')
}

const goToLiked = () => {
  router.push('/liked-recipes')
}

const goToComments = () => {
  router.push('/my-comments')
}

const goToHome = () => {
  router.push('/recipes')
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    alert('Logout failed, please try again')
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 40px;
}
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}
.navbar h1 {
  font-size: 20px;
  color: #333;
  margin: 0;
}
.btn-edit {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 20px;
  cursor: pointer;
}
.profile-card {
  background: #fff;
  margin: 20px 16px 0 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  padding: 24px 20px;
  gap: 20px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.user-info h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  color: #333;
}
.user-id {
  color: #aaa;
  font-size: 13px;
  margin-bottom: 6px;
}
.user-bio {
  color: #666;
  font-size: 14px;
  margin: 0;
}
.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 18px 0 0 0;
  padding: 0 16px;
}
.stat-item {
  background: #fff;
  border-radius: 12px;
  flex: 1;
  margin: 0 6px;
  text-align: center;
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.stat-value {
  font-size: 20px;
  color: #ff5252;
  font-weight: bold;
}
.stat-label {
  color: #888;
  font-size: 13px;
  margin-top: 4px;
}
.profile-menu {
  margin: 24px 0 0 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 0 0 8px 0;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item i {
  margin-right: 16px;
  font-size: 18px;
}
.menu-item .right-arrow {
  margin-left: auto;
  color: #bbb;
  font-size: 16px;
}
.menu-item:hover {
  background: #f8f9fa;
}
</style>
