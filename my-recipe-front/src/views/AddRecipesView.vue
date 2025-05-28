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
              <label class="form-label">Recipe Title</label>
              <input v-model="form.title" type="text" class="form-control" placeholder="Enter a descriptive title" required>
              <div class="form-tip">Make it clear and appetizing!</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Cover Image</label>
              <div class="image-upload" @click="triggerCoverUpload">
                <div class="image-upload-placeholder" v-if="!form.coverImageUrl">
                  <i class="fas fa-camera"></i>
                  <p>Click to upload cover image</p>
                </div>
                <img v-if="form.coverImageUrl" :src="form.coverImageUrl" alt="" />
                <div class="image-upload-overlay">
                  <i class="fas fa-camera"></i> Change Image
                </div>
                <input ref="coverInput" type="file" accept="image/*" style="display: none" @change="handleCoverChange">
              </div>
              <div class="form-tip">Recommended size: 1200x800 pixels</div>
            </div>
            <div class="row">
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label">Cooking Time (mins)</label>
                  <input v-model.number="form.cookingTime" type="number" class="form-control" placeholder="e.g. 30" required>
                </div>
              </div>
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label">Calories</label>
                  <input v-model.number="form.calories" type="number" class="form-control" placeholder="e.g. 400" required>
                </div>
              </div>
            </div>
          </div>

          <!-- 食材清单 -->
          <div class="form-section">
            <h5>Ingredients</h5>
            <div id="ingredientsList">
              <div class="ingredient-item" v-for="(ingredient, idx) in form.ingredients" :key="idx">
                <input v-model="ingredient.name" type="text" class="form-control" placeholder="Ingredient name" required>
                <input v-model.number="ingredient.amount" type="number" class="form-control" placeholder="Amount" required>
                <select v-model="ingredient.unit" class="form-select">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="cup">cup</option>
                  <option value="piece">piece</option>
                </select>
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
              <div class="step-item" v-for="(step, idx) in form.steps" :key="step.id" :data-id="step.id">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-actions">
                  <button type="button" class="btn btn-outline-danger btn-step-action" @click="removeStep(idx)" :disabled="form.steps.length === 1">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="step-content">
                  <textarea v-model="step.text" class="form-control" rows="3" placeholder="Describe this step in detail..." required></textarea>
                  <div class="step-image-upload" @click="triggerStepImageUpload(idx)">
                    <div class="step-image-placeholder" v-if="!step.imageUrl">
                      <i class="fas fa-camera"></i>
                      <p>Add step image</p>
                    </div>
                    <img v-if="step.imageUrl" :src="step.imageUrl" alt="">
                    <div class="image-upload-overlay">
                      <i class="fas fa-camera"></i> Change Image
                    </div>
                    <input ref="stepInputs" type="file" accept="image/*" style="display: none" @change="e => handleStepImageChange(e, idx)">
                  </div>
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
        </form>
        <!-- 发布按钮 -->
        <button type="button" class="btn btn-primary publish-button" @click="handleSubmit">
          <i class="fas fa-paper-plane"></i> Publish Recipe
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import Sortable from 'sortablejs'

const goBack = () => window.history.back()

const coverInput = ref<HTMLInputElement | null>(null)
const stepInputs = ref<HTMLInputElement[]>([])

const form = ref({
  title: '',
  coverImageUrl: '',
  cookingTime: null as number | null,
  calories: null as number | null,
  ingredients: [
    { name: '', amount: null as number | null, unit: 'g' }
  ],
  steps: [
    { id: Date.now(), text: '', imageUrl: '' }
  ]
})

const addIngredient = () => {
  form.value.ingredients.push({ name: '', amount: null, unit: 'g' })
}
const removeIngredient = (idx: number) => {
  if (form.value.ingredients.length > 1) form.value.ingredients.splice(idx, 1)
}

const addStep = () => {
  form.value.steps.push({ id: Date.now() + Math.random(), text: '', imageUrl: '' })
  nextTick(() => initSortable())
}
const removeStep = (idx: number) => {
  if (form.value.steps.length > 1) form.value.steps.splice(idx, 1)
}

const triggerCoverUpload = () => {
  coverInput.value?.click()
}
const handleCoverChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => {
      form.value.coverImageUrl = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const triggerStepImageUpload = (idx: number) => {
  // 由于每个input都渲染，直接用ref数组
  stepInputs.value[idx]?.click()
}
const handleStepImageChange = (e: Event, idx: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => {
      form.value.steps[idx].imageUrl = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = () => {
  // 这里可以做表单校验和提交
  alert('模拟发布成功！')
}

// 拖拽排序
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
          // 重新排序steps
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
})
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
  z-index: 2;
}
.step-image-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
</style>
