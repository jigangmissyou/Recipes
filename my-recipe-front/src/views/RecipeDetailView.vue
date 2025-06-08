<template>
  <div class="recipe-detail">
    <!-- Top navigation bar -->
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h5 class="mb-0">{{ recipe?.name }}</h5>
        <div class="nav-actions">
          <!-- <button class="btn-icon" @click="toggleLike">
            <i class="fas" :class="isLiked ? 'fa-heart text-danger' : 'fa-heart'"></i>
          </button> -->
          <button class="btn-icon" @click="toggleBookmark">
            <i class="fas" :class="isBookmarked ? 'fa-bookmark text-primary' : 'fa-bookmark'"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Content area -->
    <div class="content-wrapper">
      <div v-if="loading" class="loading-animation">
        <i class="fas fa-spinner fa-spin vegetable-icon"></i>
        <p>Loading...</p>
      </div>

      <div v-else-if="recipe" class="container">
        <!-- Cover image -->
        <div class="cover-image">
          <img :src="recipe.cover_image" :alt="recipe.name">
        </div>
        <div class="recipe-stats">
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>Prep: {{ recipe.prep_time }} mins</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-fire"></i>
              <span>Cook: {{ recipe.cook_time }} mins</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-signal"></i>
              <span>{{ recipe.difficulty }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-user"></i>
              <span>By {{ recipe.user.nickname }}</span>
            </div>
          </div>
        <!-- Basic information -->
        <div class="recipe-info">
          <div class="recipe-header">
            <!-- <h1 class="recipe-title">{{ recipe.name }}</h1> -->
            <p class="recipe-description">{{ recipe.description }}</p>
          </div>

          

          <!-- <div class="btn-group">
            <button class="btn btn-like" @click="toggleLike">
              <i class="fas fa-heart"></i> {{ recipe.likes }}
            </button>
            <button class="btn btn-like" @click="showComments">
              <i class="fas fa-comment"></i> {{ recipe.comments?.length || 0 }}
            </button>
          </div> -->
        </div>

        <!-- Ingredients list -->
        <div class="recipe-section">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            <li v-for="ingredient in recipe.ingredients" :key="ingredient.id" class="ingredient-item">
              <div class="ingredient-info">
                <span class="ingredient-name">{{ ingredient.name }}</span>
                <span class="ingredient-quantity">
                  {{ ingredient.quantity }} {{ ingredient.unit }}
                </span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Cooking steps -->
        <div class="steps-section">
          <h3>Cooking Steps</h3>
          <div class="steps-list">
            <div v-for="(step, index) in recipe.steps" :key="index" class="step-item">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <img :src="step.image_url" :alt="`Step ${index + 1}`" class="step-image">
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Add category and tag section -->
        <div class="recipe-meta-section">
          <div class="category-section">
            <h4>Category</h4>
            <span class="category-tag">{{ recipe.category.name }}</span>
          </div>
          
          <div class="tags-section" v-if="recipe.tags && recipe.tags.length > 0">
            <h4>Tags</h4>
            <div class="tags-list">
              <span v-for="tag in recipe.tags" :key="tag.id" class="tag-item">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Comments preview -->
        <div class="comments-preview" v-if="comments.length > 0">
          <h4>Comments</h4>
          <div class="comments-container">
            <div class="comment-item" v-for="comment in displayedComments" :key="comment.id">
              <div class="comment-header">
                <img 
                  :src="comment.user.avatar || 'https://i.pravatar.cc/150?img=1'" 
                  :alt="comment.user.nickname" 
                  class="comment-avatar"
                >
                <div>
                  <span class="comment-author">{{ comment.user.nickname }}</span>
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
              <div class="comment-actions">
                <button @click="likeComment(comment)">
                  <i class="fas fa-heart"></i> {{ comment.likes || 0 }}
                </button>
                <button @click="handleReply(comment, false)">
                  <i class="fas fa-reply"></i> Reply
                </button>
              </div>
            </div>
            <button v-if="comments.length > 2" class="load-more-btn" @click="showComments">
              Load More Comments
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments modal -->
    <div class="comments-modal" :class="{ show: isCommentsModalVisible }" v-if="recipe">
      <div class="comments-modal-header">
        <h5>Comments</h5>
        <button class="btn-close" @click="closeComments">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="comments-modal-body">
        <div class="comment-item" v-for="comment in comments" :key="comment.id">
          <div class="comment-header">
            <img 
              :src="comment.user.avatar || 'https://i.pravatar.cc/150?img=1'" 
              :alt="comment.user.nickname" 
              class="comment-avatar"
            >
            <div>
              <span class="comment-author">{{ comment.user.nickname }}</span>
              <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <button @click="likeComment(comment)">
              <i class="fas fa-heart"></i> {{ comment.likes || 0 }}
            </button>
            <button @click="handleReply(comment, true)">
              <i class="fas fa-reply"></i> Reply
            </button>
          </div>
          
          <!-- Add reply list -->
          <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
            <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
              <div class="reply-header">
                <img 
                  :src="reply.user.avatar || 'https://i.pravatar.cc/150?img=1'" 
                  :alt="reply.user.nickname" 
                  class="reply-avatar"
                >
                <div>
                  <span class="reply-author">{{ reply.user.nickname }}</span>
                  <span class="reply-time">{{ formatDate(reply.created_at) }}</span>
                </div>
              </div>
              <div class="reply-content">
                {{ reply.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal comments input area -->
      <div class="comments-modal-footer">
        <div class="comment-input-area" :class="{ 'replying': replyTo }">
          <div v-if="replyTo" class="reply-to-indicator">
            Reply to {{ replyTo.user.nickname }}:
          </div>
          <button class="btn-emoji" @click="toggleEmojiPicker">
            <i class="far fa-smile"></i>
          </button>
          <input 
            type="text" 
            class="comment-input" 
            v-model="newComment" 
            :placeholder="replyTo ? `Reply to ${replyTo.user.nickname}...` : 'Write a comment...'"
            @keyup.enter="submitComment"
          >
          <button class="btn-send" @click="submitComment" :disabled="!newComment.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <!-- Emoji picker -->
        <div class="emoji-picker" v-if="showEmojiPicker">
          <div class="emoji-list">
            <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed bottom comment bar -->
    <div class="comment-bar" v-if="recipe && !isCommentsModalVisible">
      <div class="comment-input-area" :class="{ 'replying': replyTo }">
        <div v-if="replyTo" class="reply-to-indicator">
          Reply to {{ replyTo.user.nickname }}:
        </div>
        <button class="btn-emoji" @click="toggleEmojiPicker">
          <i class="far fa-smile"></i>
        </button>
        <input 
          type="text" 
          class="comment-input" 
          v-model="newComment" 
          :placeholder="replyTo ? `Reply to ${replyTo.user.nickname}...` : 'Write a comment...'"
          @keyup.enter="submitComment"
        >
        <button class="btn-send" @click="submitComment" :disabled="!newComment.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      <!-- Emoji picker -->
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-list">
          <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeService } from '../services/recipe'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref(false)

// Comments related state
const isCommentsModalVisible = ref(false)
const newComment = ref('')
const showEmojiPicker = ref(false)
const replyTo = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const commentsPage = ref(1)
const hasMoreComments = ref(true)

// Emoji symbols list
const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😋', '👏', '🙌', '🤔']

// Displayed comments
const displayedComments = computed(() => {
  return comments.value.slice(0, 2) || []
})

// Get recipe details
const fetchRecipeDetail = async () => {
  try {
    loading.value = true
    const id = Number(route.params.id)
    const recipeData = await recipeService.getRecipeDetail(id)
    recipe.value = recipeData
  } catch (error) {
    console.error('Failed to fetch recipe:', error)
    alert('Failed to fetch recipe details, please try again')
  } finally {
    loading.value = false
  }
}

const goBack = () => window.history.back()

const toggleLike = () => {
  recipe.value.likes++
}

const showComments = () => {
  isCommentsModalVisible.value = true
  showEmojiPicker.value = false
  replyTo.value = null
}

const closeComments = () => {
  isCommentsModalVisible.value = false
  showEmojiPicker.value = false
  replyTo.value = null
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji) => {
  newComment.value += emoji
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  try {
    const comment = await recipeService.createComment(
      Number(route.params.id), 
      newComment.value,
      replyTo.value?.id || null  // Pass parent_id
    )
    // Re-fetch comments to ensure latest data
    await fetchComments()
    // Clear comment input
    newComment.value = ''
    // Close emoji picker
    showEmojiPicker.value = false
    // Clear reply state
    replyTo.value = null
    // Show success notification
    ElMessage.success(replyTo.value ? 'Reply posted successfully' : 'Comment posted successfully')
  } catch (error) {
    console.error('Failed to post comment:', error)
    ElMessage.error('Failed to post comment, please try again later')
  }
}

const handleReply = (comment, isInModal) => {
  replyTo.value = comment
  newComment.value = ''  // Clear input
  if (!isInModal) {
    // Reply in preview, need to open modal
    isCommentsModalVisible.value = true
  }
  showEmojiPicker.value = false
  // Focus to input
  nextTick(() => {
    const input = document.querySelector('.comment-input')
    if (input) {
      input.focus()
    }
  })
}

const likeComment = (comment) => {
  comment.likes++
}

// Get comments list
const fetchComments = async (page = 1) => {
  try {
    commentsLoading.value = true
    const response = await recipeService.getRecipeComments(Number(route.params.id), page)
    if (page === 1) {
      comments.value = response.data
    } else {
      comments.value = [...comments.value, ...response.data]
    }
    hasMoreComments.value = response.current_page < response.last_page
    commentsPage.value = response.current_page
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    commentsLoading.value = false
  }
}

// Format date
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

// Fetch comments when component is mounted
onMounted(() => {
  fetchRecipeDetail()
  fetchComments()
})

// Load more comments
const loadMoreComments = () => {
  if (!commentsLoading.value && hasMoreComments.value) {
    fetchComments(commentsPage.value + 1)
  }
}
</script>

<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';

.recipe-detail {
  padding-top: 56px;
}

.cover-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-info {
  padding: 0 15px;
  margin-bottom: 30px;
}

.recipe-header {
  margin-bottom: 20px;
  padding: 0 15px;
}

.recipe-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
}

.recipe-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.recipe-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 14px;
}

