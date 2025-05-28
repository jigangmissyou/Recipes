<template>
  <div class="my-comments">
    <!-- 导航栏 -->
    <nav class="navbar">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>My Comments</h1>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading comments...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">An error occurred while loading comments.</p>
      <button class="btn btn-primary" @click="goBack">Go Back</button>
    </div>

    <!-- 内容区域 -->
    <div v-else class="comments-content">
      <!-- 空状态 -->
      <div v-if="!comments.length" class="empty-state">
        <img src="https://picsum.photos/200/200" alt="No comments" class="empty-image">
        <h3>No Comments Yet</h3>
        <p>Start commenting on recipes!</p>
        <button class="btn btn-primary" @click="goToExplore">
          Explore Recipes
        </button>
      </div>

      <!-- 评论列表 -->
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <img :src="comment.recipeImage" alt="Recipe" class="comment-recipe-img">
            <div>
              <div class="comment-recipe-title">{{ comment.recipeTitle }}</div>
              <div class="comment-time">{{ comment.time }}</div>
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const comments = ref([])
const loading = ref(true)
const error = ref(false)

const fetchMyComments = async () => {
  loading.value = true
  error.value = false
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    comments.value = [
      {
        id: 1,
        recipeTitle: "Classic Chocolate Cake",
        recipeImage: "https://picsum.photos/100/100?random=1",
        content: "This cake is so delicious! Highly recommend.",
        time: "2 days ago"
      },
      {
        id: 2,
        recipeTitle: "Spicy Ramen",
        recipeImage: "https://picsum.photos/100/100?random=2",
        content: "Love the flavor and the spice level.",
        time: "1 week ago"
      }
    ]
  } catch (err) {
    error.value = true
    console.error('Error fetching comments:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToExplore = () => {
  router.push('/')
}

onMounted(() => {
  fetchMyComments()
})
</script>

<style scoped>
.my-comments {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px;
}
.navbar {
  background: white;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.btn-back {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.navbar h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}
.comments-content {
  padding: 20px;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
}
.empty-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 20px;
}
.empty-state h3 {
  margin: 0 0 10px;
  color: #333;
}
.empty-state p {
  color: #666;
  margin-bottom: 20px;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.comment-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}
.comment-recipe-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}
.comment-recipe-title {
  font-weight: 500;
  color: #333;
  font-size: 15px;
}
.comment-time {
  color: #aaa;
  font-size: 13px;
}
.comment-content {
  color: #444;
  font-size: 15px;
  line-height: 1.6;
}
.btn-primary {
  background: #ff5252;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.btn-primary:hover {
  background: #ff3333;
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
}
</style>
