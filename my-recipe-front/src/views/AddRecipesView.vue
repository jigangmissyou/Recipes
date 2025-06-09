<template>
  <div>
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h5 class="mb-0">Add New Recipe</h5>
        <div></div>
      </div>
    </nav>

    <!-- 表单内容 -->
    <div class="recipe-form">
      <div class="container">
        <form @submit.prevent="handleSubmit">
          <!-- 基本信息 -->
          <div class="form-section">
            <h5>Basic Information</h5>
            <div class="mb-3">
              <label class="form-label">Recipe Name</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="Enter recipe name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Category</label>
              <select v-model="form.category_id" class="form-select">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-control" rows="3" placeholder="Describe your recipe..." required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Difficulty</label>
              <select v-model="form.difficulty" class="form-select">
                <option v-for="option in difficultyOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <div class="row">
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label">Prep Time (mins)</label>
                  <input v-model="form.prep_time" type="number" class="form-control" placeholder="e.g. 5" required>
                </div>
              </div>
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label">Cook Time (mins)</label>
                  <input v-model="form.cook_time" type="number" class="form-control" placeholder="e.g. 15" required>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Cover Image</label>
              <div class="image-upload" @click="triggerCoverUpload">
                <div class="image-upload-placeholder" v-if="!form.cover_image">
                  <i class="fas fa-camera"></i>
                  <p>Click to upload cover image</p>
                </div>
                <img v-if="form.cover_image" :src="form.cover_image" alt="" />
                <div class="image-upload-overlay">
                  <i class="fas fa-camera"></i> Change Image
                </div>
                <input ref="coverInput" type="file" accept="image/*" style="display: none" @change="handleCoverChange">
              </div>
            </div>
          </div>

          <!-- 食材清单 -->
          <div class="form-section">
            <h5>Ingredients</h5>
            <div id="ingredientsList">
              <div class="ingredient-item" v-for="(ingredient, idx) in form.ingredients" :key="idx">
                <input v-model="ingredient.name" type="text" class="form-control" placeholder="Ingredient name" required>
                <input v-model="ingredient.quantity" type="text" class="form-control" placeholder="Quantity" required>
                <input v-model="ingredient.unit" type="text" class="form-control" placeholder="Unit">
                <input v-model="ingredient.notes" type="text" class="form-control" placeholder="Notes (optional)">
                <button type="button" class="btn btn-outline-danger" @click="removeIngredient(idx)" :disabled="form.ingredients.length === 1">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button type="button" class="btn btn-outline-primary w-100" @click="addIngredient">
              <i class="fas fa-plus"></i> Add Ingredient
            </button>
          </div>

          <!-- 步骤说明 -->
          <div class="form-section">
            <h5>Cooking Steps</h5>
            <div id="stepsList">
              <div class="step-item" v-for="(step, idx) in form.steps" :key="step.step_order">
                <div class="step-number">
                  <div class="drag-handle">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  {{ idx + 1 }}
                </div>
                <div class="step-content">
                  <textarea v-model="step.description" class="form-control" rows="3" placeholder="Describe this step in detail..." required></textarea>
                  <div class="step-image-upload" @click="triggerStepImageUpload(idx)">
                    <div class="step-image-placeholder" v-if="!step.image_url">
                      <i class="fas fa-camera"></i>
                      <p>Add step image (optional)</p>
                    </div>
                    <img v-if="step.image_url" :src="step.image_url" alt="">
                    <div class="image-upload-overlay">
                      <i class="fas fa-camera"></i> Change Image
                    </div>
                    <input 
                      :ref="el => { if (el) stepInputs[idx] = el }" 
                      type="file" 
                      accept="image/*" 
                      style="display: none" 
                      @change="e => handleStepImageChange(e, idx)"
                    >
                  </div>
                </div>
                <div class="step-actions">
                  <button type="button" class="btn btn-outline-danger btn-step-action" @click="removeStep(idx)" :disabled="form.steps.length === 1">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="step-drag-handle">
                  <i class="fas fa-grip-vertical"></i>
                </div>
              </div>
            </div>
            <button type="button" class="btn-add-step" @click="addStep">
              <i class="fas fa-plus"></i> Add Step
            </button>
          </div>

          <!-- 修改标签部分 -->
          <div class="form-section">
            <h5>Tags</h5>
            <div class="mb-3">
              <div class="tag-search-container">
                <input 
                  v-model="tagSearchQuery"
                  type="text" 
                  class="form-control" 
                  placeholder="Search tags..."
                  @input="handleTagSearch"
                  @focus="showTagDropdown = true"
                >
                <!-- 标签下拉列表 -->
                <div v-if="showTagDropdown && filteredTags.length > 0" class="tag-dropdown">
                  <div 
                    v-for="tag in filteredTags" 
                    :key="tag.id"
                    class="tag-dropdown-item"
                    @click="selectTag(tag)"
                  >
                    {{ tag.name }}
                  </div>
                </div>
              </div>
              <!-- 已选标签展示 -->
              <div class="tags-container mt-2">
                <span 
                  v-for="(tag, index) in form.tags" 
                  :key="index" 
                  class="badge bg-primary me-2 mb-2"
                >
                  {{ tag }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-white ms-2" 
                    @click="removeTag(index)"
                  ></button>
                </span>
              </div>
            </div>
          </div>
        </form>

        <!-- 发布按钮 -->
        <button 
          type="button" 
          class="btn btn-primary publish-button" 
          @click="handleSubmit"
          :disabled="loading"
        >
          <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
          {{ loading ? 'Publishing...' : 'Publish Recipe' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import { recipeService } from '@/services/recipe'
import api from '@/services/api'

const router = useRouter()
const goBack = () => window.history.back()

const coverInput = ref<HTMLInputElement | null>(null)
const stepInputs = ref<HTMLInputElement[]>([])
const loading = ref(false)

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const form = ref({
  category_id: 1,
  name: '',
  description: '',
  difficulty: 'Easy',
  prep_time: '',
  cook_time: '',
  cover_image: '',
  ingredients: [
    { name: '', quantity: '', unit: '', notes: '' }
  ],
  steps: [
    { 
      step_order: 1, 
      description: '',
      image_url: ''
    }
  ],
  tags: []
})

const difficultyOptions = ['Easy', 'Medium', 'Hard']

const categories = ref([
  { id: 1, name: 'Main Courses' },
  { id: 2, name: 'Breakfast' },
  { id: 3, name: 'Lunch' },
  { id: 4, name: 'Dinner' },
  { id: 5, name: 'Dessert' },
  { id: 6, name: 'Snacks' },
  { id: 7, name: 'Drinks' },
  { id: 8, name: 'Vegetarian' },
  { id: 9, name: 'Vegan' },
  { id: 10, name: 'Gluten-Free' }
])

// 标签相关
const allTags = ref([])
const filteredTags = ref([])
const tagSearchQuery = ref('')
const showTagDropdown = ref(false)

// 获取所有标签
const fetchTags = async () => {
  try {
    const response = await api.get('/recipe-tags')
    allTags.value = response.data
    filteredTags.value = response.data
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

// 处理标签搜索
const handleTagSearch = () => {
  if (!tagSearchQuery.value) {
    filteredTags.value = allTags.value
    return
  }
  
  const query = tagSearchQuery.value.toLowerCase()
  filteredTags.value = allTags.value.filter(tag => 
    tag.name.toLowerCase().includes(query)
  )
}

// 选择标签
const selectTag = (tag) => {
  if (!form.value.tags.includes(tag.name)) {
    form.value.tags.push(tag.name)
  }
  tagSearchQuery.value = ''
  showTagDropdown.value = false
}

// 移除标签
const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const tagSearchContainer = document.querySelector('.tag-search-container')
  if (tagSearchContainer && !tagSearchContainer.contains(event.target)) {
    showTagDropdown.value = false
  }
}

const addIngredient = () => {
  form.value.ingredients.push({ name: '', quantity: '', unit: '', notes: '' })
}
const removeIngredient = (idx: number) => {
  if (form.value.ingredients.length > 1) form.value.ingredients.splice(idx, 1)
}

const addStep = () => {
  const newOrder = form.value.steps.length + 1
  form.value.steps.push({ 
    step_order: newOrder, 
    description: '',
    image_url: ''
  })
  nextTick(() => initSortable())
}
const removeStep = (idx: number) => {
  if (form.value.steps.length > 1) {
    form.value.steps.splice(idx, 1)
    form.value.steps.forEach((step, index) => {
      step.step_order = index + 1
    })
  }
}

const triggerCoverUpload = () => {
  coverInput.value?.click()
}
const handleCoverChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      loading.value = true
      const response = await recipeService.uploadImage(file)
      console.log('Upload response:', response)
      if (response.url) {
        const imageUrl = response.url.startsWith('http') ? response.url : `${baseUrl}${response.url}`
        form.value.cover_image = imageUrl
        console.log('Updated cover image URL:', form.value.cover_image)
      } else {
        throw new Error('No image URL in response')
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('图片上传失败，请重试')
    } finally {
      loading.value = false
    }
  }
}

const handleStepImageChange = async (e: Event, idx: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      loading.value = true
      const response = await recipeService.uploadImage(file)
      console.log('Upload response for step image:', response)
      if (response.url) {
        const imageUrl = response.url.startsWith('http') ? response.url : `${baseUrl}${response.url}`
        form.value.steps[idx].image_url = imageUrl
        console.log('Updated step image URL:', form.value.steps[idx].image_url)
      } else {
        throw new Error('No image URL in response')
      }
    } catch (error) {
      console.error('Failed to upload step image:', error)
      alert('图片上传失败，请重试')
    } finally {
      loading.value = false
    }
  }
}

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.description || !form.value.cover_image) {
      alert('请填写所有必填字段')
      return
    }

    if (form.value.ingredients.some(ing => !ing.name || !ing.quantity)) {
      alert('请填写完整的食材信息')
      return
    }

    if (form.value.steps.some(step => !step.description)) {
      alert('请填写所有步骤的描述')
      return
    }

    // 确保 prep_time 和 cook_time 是数字
    form.value.prep_time = form.value.prep_time.toString()
    form.value.cook_time = form.value.cook_time.toString()

    loading.value = true
    const response = await recipeService.createRecipe(form.value)
    router.push(`/recipe/${response.id}`)
  } catch (error) {
    console.error('Failed to create recipe:', error)
    alert('创建菜谱失败，请重试')
  } finally {
    loading.value = false
  }
}

