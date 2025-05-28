<template>
    <div>
      <!-- 顶部导航栏 -->
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
            @input="handleSearch"
          >
        </div>
        <div class="nav-right">
          <button class="btn-icon" @click="showNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="hasNewNotifications" class="notification-badge"></span>
          </button>
        </div>
      </nav>
  
      <!-- 分类菜单 -->
      <CategoryMenu 
        :show="showCategoryMenu"
        @close="showCategoryMenu = false"
        @select="handleCategorySelect"
      />
  
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <div class="container">
          <div class="row" id="recipeList">
            <div
              class="col-md-6 col-lg-4 mb-4"
              v-for="recipe in displayedRecipes"
              :key="recipe.id"
            >
              <div class="card recipe-card" @click="goToDetail(recipe.id)">
                <img
                  :src="recipe.image"
                  class="card-img-top recipe-image"
                  :alt="recipe.title"
                />
                <div class="card-body">
                  <h5 class="card-title">{{ recipe.title }}</h5>
                  <p class="card-text text-muted">
                    <i class="fas fa-clock"></i> {{ recipe.cookingTime }} mins
                    <i class="fas fa-fire ms-3"></i> {{ recipe.calories }} cal
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="btn-group">
                      <button class="btn btn-sm btn-like" @click.stop="toggleLike(recipe)">
                        <i class="fas fa-heart"></i> {{ recipe.likes }}
                      </button>
                      <button class="btn btn-sm btn-like" @click.stop="showComments(recipe)">
                        <i class="fas fa-comment"></i> {{ recipe.comments }}
                      </button>
                    </div>
                    <small class="text-muted">By {{ recipe.author }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="displayedRecipes.length === 0" class="text-center text-muted py-5">
              暂无菜谱
            </div>
          </div>
          
          <!-- 加载动画 -->
          <div v-if="isLoading" class="loading-animation">
            <div class="vegetable-bounce">
              <i :class="currentVegetableIcon" class="vegetable-icon"></i>
            </div>
            <p class="loading-text">加载更多菜谱...</p>
          </div>
          <div v-else-if="!hasMore" class="text-center py-4 text-muted">
            没有更多菜谱了
          </div>
        </div>
      </div>
  
      <!-- 底部导航栏 -->
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
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import CategoryMenu from '../components/CategoryMenu.vue'
  
  const router = useRouter()
  
  // 严格按照原型的模拟数据
  const recipes = ref([
    {
      id: 1,
      title: 'Fresh Summer Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      cookingTime: 15,
      calories: 320,
      likes: 245,
      comments: 32,
      author: 'Chef John',
      category: 'Vegetarian'
    },
    {
      id: 2,
      title: 'Hearty Vegetable Soup',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      cookingTime: 45,
      calories: 280,
      likes: 189,
      comments: 24,
      author: 'Chef Sarah',
      category: 'Vegetarian'
    },
    {
      id: 3,
      title: 'Creamy Mushroom Pasta',
      image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327',
      cookingTime: 30,
      calories: 450,
      likes: 312,
      comments: 45,
      author: 'Chef Mike',
      category: 'Vegetarian'
    },
    {
      id: 4,
      title: 'Grilled Salmon',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
      cookingTime: 25,
      calories: 380,
      likes: 178,
      comments: 29,
      author: 'Chef Lisa',
      category: 'Seafood'
    },
    {
      id: 5,
      title: 'Beef Steak',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      cookingTime: 40,
      calories: 550,
      likes: 423,
      comments: 56,
      author: 'Chef Tom',
      category: 'Meat'
    },
    {
      id: 6,
      title: 'Chocolate Cake',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
      cookingTime: 60,
      calories: 420,
      likes: 289,
      comments: 38,
      author: 'Chef Emma',
      category: 'Desserts'
    },
    {
      id: 7,
      title: 'Fresh Fruit Smoothie',
      image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
      cookingTime: 10,
      calories: 180,
      likes: 156,
      comments: 19,
      author: 'Chef Anna',
      category: 'Beverages'
    },
    {
      id: 8,
      title: 'Chicken Curry',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
      cookingTime: 35,
      calories: 480,
      likes: 267,
      comments: 42,
      author: 'Chef Raj',
      category: 'Meat'
    },
    {
      id: 9,
      title: 'Vegetable Stir Fry',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      cookingTime: 20,
      calories: 250,
      likes: 198,
      comments: 27,
      author: 'Chef Ming',
      category: 'Vegetarian'
    }
  ])
  
  const categories = ref([
    { id: 1, name: 'All Recipes', icon: 'fas fa-utensils' },
    { id: 2, name: 'Meat', icon: 'fas fa-drumstick-bite' },
    { id: 3, name: 'Vegetarian', icon: 'fas fa-seedling' },
    { id: 4, name: 'Seafood', icon: 'fas fa-fish' },
    { id: 5, name: 'Desserts', icon: 'fas fa-birthday-cake' },
    { id: 6, name: 'Beverages', icon: 'fas fa-glass-martini-alt' }
  ])
  
  const notifications = ref(3)
  const isCategoryDropdownVisible = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref('All Recipes')
  const hasNewNotifications = ref(true)
  const showCategoryMenu = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
  const toggleCategoryDropdown = () => {
    isCategoryDropdownVisible.value = !isCategoryDropdownVisible.value
  }
  
  const selectCategory = (category: any) => {
    selectedCategory.value = category.name
    isCategoryDropdownVisible.value = false
  }
  
  const filteredRecipes = computed(() => {
    if (!selectedCategory.value) {
      return recipes.value
    }
    return recipes.value.filter(r => r.category === selectedCategory.value)
  })
  
  // 添加导航点击处理函数
  const handleNavClick = (type: string) => {
    switch(type) {
      case 'home':
        // 处理首页点击
        break;
      case 'publish':
        // 处理发布点击
        break;
      case 'profile':
        // 处理我的点击
        break;
    }
  }
  
  // 所有菜谱数据（请根据需要扩充更多条目）
  const allRecipes = ref([
    {
      id: 1,
      title: 'Fresh Summer Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      cookingTime: 15,
      calories: 320,
      likes: 245,
      comments: 32,
      author: 'Chef John',
      category: 'Vegetarian'
    },
    {
      id: 2,
      title: 'Hearty Vegetable Soup',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      cookingTime: 45,
      calories: 280,
      likes: 189,
      comments: 24,
      author: 'Chef Sarah',
      category: 'Vegetarian'
    },
    {
      id: 3,
      title: 'Creamy Mushroom Pasta',
      image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327',
      cookingTime: 30,
      calories: 450,
      likes: 312,
      comments: 45,
      author: 'Chef Mike',
      category: 'Vegetarian'
    },
    {
      id: 4,
      title: 'Grilled Salmon',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
      cookingTime: 25,
      calories: 380,
      likes: 178,
      comments: 29,
      author: 'Chef Lisa',
      category: 'Seafood'
    },
    {
      id: 5,
      title: 'Beef Steak',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      cookingTime: 40,
      calories: 550,
      likes: 423,
      comments: 56,
      author: 'Chef Tom',
      category: 'Meat'
    },
    {
      id: 6,
      title: 'Chocolate Cake',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
      cookingTime: 60,
      calories: 420,
      likes: 289,
      comments: 38,
      author: 'Chef Emma',
      category: 'Desserts'
    },
    {
      id: 7,
      title: 'Fresh Fruit Smoothie',
      image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
      cookingTime: 10,
      calories: 180,
      likes: 156,
      comments: 19,
      author: 'Chef Anna',
      category: 'Beverages'
    },
    {
      id: 8,
      title: 'Chicken Curry',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
      cookingTime: 35,
      calories: 480,
      likes: 267,
      comments: 42,
      author: 'Chef Raj',
      category: 'Meat'
    },
    {
      id: 9,
      title: 'Vegetable Stir Fry',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      cookingTime: 20,
      calories: 250,
      likes: 198,
      comments: 27,
      author: 'Chef Ming',
      category: 'Vegetarian'
    },
    {
      id: 10,
      title: 'Mediterranean Pasta',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
      cookingTime: 25,
      calories: 420,
      likes: 167,
      comments: 23,
      author: 'Chef Maria',
      category: 'Vegetarian'
    },
    {
      id: 11,
      title: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      cookingTime: 20,
      calories: 350,
      likes: 198,
      comments: 31,
      author: 'Chef David',
      category: 'Meat'
    }
  ])
  
  // 分页相关
  const pageSize = 10
  const currentPage = ref(1)
  const isLoading = ref(false)
  const hasMore = ref(true)
  
  const displayedRecipes = ref([])
  
  const loadRecipes = () => {
    const total = currentPage.value * pageSize
    displayedRecipes.value = allRecipes.value.slice(0, total)
    hasMore.value = displayedRecipes.value.length < allRecipes.value.length
  }
  
  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 1200))
    currentPage.value++
    loadRecipes()
    isLoading.value = false
  }
  
  const checkLoadMore = () => {
    if (!hasMore.value || isLoading.value) return
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = document.documentElement.clientHeight
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore()
    }
  }
  
  // 蔬菜图标数组
  const vegetableIcons = [
    'fas fa-seedling', // 幼苗
    'fas fa-carrot',   // 胡萝卜
    'fas fa-leaf',     // 叶子
    'fas fa-apple-alt' // 苹果
  ]
  
  const currentVegetableIndex = ref(0)
  const currentVegetableIcon = computed(() => vegetableIcons[currentVegetableIndex.value])
  
  let iconInterval: number
  
  onMounted(() => {
    loadRecipes()
    window.addEventListener('scroll', checkLoadMore)
    iconInterval = window.setInterval(() => {
      currentVegetableIndex.value = (currentVegetableIndex.value + 1) % vegetableIcons.length
    }, 2000)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', checkLoadMore)
    clearInterval(iconInterval)
  })
  
  // 添加跳转到详情页的方法
  const goToDetail = (id: number) => {
    router.push(`/recipe/${id}`)
  }
  
  // 添加点赞和评论方法
  const toggleLike = (recipe: any) => {
    recipe.likes++
  }
  
  const showComments = (recipe: any) => {
    // 处理显示评论的逻辑
    console.log('Show comments for recipe:', recipe.id)
  }
  
  const showCategories = () => {
    // 显示分类菜单
  }
  
  const showNotifications = () => {
    // 显示通知列表
  }
  
  const handleCategorySelect = (categoryId) => {
    selectedCategory.value = categoryId
    // 这里可以根据选中的分类筛选菜谱
    console.log('Selected category:', categoryId)
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
  </script>
  
  <style scoped>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    padding: 12px 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .nav-left, .nav-right {
    display: flex;
    align-items: center;
  }
  
  .btn-icon {
    background: none;
    border: none;
    color: #333;
    font-size: 20px;
    padding: 8px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-icon:hover {
    color: #ff5252;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 8px 16px;
    flex: 1;
    max-width: 300px;
    margin: 0 12px;
  }
  
  .search-bar i {
    color: #666;
    margin-right: 8px;
  }
  
  .search-bar input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: #333;
  }
  
  .search-bar input::placeholder {
    color: #999;
  }
  
  .notification-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #ff5252;
    border-radius: 50%;
  }
  
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: #666;
    font-size: 12px;
    padding: 4px 0;
    transition: color 0.3s ease;
  }
  
  .nav-item i {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .nav-item.active {
    color: #ff5252;
  }
  
  .nav-item:hover {
    color: #ff5252;
  }
  
  /* 确保内容区域不会被底部导航栏遮挡 */
  .recipes-content {
    padding-bottom: 80px;
  }
  
  /* 响应式调整 */
  @media (max-width: 480px) {
    .navbar {
      padding: 12px 16px;
    }
    
    .search-bar {
      max-width: 200px;
    }
  }
  
  .content-wrapper {
    padding-top: 76px;
    padding-bottom: 100px;
  }
  .recipe-card {
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    transition: transform 0.2s ease;
  }
  .recipe-card:hover {
    transform: translateY(-5px);
  }
  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px 12px 0 0;
  }
  .card-body {
    padding: 15px;
  }
  .btn-group {
    position: relative;
    z-index: 2;
  }
  .btn-group .btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  .btn-like {
    color: #ff5252;
    border-color: #ff5252;
    background: white;
  }
  .btn-like:hover {
    background-color: #ff5252;
    color: white;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .col-md-6 {
    animation: fadeIn 0.5s ease-out forwards;
  }
  :root {
    min-height: 100vh;
  }
  body {
    min-height: 100vh;
    margin: 0;
    padding: 0;
    position: relative;
  }
  
  /* 加载动画样式 */
  .loading-animation {
    text-align: center;
    padding: 20px 0;
  }
  
  .vegetable-bounce {
    display: inline-block;
    animation: bounce 1s infinite;
  }
  
  .vegetable-icon {
    font-size: 2rem;
    color: #ff5252;
  }
  
  .loading-text {
    margin-top: 10px;
    color: #666;
    font-size: 14px;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: #ff5252;
    font-size: 24px;
  }
  
  .error {
    text-align: center;
    color: #ff5252;
    padding: 20px;
  }
  
  .no-recipes {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }
  
  .no-recipes i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ddd;
  }
  
  .no-recipes p {
    font-size: 16px;
    margin: 0;
  }
  </style>