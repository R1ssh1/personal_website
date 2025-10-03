'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types';
import RichTextEditor from './RichTextEditor';
import FileUpload from './FileUpload';

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishDate: string;
  featuredImage?: string;
  published: boolean;
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function BlogForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: BlogFormProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    publishDate: initialData?.publishDate || new Date().toISOString().split('T')[0],
    featuredImage: initialData?.featuredImage || '',
    published: initialData?.published || false,
  });

  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags?.join(', ') || ''
  );

  const [featuredImage, setFeaturedImage] = useState<UploadedFile[]>(
    initialData?.featuredImage ? [{
      url: initialData.featuredImage,
      filename: 'Featured Image',
      size: 0,
      type: 'image/jpeg',
    }] : []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title is too long (max 200 characters)';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt is too long (max 500 characters)';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const handleFeaturedImageUpload = useCallback((files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFeaturedImage([file]);
      handleInputChange('featuredImage', file.url);
      setUploadError('');
    }
  }, []);

  const handleRemoveFeaturedImage = useCallback(() => {
    setFeaturedImage([]);
    handleInputChange('featuredImage', '');
  }, []);

  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    try {
      await onSubmit(formData);

      // Reset form after successful submission for new posts
      if (!initialData) {
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          tags: [],
          publishDate: new Date().toISOString().split('T')[0],
          featuredImage: '',
          published: false,
        });
        setTagsInput('');
        setFeaturedImage([]);
        setUploadError('');
        setErrors({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={`blog-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter blog post title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-vertical ${errors.excerpt ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Write a brief excerpt for the blog post..."
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <div className={`border rounded-lg overflow-hidden ${errors.content ? 'border-red-500' : 'border-gray-300'
            }`}>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Start writing your blog post..."
              disabled={isSubmitting}
              height={400}
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter tags separated by commas (e.g., React, TypeScript, Web Development)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Publish Date */}
        <div>
          <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date *
          </label>
          <input
            type="date"
            id="publishDate"
            value={formData.publishDate}
            onChange={(e) => handleInputChange('publishDate', e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${errors.publishDate ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.publishDate && (
            <p className="mt-1 text-sm text-red-600">{errors.publishDate}</p>
          )}
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>

          {featuredImage.length === 0 ? (
            <FileUpload
              onUpload={handleFeaturedImageUpload}
              onError={handleUploadError}
              multiple={false}
              accept="image/*"
              folder="blog-images"
              disabled={isSubmitting}
            />
          ) : (
            <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <img
                src={featuredImage[0].url}
                alt={featuredImage[0].filename}
                className="w-full h-48 object-cover rounded"
              />
              <button
                type="button"
                onClick={handleRemoveFeaturedImage}
                disabled={isSubmitting}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>

        {/* Published Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => handleInputChange('published', e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Publish immediately
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            )}
            <span>
              {isSubmitting
                ? (initialData ? 'Updating...' : 'Creating...')
                : (initialData ? 'Update Post' : 'Create Post')
              }
            </span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}