let sortable: Sortable | null = null
const initSortable = () => {
  nextTick(() => {
    const el = document.getElementById('stepsList')
    if (el) {
      if (sortable) sortable.destroy()
      sortable = Sortable.create(el, {
        handle: '.step-drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: evt => {
          const oldIndex = evt.oldIndex!
          const newIndex = evt.newIndex!
          const moved = form.value.steps.splice(oldIndex, 1)[0]
          form.value.steps.splice(newIndex, 0, moved)
        }
      })
    }
  })
}

onMounted(() => {
  initSortable()
  fetchTags()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const triggerStepImageUpload = (idx: number) => {
  stepInputs.value[idx]?.click()
}
</script>

<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';

/* 复制原型样式 */
.recipe-form {
  padding-top: 56px;
  padding-bottom: 70px;
}
.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.image-upload {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.image-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.image-upload-placeholder {
  text-align: center;
  color: #666;
}
.image-upload-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #ddd;
}
.image-upload-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}
.image-upload:hover .image-upload-overlay {
  opacity: 1;
}
.ingredient-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.ingredient-item .form-control {
  flex: 1;
}
.ingredient-item .form-select {
  width: 120px;
}
.step-item {
  position: relative;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 15px;
  background: #f8f9fa;
  cursor: move;
  transition: transform 0.2s, box-shadow 0.2s;
}
.step-number {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 24px;
  height: 24px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 2;
}
.step-drag-handle {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: grab;
  padding: 5px;
  z-index: 3;
}
.step-drag-handle:active {
  cursor: grabbing;
}
.step-item.sortable-ghost {
  opacity: 0.5;
  background: #e9ecef;
  transform: scale(0.95);
}
.step-item.sortable-chosen {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: scale(1.02);
}
.step-actions {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  gap: 5px;
  z-index: 4;
}
.btn-step-action {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.step-content {
  padding-left: 80px;
  padding-right: 50px;
  position: relative;
  z-index: 1;
}
.step-image-upload {
  margin-top: 10px;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.step-image-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.step-image-placeholder {
  text-align: center;
  color: #666;
}
.step-image-placeholder i {
  font-size: 32px;
  margin-bottom: 5px;
  color: #ddd;
}
.image-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.step-image-upload:hover .image-upload-overlay {
  opacity: 1;
}
.btn-add-step {
  width: 100%;
  padding: 15px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: transparent;
  color: #666;
  margin-top: 10px;
}
.btn-add-step:hover {
  background: #f8f9fa;
  border-color: #ff5252;
  color: #ff5252;
}
.publish-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 100;
  background-color: #ff5252;
  border-color: #ff5252;
}
.publish-button:hover {
  background-color: #ff3333;
  border-color: #ff3333;
}
.form-tip {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
.btn-nav {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 0 10px 0 0;
}

/* Update the Add Ingredient button */
.btn-outline-primary {
  border-color: #ff5252;
  color: #ff5252;
}

.btn-outline-primary:hover {
  background-color: #ff5252;
  border-color: #ff5252;
  color: white;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: white;
}

.form-select:focus {
  border-color: #ff5252;
  box-shadow: 0 0 0 0.2rem rgba(255, 82, 82, 0.25);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: #ff5252;
}

.btn-close {
  padding: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.btn-close:hover {
  opacity: 1;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.tag-search-container {
  position: relative;
}

.tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.tag-dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag-dropdown-item:hover {
  background-color: #f8f9fa;
  color: #ff5252;
}

/* 自定义滚动条样式 */
.tag-dropdown::-webkit-scrollbar {
  width: 6px;
}

.tag-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tag-dropdown::-webkit-scrollbar-thumb {
  background: #ff5252;
  border-radius: 3px;
}

.tag-dropdown::-webkit-scrollbar-thumb:hover {
  background: #ff3333;
}
</style>
