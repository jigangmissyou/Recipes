<template>
  <div class="edit-recipe">
    <!-- 导航栏 -->
    <nav class="navbar">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>Edit Recipe</h1>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading recipe...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">An error occurred while loading the recipe.</p>
      <button class="btn btn-primary" @click="goBack">Go Back</button>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="recipe-form">
      <div class="form-group">
        <label>Recipe Image</label>
        <div class="image-upload" @click="triggerImageUpload">
          <img v-if="recipe.image" :src="recipe.image" alt="Recipe" class="preview-image">
          <div v-else class="upload-placeholder">
            <i class="fas fa-camera"></i>
            <span>Click to upload image</span>
          </div>
          <input 
            type="file" 
            ref="imageInput" 
            accept="image/*" 
            @change="handleImageUpload" 
            style="display: none"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Recipe Title</label>
        <input 
          type="text" 
          v-model="recipe.title" 
          placeholder="Enter recipe title"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label>Ingredients</label>
        <div class="ingredients-list">
          <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="ingredient-item">
            <input 
              type="text" 
              v-model="recipe.ingredients[index]" 
              placeholder="Enter ingredient"
              class="form-control"
            >
            <button class="btn-remove" @click="removeIngredient(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button class="btn btn-secondary" @click="addIngredient">
          <i class="fas fa-plus"></i> Add Ingredient
        </button>
      </div>

      <div class="form-group">
        <label>Cooking Steps</label>
        <div class="steps-list" ref="stepsList">
          <div v-for="(step, index) in recipe.steps" :key="step.id" class="step-item">
            <div class="step-number">
              <div class="drag-handle">
                <span></span>
                <span></span>
                <span></span>
              </div>
              {{ index + 1 }}
            </div>
            <div class="step-content">
              <input 
                type="text" 
                v-model="step.description" 
                placeholder="Enter step description"
                class="form-control"
              >
              <div class="step-image-upload" @click="triggerStepImageUpload(index)">
                <img v-if="step.image" :src="step.image" alt="Step" class="preview-image">
                <div v-else class="upload-placeholder">
                  <i class="fas fa-camera"></i>
                  <span>Add step image</span>
                </div>
                <input 
                  type="file" 
                  :ref="el => stepImageInputs[index] = el" 
                  accept="image/*" 
                  @change="(e) => handleStepImageUpload(e, index)" 
                  style="display: none"
                >
              </div>
            </div>
            <button class="btn-remove" @click="removeStep(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button class="btn btn-secondary" @click="addStep">
          <i class="fas fa-plus"></i> Add Step
        </button>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" @click="saveRecipe">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sortable from 'sortablejs'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref(false)
const imageInput = ref(null)
const stepImageInputs = ref([])
const stepsList = ref(null)

// 获取食谱详情
const fetchRecipeDetails = async () => {
  loading.value = true
  error.value = false
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    recipe.value = {
      id: route.params.id,
      title: "Classic Chocolate Cake",
      image: "https://picsum.photos/800/600?random=1",
      ingredients: [
        "2 cups all-purpose flour",
        "2 cups sugar",
        "3/4 cup unsweetened cocoa powder",
        "2 teaspoons baking powder",
        "1 1/2 teaspoons baking soda",
        "1 teaspoon salt",
        "1 cup milk",
        "1/2 cup vegetable oil",
        "2 large eggs",
        "2 teaspoons vanilla extract",
        "1 cup boiling water"
      ],
      steps: [
        {
          id: 1,
          description: "Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.",
          image: "https://picsum.photos/800/600?random=2"
        },
        {
          id: 2,
          description: "In a large bowl, mix together flour, sugar, cocoa powder, baking powder, baking soda, and salt.",
          image: "https://picsum.photos/800/600?random=3"
        },
        {
          id: 3,
          description: "Add eggs, milk, oil, and vanilla extract. Beat on medium speed for 2 minutes.",
          image: "https://picsum.photos/800/600?random=4"
        },
        {
          id: 4,
          description: "Stir in boiling water. The batter will be thin, but that's okay.",
          image: "https://picsum.photos/800/600?random=5"
        },
        {
          id: 5,
          description: "Pour batter into prepared pans. Bake for 30-35 minutes or until a toothpick inserted in the center comes out clean.",
          image: "https://picsum.photos/800/600?random=6"
        }
      ]
    }
  } catch (err) {
    error.value = true
    console.error('Error fetching recipe:', err)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value.click()
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      recipe.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 触发步骤图片上传
const triggerStepImageUpload = (index) => {
  stepImageInputs.value[index].click()
}

// 处理步骤图片上传
const handleStepImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      recipe.value.steps[index].image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 添加食材
const addIngredient = () => {
  recipe.value.ingredients.push('')
}

// 移除食材
const removeIngredient = (index) => {
  recipe.value.ingredients.splice(index, 1)
}

// 添加步骤
const addStep = () => {
  const newId = recipe.value.steps.length > 0 
    ? Math.max(...recipe.value.steps.map(step => step.id)) + 1 
    : 1
  recipe.value.steps.push({
    id: newId,
    description: '',
    image: ''
  })
}

// 移除步骤
const removeStep = (index) => {
  recipe.value.steps.splice(index, 1)
}

// 保存食谱
const saveRecipe = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 保存成功后返回上一页
    router.push('/my-recipes')
  } catch (err) {
    console.error('Error saving recipe:', err)
  }
}

// 初始化拖拽排序
const initSortable = () => {
  if (stepsList.value) {
    new Sortable(stepsList.value, {
      animation: 150,
      handle: '.step-number',
      onEnd: ({ newIndex, oldIndex }) => {
        const steps = [...recipe.value.steps]
        const movedStep = steps.splice(oldIndex, 1)[0]
        steps.splice(newIndex, 0, movedStep)
        recipe.value.steps = steps
      }
    })
  }
}

// 在数据加载完成后初始化拖拽
onMounted(async () => {
  await fetchRecipeDetails()
  await nextTick()
  initSortable()
})
</script>

<style scoped>
.edit-recipe {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 20px;
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

.recipe-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-control:focus {
  border-color: #ff5252;
  outline: none;
}

.image-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-placeholder i {
  font-size: 24px;
  margin-bottom: 10px;
}

.ingredients-list {
  margin-bottom: 15px;
}

.ingredient-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.btn-remove {
  background: none;
  border: none;
  color: #666;
  padding: 5px;
  cursor: pointer;
}

.btn-remove:hover {
  color: #ff5252;
}

.steps-list {
  margin-bottom: 15px;
}

.step-item {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  position: relative;
}

.step-item:hover {
  transform: translateY(-2px);
}

.step-item.sortable-ghost {
  opacity: 0.5;
  background: #f8f9fa;
}

.step-item.sortable-chosen {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.step-number {
  width: 30px;
  height: 30px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  position: relative;
}

.drag-handle {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: move;
}

.drag-handle span {
  width: 4px;
  height: 4px;
  background: #666;
  border-radius: 50%;
}

.step-content {
  flex: 1;
}

.step-image-upload {
  width: 100%;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #ff5252;
  color: white;
}

.btn-primary:hover {
  background: #ff3333;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
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
