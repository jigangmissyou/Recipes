<template>
  <div class="recipes-page">
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h5 class="mb-0 flex-grow-1 text-center" style="flex:1;">I liked recipes</h5>
        <div class="nav-actions">
          <span style="width:32px;display:inline-block;"></span>
        </div>
      </div>
    </nav>

    <div class="content-wrapper">
      <div class="container">
        <div class="recipe-list">
          <div v-if="loading" class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div v-else-if="recipes.length === 0" class="empty-state">
            <i class="fas fa-heart"></i>
            <p>You haven't liked any recipes yet</p>
            <button class="btn-primary" @click="goToHome">Discover more recipes</button>
          </div>
          <div v-else class="recipe-grid">
            <div 
              v-for="recipe in recipes" 
              :key="recipe.id" 
              class="card recipe-card"
              @click="goToDetail(recipe.id)"
            >
              <img
                :src="recipe.cover_image"
                class="card-img-top recipe-image"
                :alt="recipe.name"
              />
              <div class="card-body">
                <h5 class="card-title">{{ recipe.name }}</h5>
                <div class="recipe-meta">
                  <span class="category-badge">
                    <i :class="getCategoryIcon(recipe.category_id)"></i>
                    {{ recipe.category?.name }}
                  </span>
                </div>
                <div class="recipe-stats">
                  <div class="stat-item">
                    <i class="fas fa-clock"></i>
                    <span>Total: {{ getTotalTime(recipe) }} mins</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-signal"></i>
                    <span>{{ recipe.difficulty }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>{{ recipe.favorites_count || 0 }}</span>
                  </div>
                </div>
                <div class="recipe-tags mb-2">
                  <span v-for="tag in recipe.tags" :key="tag.id" class="tag-item">
                    {{ tag.name }}
                  </span>
                </div>
              </div>
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
import api from '@/services/api'

const router = useRouter()
const recipes = ref([])
const loading = ref(false)

const categories = [
  { id: 1, name: 'Main Courses', icon: 'fas fa-utensils' },
  { id: 2, name: 'Desserts', icon: 'fas fa-ice-cream' },
  { id: 3, name: 'Breakfast', icon: 'fas fa-coffee' },
  { id: 4, name: 'Appetizers', icon: 'fas fa-cheese' },
  { id: 5, name: 'Side Dishes', icon: 'fas fa-carrot' },
  { id: 6, name: 'Salads', icon: 'fas fa-leaf' },
  { id: 7, name: 'Soups', icon: 'fas fa-mug-hot' },
  { id: 8, name: 'Baking', icon: 'fas fa-bread-slice' },
  { id: 9, name: 'Drinks', icon: 'fas fa-glass-martini-alt' },
  { id: 10, name: 'Sauces & Dips', icon: 'fas fa-mortar-pestle' }
]

const getCategoryIcon = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category ? category.icon : 'fas fa-th-large'
}

const getTotalTime = (recipe) => {
  const prepTime = parseInt(recipe.prep_time) || 0
  const cookTime = parseInt(recipe.cook_time) || 0
  return prepTime + cookTime
}

const fetchLikedRecipes = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/recipes/favorites')
    recipes.value = data.data
  } catch (e) {
    recipes.value = []
  } finally {
    loading.value = false
  }
}

const goToHome = () => router.push('/recipes')
const goToDetail = (id) => router.push(`/recipe/${id}`)
const goBack = () => router.back()

onMounted(fetchLikedRecipes)
</script>

<style scoped>
.recipes-page {
  min-height: 100vh;
  background: #f8f9fa;
}
.navbar.top-nav {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: 56px;
  display: flex;
  align-items: center;
  z-index: 100;
}
.btn-nav {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 6px 10px;
  cursor: pointer;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.content-wrapper {
  padding-top: 64px;
}
.recipe-list {
  padding: 0 16px 16px;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 2rem;
  color: #ff5252;
}
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}
.recipe-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}
.recipe-card:hover {
  transform: translateY(-5px);
}
.recipe-image {
  height: 200px;
  object-fit: cover;
}
.card-body {
  padding: 15px;
}
.card-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #333;
}
.recipe-meta {
  margin-bottom: 10px;
}
.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}
.category-badge i {
  margin-right: 4px;
  color: #ff5252;
}
.recipe-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}
.stat-item i {
  color: #ff5252;
}
.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-item {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #fff5f5;
  color: #ff5252;
  border: 1px solid #ff5252;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}
.empty-state i {
  font-size: 3rem;
  color: #ff5252;
  margin-bottom: 20px;
}
.empty-state p {
  margin-bottom: 20px;
}
.btn-primary {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background-color: #ff3232;
}
</style>