.stat-item i {
  color: #ff5252;
  font-size: 16px;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.btn-like {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-like:hover {
  background-color: #fff5f5;
  color: #ff5252;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-like i {
  font-size: 16px;
}

.ingredients-section {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ingredient-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.ingredient-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ingredient-name {
  font-weight: 500;
  color: #333;
}
.ingredient-quantity {
  color: #666;
}
.steps-section {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.steps-list {
  margin-bottom: 20px;
}
.step-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
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
}
.step-content {
  flex: 1;
}
.step-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.step-content p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}
.comments-preview {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.comments-container {
  max-height: 400px;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for fixed comment bar */
}
.comment-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.comment-author {
  font-weight: 600;
  margin-right: 10px;
}
.comment-time {
  color: #666;
  font-size: 12px;
}
.comment-content {
  margin-bottom: 10px;
  padding-left: 50px;
}
.comment-actions {
  display: flex;
  gap: 15px;
  padding-left: 50px;
  color: #666;
  font-size: 14px;
}
.comment-actions button {
  background: none;
  border: none;
  color: #ff5252;
  padding: 0;
  transition: color 0.2s;
}
.comment-actions button:hover {
  color: #ff3333;
}
.btn-nav {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 0 10px 0 0;
}
.btn-icon {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 0;
}
.btn-icon:hover {
  color: #ff5252;
}
.loading-animation {
  text-align: center;
  padding: 20px;
}
.vegetable-icon {
  font-size: 24px;
  color: #ff5252;
}
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}
.comment-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}
.btn-emoji {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.comment-input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  outline: none;
}
.comment-input:focus {
  border-color: #ff5252;
}
.btn-send {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.btn-send:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}
.emoji-list span {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 5px;
}
.emoji-list span:hover {
  background: #f8f9fa;
  border-radius: 5px;
}
.load-more-btn {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.load-more-btn:hover {
  background-color: #e9ecef;
  color: #333;
}
.comments-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75vh;
  background: white;
  border-radius: 20px 20px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.comments-modal.show {
  transform: translateY(0);
}
.comments-modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.comments-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  padding-bottom: 100px;
}
.comments-modal-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  border-top: 1px solid #eee;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.btn-close {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.recipe-content {
  padding-bottom: 100px;
}
.recipe-meta-section {
  margin-bottom: 40px;
  padding: 20px;
  padding-bottom: 100px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.category-section {
  margin-bottom: 20px;
}
.category-tag {
  background-color: #ff5252;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}
.tags-section {
  margin-bottom: 20px;
}
.tags-list {
  display: flex;
  gap: 10px;
}
.tag-item {
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Add reply related styles */
.replies-list {
  margin-left: 50px;
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid #eee;
}

.reply-item {
  padding: 10px 0;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.reply-author {
  font-weight: 500;
  margin-right: 8px;
  font-size: 14px;
}

.reply-time {
  color: #666;
  font-size: 12px;
}

.reply-content {
  font-size: 14px;
  color: #333;
  margin-left: 32px;
}

/* Modify comment input styles when in reply state */
.comment-input-area.replying {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
}

.reply-to-indicator {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
</style>
