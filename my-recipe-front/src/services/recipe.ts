import api from './api'

export interface Recipe {
  category_id: number
  name: string
  description: string
  difficulty: string
  prep_time: string
  cook_time: string
  cover_image: string
  ingredients: {
    name: string
    quantity: string
    unit: string
    notes?: string
  }[]
  steps: {
    step_order: number
    description: string
    image?: string
  }[]
  tags: string[]
}

export const recipeService = {
  // 创建菜谱
  async createRecipe(recipe: Recipe) {
    const response = await api.post('/recipes', recipe)
    return response.data
  },

  // 上传图片
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // 确保返回的数据中包含图片URL
    if (!response.data || !response.data.image_url) {
      throw new Error('Invalid response from server: missing image URL')
    }
    return {
      url: response.data.image_url
    }
  }
} 