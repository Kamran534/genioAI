import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface MeResponse {
  id: string
  email: string
}

export interface GenerateArticleRequest {
  prompt: string
  length?: number
}

export interface GenerateArticleResponse {
  success: boolean
  message: string
  article: string
}

export interface GenerateBlogTitlesRequest {
  keyword: string
  category: string
}

export interface GenerateBlogTitlesResponse {
  success: boolean
  message: string
  titles: string[]
}

export interface NewsletterSubscribeRequest {
  email: string
  firstName?: string
  lastName?: string
  preferences?: {
    frequency?: string
  }
}

export interface NewsletterSubscribeResponse {
  success: boolean
  message: string
  data: {
    subscription: {
      subscription_id: string
      email: string
      first_name: string | null
      last_name: string | null
      preferences: any
      subscription_source: string
      is_active: boolean
      created_at: string
      updated_at: string
    }
    is_new_subscription: boolean
    email_sent: boolean
  }
}

export interface NewsletterUnsubscribeRequest {
  email: string
}

export interface NewsletterUnsubscribeResponse {
  success: boolean
  message: string
  data: {
    subscription: {
      subscription_id: string
      email: string
      is_active: boolean
      unsubscribed_at: string
    }
  }
}

export interface NewsletterStatusResponse {
  success: boolean
  message: string
  data: {
    is_subscribed: boolean
    subscription?: {
      subscription_id: string
      email: string
      first_name: string | null
      last_name: string | null
      preferences: any
      subscription_source: string
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }
}

export interface UserCreationsResponse {
  success: boolean
  data: {
    articles: Array<{
      article_id: string
      prompt: string
      content: string
      length: number
      created_at: string
      updated_at: string
    }>
    blog_titles: Array<{
      id: string
      batch_id: string
      keyword: string
      category: string
      title: string
      created_at: string
    }>
    ai_images: Array<{
      image_id: string
      user_id: string
      prompt: string
      revised_prompt: string
      style: string
      model: string
      aspect_ratio: string
      quality: string
      image_url: string
      cloudinary_public_id: string
      is_community_published: boolean
      likes_count: number
      created_at: string
      updated_at: string
    }>
  }
}

export interface GenerateAiImageRequest {
  prompt: string
  style?: string
  aspectRatio?: string
  publishToCommunity?: boolean
}

export interface GenerateAiImageResponse {
  success: boolean
  message: string
  data: {
    image_id: string
    image_url: string
    cloudinary_public_id: string
    prompt: string
    revised_prompt: string
    style: string
    model: string
    aspect_ratio: string
    quality: string
    plan: string
    is_community_published: boolean
    image_info: {
      width: number
      height: number
      format: string
      bytes: number
    }
  }
}

export interface CommunityImagesResponse {
  success: boolean
  message: string
  data: {
    images: Array<{
      image_id: string
      user_id: string
      prompt: string
      revised_prompt: string
      style: string
      model: string
      aspect_ratio: string
      quality: string
      image_url: string
      cloudinary_public_id: string
      is_community_published: boolean
      is_liked: boolean
      likes_count: number
      created_at: string
      updated_at: string
    }>
    pagination: {
      current_page: number
      total_pages: number
      total_images: number
      limit: number
      has_next_page: boolean
      has_prev_page: boolean
    }
    filters: {
      style: string
      sort_by: string
      sort_order: string
    }
  }
}

export interface PublishImageRequest {
  isPublished: boolean
}

export interface PublishImageResponse {
  success: boolean
  message: string
  data: {
    image: {
      image_id: string
      user_id: string
      prompt: string
      style: string
      image_url: string
      is_community_published: boolean
      created_at: string
      updated_at: string
    }
  }
}

export interface LikeImageResponse {
  success: boolean
  message: string
  data: {
    image_id: string
    user_id: string
    is_liked: boolean
    total_likes: number
  }
}

export interface LikedImagesResponse {
  success: boolean
  message: string
  data: {
    images: Array<{
      image_id: string
      user_id: string
      prompt: string
      revised_prompt: string
      style: string
      model: string
      aspect_ratio: string
      quality: string
      image_url: string
      cloudinary_public_id: string
      is_community_published: boolean
      created_at: string
      updated_at: string
      liked_at: string
      likes_count: number
      is_liked: boolean
    }>
    total: number
  }
}

export interface RemoveBackgroundRequest {
  image: File
}

export interface RemoveBackgroundResponse {
  success: boolean
  message: string
  data: {
    image_id: string
    image_url: string
    cloudinary_public_id: string
    original_filename: string
    file_size: number
    mime_type: string
    plan: string
    image_info: {
      width: number
      height: number
      format: string
      bytes: number
    }
  }
}

export interface RemoveObjectResponse {
  success: boolean
  message: string
  data: {
    image_id: string
    image_url: string
    cloudinary_public_id: string
    original_filename: string
    file_size: number
    mime_type: string
    plan: string
    image_info: {
      width: number
      height: number
      format: string
      bytes: number
    }
  }
}

export interface AnalyzeResumeResponse {
  success: boolean
  message: string
  data: {
    analysis_id: string
    original_filename: string
    file_size: number
    mime_type: string
    analysis: {
      overall_score: number
      strengths: string[]
      areas_for_improvement: string[]
      ats_analysis: {
        keyword_coverage: number
        compatibility_score: number
        missing_keywords: string[]
        suggestions: string[]
      }
      detailed_feedback: {
        structure: string
        content: string
        formatting: string
        keywords: string
      }
      recommendations: string[]
      industry_insights: string
      next_steps: string[]
    }
    plan: string
    created_at: string
  }
}

interface GlobalWithClerk {
  Clerk?: {
    session?: {
      getToken?: () => Promise<string | null>
    }
  }
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? '/api',
    // Attach Clerk token automatically if available in the browser
    prepareHeaders: async (headers) => {
      const { Clerk } = globalThis as unknown as GlobalWithClerk
      const token = await Clerk?.session?.getToken?.()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['UserCreations', 'Me', 'CommunityImages', 'LikedImages'],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: '/me' }),
      providesTags: ['Me'],
    }),
    generateArticle: builder.mutation<GenerateArticleResponse, GenerateArticleRequest>({
      query: (body) => ({
        url: '/article/generate-article',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserCreations'],
    }),
    generateBlogTitles: builder.mutation<GenerateBlogTitlesResponse, GenerateBlogTitlesRequest>({
      query: (body) => ({
        url: '/article/generate-blog-titles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserCreations'],
    }),
    generateAiImage: builder.mutation<GenerateAiImageResponse, GenerateAiImageRequest>({
      query: (body) => ({
        url: '/article/generate-ai-image',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserCreations', 'CommunityImages'],
    }),
    getCommunityImages: builder.query<CommunityImagesResponse, { 
      page?: number
      limit?: number
      style?: string
      sortBy?: string
      sortOrder?: string
    }>({
      query: (params) => ({
        url: '/article/community-images',
        params,
      }),
      providesTags: ['CommunityImages'],
    }),
    publishImage: builder.mutation<PublishImageResponse, { imageId: string } & PublishImageRequest>({
      query: ({ imageId, ...body }) => ({
        url: `/article/publish-image/${imageId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserCreations', 'CommunityImages'],
    }),
    likeImage: builder.mutation<LikeImageResponse, { imageId: string }>({
      query: ({ imageId }) => ({
        url: `/article/like-image/${imageId}`,
        method: 'POST',
      }),
      invalidatesTags: ['CommunityImages', 'LikedImages'],
    }),
    getUserCreations: builder.query<UserCreationsResponse, void>({
      query: () => ({ url: '/user/creations' }),
      providesTags: ['UserCreations'],
    }),
    getLikedImages: builder.query<LikedImagesResponse, void>({
      query: () => ({ url: '/article/liked-images' }),
      providesTags: ['LikedImages'],
    }),
    removeBackground: builder.mutation<RemoveBackgroundResponse, FormData>({
      query: (formData) => ({
        url: '/article/remove-background',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserCreations'],
    }),
    removeObject: builder.mutation<RemoveObjectResponse, FormData>({
      query: (formData) => ({
        url: '/article/remove-object',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserCreations'],
    }),
    analyzeResume: builder.mutation<AnalyzeResumeResponse, FormData>({
      query: (formData) => ({
        url: '/article/analyze-resume',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserCreations'],
    }),
    subscribeToNewsletter: builder.mutation<NewsletterSubscribeResponse, NewsletterSubscribeRequest>({
      query: (body) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body,
      }),
    }),
    unsubscribeFromNewsletter: builder.mutation<NewsletterUnsubscribeResponse, NewsletterUnsubscribeRequest>({
      query: (body) => ({
        url: '/newsletter/unsubscribe',
        method: 'POST',
        body,
      }),
    }),
    getNewsletterStatus: builder.query<NewsletterStatusResponse, { email: string }>({
      query: ({ email }) => ({
        url: '/newsletter/status',
        params: { email },
      }),
    }),
  }),
})

export const { 
  useGetMeQuery, 
  useGenerateArticleMutation, 
  useGenerateBlogTitlesMutation,
  useGenerateAiImageMutation,
  useGetCommunityImagesQuery,
  usePublishImageMutation,
  useLikeImageMutation,
  useGetUserCreationsQuery,
  useGetLikedImagesQuery,
  useRemoveBackgroundMutation,
  useRemoveObjectMutation,
  useAnalyzeResumeMutation,
  useSubscribeToNewsletterMutation,
  useUnsubscribeFromNewsletterMutation,
  useGetNewsletterStatusQuery
} = api


