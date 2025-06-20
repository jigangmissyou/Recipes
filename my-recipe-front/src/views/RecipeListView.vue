<template>
    <div>
      <!-- Top Navigation Bar -->
      <nav class="navbar">
        <div class="nav-left">
          <button class="btn-icon" @click="showCategoryMenu = true">
            <i class="fas fa-th-large"></i>
          </button>
        </div>
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search recipes..."
            @keyup.enter="handleSearch"
          >
        </div>
        <div class="nav-right">
          <button class="btn-icon" @click="showNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="hasNewNotifications" class="notification-badge"></span>
          </button>
        </div>
      </nav>
  
      <!-- Category Menu -->
      <CategoryMenu 
        :show="showCategoryMenu"
        @close="showCategoryMenu = false"
        @select="handleCategorySelect"
      />
  
      <!-- Content Area -->
      <div class="content-wrapper">
        <div class="container">
          <div class="row" id="recipeList">
            <div
              class="col-md-6 col-lg-4 mb-4"
              v-for="recipe in recipes"
              :key="recipe.id"
            >
              <div class="card recipe-card" @click="goToDetail(recipe.id)">
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
                      {{ recipe.category.name }}
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
                  <div class="d-flex justify-content-end align-items-center">
                    <small class="text-muted">
                      <i class="fas fa-user"></i> {{ recipe.user.nickname }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!loading && recipes.length === 0" class="text-center text-muted py-5">
              No recipes available
            </div>
          </div>
          
          <!-- Loading Animation -->
          <div v-if="loading" class="loading-animation">
            <i class="fas fa-spinner fa-spin vegetable-icon"></i>
            <p>Loading...</p>
          </div>
          <div v-if="hasMore && !loading" class="text-center py-4">
            <button class="btn btn-outline-primary" @click="loadMore">
              Load More
            </button>
          </div>
        </div>
      </div>
  
      <!-- Bottom Navigation Bar -->
      <nav class="bottom-nav">
        <router-link to="/" class="nav-item active">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/my-recipes" class="nav-item">
          <i class="fas fa-book"></i>
          <span>My Recipes</span>
        </router-link>
        <router-link to="/add-recipe" class="nav-item">
          <i class="fas fa-plus-circle"></i>
          <span>Add</span>
        </router-link>
        <router-link to="/liked-recipes" class="nav-item">
          <i class="fas fa-heart"></i>
          <span>Liked</span>
        </router-link>
        <router-link to="/profile" class="nav-item">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </router-link>
      </nav>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import CategoryMenu from '../components/CategoryMenu.vue'
  import { recipeService } from '@/services/recipe'
  import type { Recipe } from '@/services/recipe'
  
  const router = useRouter()
  const route = useRoute()
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const showCategoryMenu = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref<number | null>(null)
  const selectedTag = ref<number | null>(null)
  const hasNewNotifications = ref(false)
  
  // 定义分类数据
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
  
  // 获取分类图标
  const getCategoryIcon = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.icon : 'fas fa-th-large'
  }
  
  // 获取菜谱列表
  const fetchRecipes = async (page: number = 1) => {
    try {
      loading.value = true
      const params = {
        page,
        category_id: selectedCategory.value,
        tag_id: selectedTag.value,
        search: searchQuery.value
      }
      const response = await recipeService.getRecipes(params)
      if (page === 1) {
        recipes.value = response.data
      } else {
        recipes.value = [...recipes.value, ...response.data]
      }
      hasMore.value = response.current_page < response.last_page
      currentPage.value = response.current_page
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
      alert('Failed to fetch recipe list, please try again')
    } finally {
      loading.value = false
    }
  }
  
  // Load more recipes
  const loadMore = () => {
    if (!loading.value && hasMore.value) {
      fetchRecipes(currentPage.value + 1)
    }
  }
  
  // Go to recipe detail page
  const goToDetail = (id: number) => {
    router.push(`/recipe/${id}`)
  }
  
  // Handle search
  const handleSearch = () => {
    currentPage.value = 1
    selectedCategory.value = null
    selectedTag.value = null
    fetchRecipes(1)
  }
  
  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    selectedCategory.value = categoryId
    selectedTag.value = null
    currentPage.value = 1
    fetchRecipes(1)
  }
  
  // Show notifications
  const showNotifications = () => {
    // TODO: Implement notification functionality
    console.log('Show notifications')
  }
  
  // Get category name
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'All Categories'
  }
  
  // 计算总时间
  const getTotalTime = (recipe: Recipe) => {
    const prepTime = parseInt(recipe.prep_time) || 0
    const cookTime = parseInt(recipe.cook_time) || 0
    return prepTime + cookTime
  }
  
  // 添加路由监听
  onMounted(() => {
    if (route.query.category_id) {
      selectedCategory.value = Number(route.query.category_id)
    }
    if (route.query.tag_id) {
      selectedTag.value = Number(route.query.tag_id)
    }
    fetchRecipes()
  })
  </script>
  
  <style scoped>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
  }
  
  .nav-left, .nav-right {
    width: 40px;
  }
  
  .search-bar {
    flex: 1;
    margin: 0 16px;
    position: relative;
  }
  
  .search-bar input {
    width: 100%;
    padding: 8px 32px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
  }
  
  .search-bar i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  .btn-icon {
    background: none;
    border: none;
    padding: 8px;
    color: #333;
    cursor: pointer;
  }
  
  .notification-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #ff5252;
    border-radius: 50%;
  }
  
  .content-wrapper {
    padding-top: 76px;
    padding-bottom: 60px;
  }
  
  .recipe-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
  }
  
  .recipe-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .recipe-image {
    height: 200px;
    object-fit: cover;
  }
  
  .recipe-meta {
    margin-bottom: 10px;
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
  
  .btn-like i {
    color: #666;
    font-size: 16px;
  }
  
  .btn-like:hover i {
    color: #ff5252;
  }
  
  .text-muted {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .text-muted i {
    color: #ff5252;
    font-size: 14px;
  }
  
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
  }
  
  .nav-item {
    color: #666;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
  }
  
  .nav-item i {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .nav-item.active {
    color: #ff5252;
  }
  
  .loading-animation {
    text-align: center;
    padding: 20px;
  }
  
  .vegetable-bounce {
    animation: bounce 1s infinite;
  }
  
  .vegetable-icon {
    font-size: 24px;
    color: #ff5252;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  </style>