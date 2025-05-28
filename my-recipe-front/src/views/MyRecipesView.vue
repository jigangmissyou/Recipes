<template>
  <div class="my-recipes">
    <!-- 导航栏 -->
    <nav class="navbar">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>My Recipes</h1>
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
        <h3>No Recipes Yet</h3>
        <p>Start sharing your favorite recipes with the community!</p>
        <button class="btn btn-primary" @click="goToAddRecipe">
          <i class="fas fa-plus"></i> Add Recipe
        </button>
      </div>

      <!-- 食谱列表 -->
      <div v-else class="recipes-grid">
        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.title">
            <div class="recipe-actions">
              <button class="btn-edit" @click="editRecipe(recipe)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" @click="deleteRecipe(recipe)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
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

      <!-- 添加新食谱按钮 -->
      <button class="btn-add-recipe" @click="goToAddRecipe">
        <i class="fas fa-plus"></i>
      </button>
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

// 获取我的食谱列表
const fetchMyRecipes = async () => {
  loading.value = true
  error.value = false
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    recipes.value = [
      {
        id: 1,
        title: "Classic Chocolate Cake",
        image: "https://picsum.photos/400/300?random=1",
        likes: 128,
        comments: 24
      },
      {
        id: 2,
        title: "Homemade Pizza",
        image: "https://picsum.photos/400/300?random=2",
        likes: 89,
        comments: 15
      },
      {
        id: 3,
        title: "Fresh Pasta",
        image: "https://picsum.photos/400/300?random=3",
        likes: 156,
        comments: 32
      }
    ]
  } catch (err) {
    error.value = true
    console.error('Error fetching recipes:', err)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到添加食谱页面
const goToAddRecipe = () => {
  router.push('/add-recipe')
}

// 编辑食谱
const editRecipe = (recipe) => {
  router.push(`/edit-recipe/${recipe.id}`)
}

// 删除食谱
const deleteRecipe = async (recipe) => {
  if (confirm('Are you sure you want to delete this recipe?')) {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      recipes.value = recipes.value.filter(r => r.id !== recipe.id)
    } catch (err) {
      console.error('Error deleting recipe:', err)
    }
  }
}

onMounted(() => {
  fetchMyRecipes()
})
</script>

<style scoped>
.my-recipes {
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

.recipe-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  color: #ff5252;
}

.btn-delete {
  color: #666;
}

.btn-edit:hover {
  background: #ff5252;
  color: white;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
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

.btn-add-recipe {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ff5252;
  color: white;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 82, 82, 0.3);
  transition: all 0.3s ease;
}

.btn-add-recipe:hover {
  transform: scale(1.1);
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
</style>
