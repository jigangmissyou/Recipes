<template>
  <div class="liked-recipes">
    <!-- 导航栏 -->
    <nav class="navbar">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>Liked Recipes</h1>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading recipes...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">An error occurred while loading recipes.</p>
      <button class="btn btn-primary" @click="goBack">Go Back</button>
    </div>

    <!-- 内容区域 -->
    <div v-else class="recipes-content">
      <!-- 空状态 -->
      <div v-if="!recipes.length" class="empty-state">
        <img src="https://picsum.photos/200/200" alt="No recipes" class="empty-image">
        <h3>No Liked Recipes</h3>
        <p>Start exploring and liking recipes!</p>
        <button class="btn btn-primary" @click="goToExplore">
          Explore Recipes
        </button>
      </div>

      <!-- 食谱列表 -->
      <div v-else class="recipes-grid">
        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card" @click="goToDetail(recipe.id)">
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.title">
          </div>
          <div class="recipe-info">
            <h3>{{ recipe.title }}</h3>
            <div class="recipe-meta">
              <span><i class="fas fa-heart"></i> {{ recipe.likes }}</span>
              <span><i class="fas fa-comment"></i> {{ recipe.comments }}</span>
            </div>
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
const recipes = ref([])
const loading = ref(true)
const error = ref(false)

const fetchLikedRecipes = async () => {
  loading.value = true
  error.value = false
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    recipes.value = [
      {
        id: 11,
        title: "Strawberry Cheesecake",
        image: "https://picsum.photos/400/300?random=11",
        likes: 201,
        comments: 44
      },
      {
        id: 12,
        title: "Spicy Ramen",
        image: "https://picsum.photos/400/300?random=12",
        likes: 178,
        comments: 29
      }
    ]
  } catch (err) {
    error.value = true
    console.error('Error fetching liked recipes:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}

const goToExplore = () => {
  router.push('/')
}

onMounted(() => {
  fetchLikedRecipes()
})
</script>

<style scoped>
.liked-recipes {
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
.recipes-content {
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
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.recipe-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}
.recipe-card:hover {
  transform: translateY(-5px);
}
.recipe-image {
  position: relative;
  height: 200px;
}
.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.recipe-info {
  padding: 15px;
}
.recipe-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}
.recipe-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
}
.recipe-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
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
