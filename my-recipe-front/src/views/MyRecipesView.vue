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
                <p class="card-text text-muted">
                  <i class="fas fa-clock"></i> {{ recipe.prep_time }} + {{ recipe.cook_time }}
                </p>
                <div class="recipe-tags mb-2">
                  <span v-for="tag in recipe.tags" :key="tag.id" class="badge bg-secondary me-1">
                    {{ tag.name }}
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-like">
                      <i class="fas fa-heart"></i> {{ recipe.likes_count || 0 }}
                    </button>
                    <button class="btn btn-sm btn-like">
                      <i class="fas fa-comment"></i> {{ recipe.comments_count || 0 }}
                    </button>
                  </div>
                  <small class="text-muted">By {{ recipe.user?.nickname || 'Unknown' }}</small>
                </div>
              </div>
            </div>
          </div>
          <div v-if="recipes.length === 0" class="text-center text-muted py-5">
            暂无菜谱
          </div>
        </div>
        
        <!-- 加载动画 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
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

const router = useRouter()
const recipes = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

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

.recipe-card {
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.recipe-image {
  height: 200px;
  object-fit: cover;
}

.btn-like {
  color: #666;
  background: none;
  border: none;
  padding: 5px 10px;
}

.btn-like:hover {
  color: #ff5252;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.badge {
  font-size: 12px;
  padding: 5px 10px;
}
</style>
