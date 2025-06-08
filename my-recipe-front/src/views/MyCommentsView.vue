<template>
  <div class="my-comments">
    <!-- 导航栏 -->
    <nav class="navbar">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>My Comments</h1>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">Failed to load comments</p>
      <button class="btn btn-primary" @click="goBack">Go Back</button>
    </div>

    <!-- 内容区域 -->
    <div v-else class="comments-content">
      <!-- 空状态 -->
      <div v-if="!comments.length" class="empty-state">
        <img src="https://picsum.photos/200/200" alt="No comments" class="empty-image">
        <h3>No Comments Yet</h3>
        <p>Start commenting on recipes!</p>
        <button class="btn btn-primary" @click="goToExplore">
          Browse Recipes
        </button>
      </div>

      <!-- 评论列表 -->
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <div class="recipe-info">
              <div class="recipe-name" @click="goToRecipe(comment.recipe_id)">
                {{ comment.recipe.name }}
              </div>
              <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
            </div>
            <button class="btn-delete" @click.stop="confirmDelete(comment)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-meta" v-if="comment.parent">
            <span class="reply-indicator">
              Reply to: {{ comment.parent.content }}
            </span>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="hasMoreComments" class="load-more">
        <button class="btn btn-primary" @click="loadMore" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { recipeService } from '../services/recipe'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const comments = ref([])
const loading = ref(true)
const error = ref(false)
const currentPage = ref(1)
const hasMoreComments = ref(true)

const fetchMyComments = async (page = 1) => {
  loading.value = true
  error.value = false
  try {
    const response = await recipeService.getMyComments(page)
    if (page === 1) {
      comments.value = response.data
    } else {
      comments.value = [...comments.value, ...response.data]
    }
    hasMoreComments.value = response.current_page < response.last_page
    currentPage.value = response.current_page
  } catch (err) {
    error.value = true
    console.error('Error fetching comments:', err)
    ElMessage.error('Failed to load comments')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && hasMoreComments.value) {
    fetchMyComments(currentPage.value + 1)
  }
}

const goBack = () => {
  router.back()
}

const goToExplore = () => {
  router.push('/recipes')
}

const goToRecipe = (recipeId) => {
  router.push(`/recipe/${recipeId}`)
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else {
    return `${days} days ago`
  }
}

// 添加删除评论的方法
const confirmDelete = async (comment) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this comment?',
      'Delete Comment',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await deleteComment(comment)
  } catch (err) {
    if (err !== 'cancel') {
      console.error('Error deleting comment:', err)
    }
  }
}

const deleteComment = async (comment) => {
  try {
    await recipeService.deleteComment(comment.recipe_id, comment.id)
    // 从列表中移除被删除的评论
    comments.value = comments.value.filter(c => c.id !== comment.id)
    ElMessage.success('Comment deleted successfully')
  } catch (err) {
    console.error('Error deleting comment:', err)
    ElMessage.error('Failed to delete comment')
  }
}

onMounted(() => {
  fetchMyComments()
})
</script>

<style scoped>
.my-comments {
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

.comments-content {
  padding: 20px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.comment-card:hover {
  transform: translateY(-2px);
}

.comment-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-right: 10px;
}

.btn-delete {
  background: none;
  border: none;
  color: #ff5252;
  padding: 5px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-delete:hover {
  color: #ff3333;
}

.recipe-name {
  font-weight: 500;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.recipe-name:hover {
  color: #ff5252;
}

.comment-time {
  color: #666;
  font-size: 13px;
}

.comment-content {
  color: #444;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-meta {
  font-size: 13px;
  color: #666;
}

.reply-indicator {
  color: #ff5252;
  font-style: italic;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
}

.load-more button {
  min-width: 120px;
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
</style>
