<template>
  <div class="recipes-page">
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h5 class="mb-0">My Recipes</h5>
        <div class="nav-actions">
          <button class="btn-icon" @click="goToAddRecipe">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="container">
        <div class="recipe-list">
          <div v-if="loading" class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div v-else-if="recipes.length === 0" class="empty-state">
            <i class="fas fa-utensils"></i>
            <p>你还没有创建任何菜谱</p>
            <button class="btn-primary" @click="goToCreate">创建你的第一个菜谱</button>
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
                <div class="d-flex justify-content-end align-items-center card-actions">
                  <button class="btn-action" @click.stop="goToEdit(recipe.id)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action" @click.stop="handleDelete(recipe)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载更多按钮 -->
        <div v-if="hasMore && !loading" class="text-center py-4">
          <button class="btn btn-outline-primary" @click="loadMore">
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { recipeService } from '@/services/recipe'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const recipes = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const deletingId = ref(null)

// 分类与图标（与公共列表保持一致）
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

// 获取我的菜谱列表
const fetchMyRecipes = async (page = 1) => {
  try {
    loading.value = true
    const response = await recipeService.getMyRecipes(page)
    if (page === 1) {
      recipes.value = response.data
    } else {
      recipes.value = [...recipes.value, ...response.data]
    }
    hasMore.value = response.current_page < response.last_page
    currentPage.value = response.current_page
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    alert('获取菜谱列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    fetchMyRecipes(currentPage.value + 1)
  }
}

// 跳转到菜谱详情
const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到添加菜谱页面
const goToAddRecipe = () => {
  router.push('/add-recipe')
}

const goToCreate = () => router.push('/recipes/create')

const goToEdit = (id) => {
  router.push(`/recipes/edit/${id}`)
}

const handleDelete = (recipe) => {
  ElMessageBox.confirm(
    `确定要删除「${recipe.name}」吗？`,
    '删除菜谱',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await recipeService.deleteRecipe(recipe.id)
      recipes.value = recipes.value.filter(r => r.id !== recipe.id)
      ElMessage.success('删除成功')
    } catch (e) {
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchMyRecipes()
})
</script>

<style scoped>
.recipes-page {
  padding-top: 56px;
}

.top-nav {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-nav {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  padding: 5px;
  cursor: pointer;
}

.recipe-list {
  padding: 64px 16px 16px;
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

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 2rem;
  color: #ff5252;
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

.btn-action {
  background: none;
  border: none;
  color: #888;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.btn-action:hover {
  background: #fff0f0;
  color: #ff5252;
}
</style>
