'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPost, Project, Certification } from '@/types';
import RichTextEditor from './RichTextEditor';
import FileUpload from './FileUpload';
import { getImageUrl } from '@/lib/image-utils';

type ContentType = 'blog' | 'project' | 'certification';

interface UnifiedContentFormProps {
  contentType: ContentType;
  initialData?: BlogPost | Project | Certification;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function UnifiedContentForm({
  contentType,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: UnifiedContentFormProps) {

  // Initialize form data based on content type
  const getInitialData = () => {
    switch (contentType) {
      case 'blog':
        const blogData = initialData as BlogPost;
        return {
          title: blogData?.title || '',
          excerpt: blogData?.excerpt || '',
          content: blogData?.content || '',
          tags: blogData?.tags || [],
          publishDate: blogData?.publishDate || new Date().toISOString().split('T')[0],
          featuredImage: blogData?.featuredImage || '',
          published: blogData?.published || false,
        };
      case 'project':
        const projectData = initialData as Project;
        return {
          title: projectData?.title || '',
          description: projectData?.description || '',
          techStack: projectData?.techStack || [],
          githubLink: projectData?.githubLink || '',
          liveDemoLink: projectData?.liveDemoLink || '',
          images: projectData?.images || [],
        };
      case 'certification':
        const certData = initialData as Certification;
        return {
          title: certData?.title || '',
          issuer: certData?.issuer || '',
          issueDate: certData?.issueDate || new Date().toISOString().split('T')[0],
          expirationDate: certData?.expirationDate || '',
          verificationLink: certData?.verificationLink || '',
          description: certData?.description || '',
          tags: certData?.tags || [],
          imageUrl: certData?.imageUrl || '',
        };
    }
  };

  const [formData, setFormData] = useState(getInitialData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = useCallback((
    field: string,
    value: string | string[] | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleTagAdd = useCallback((tagField: string, newTag: string) => {
    if (newTag.trim()) {
      const currentTags = formData[tagField as keyof typeof formData] as string[] || [];
      if (!currentTags.includes(newTag.trim())) {
        handleInputChange(tagField, [...currentTags, newTag.trim()]);
      }
    }
  }, [formData, handleInputChange]);

  const handleTagRemove = useCallback((tagField: string, tagToRemove: string) => {
    const currentTags = formData[tagField as keyof typeof formData] as string[] || [];
    handleInputChange(tagField, currentTags.filter(tag => tag !== tagToRemove));
  }, [formData, handleInputChange]);

  const handleFileUpload = useCallback((field: string, files: UploadedFile[]) => {
    if (field === 'images') {
      // For projects - handle multiple images
      const imageUrls = files.map(file => file.url);
      handleInputChange(field, [...(formData.images || []), ...imageUrls]);
    } else {
      // For single file fields
      if (files.length > 0) {
        handleInputChange(field, files[0].url);
      }
    }
  }, [formData, handleInputChange]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validation
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    // Content type specific validation
    switch (contentType) {
      case 'blog':
        if (!formData.excerpt?.trim()) newErrors.excerpt = 'Excerpt is required';
        if (!formData.content?.trim()) newErrors.content = 'Content is required';
        break;
      case 'project':
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        if (!formData.techStack || formData.techStack.length === 0) {
          newErrors.techStack = 'At least one technology is required';
        }
        break;
      case 'certification':
        if (!formData.issuer?.trim()) newErrors.issuer = 'Issuer is required';
        if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getFormTitle = () => {
    const action = initialData ? 'Edit' : 'Create';
    const type = contentType.charAt(0).toUpperCase() + contentType.slice(1);
    return `${action} ${type}`;
  };

  const getSteps = () => {
    switch (contentType) {
      case 'blog':
        return ['Basic Info', 'Content', 'Settings'];
      case 'project':
        return ['Basic Info', 'Details', 'Media'];
      case 'certification':
        return ['Basic Info', 'Details'];
      default:
        return ['Details'];
    }
  };

  const steps = getSteps();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">{getFormTitle()}</h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${index <= currentStep
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-white/50 border border-white/10'
                }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${index <= currentStep ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50'
                  }`}
              >
                {index + 1}
              </div>
              <span className="text-sm font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 rounded-xl p-8 border border-white/10"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-4">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  function renderStepContent() {
    switch (contentType) {
      case 'blog':
        return renderBlogStep();
      case 'project':
        return renderProjectStep();
      case 'certification':
        return renderCertificationStep();
      default:
        return null;
    }
  }

  function renderBlogStep() {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 ${errors.title ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="Enter blog title..."
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 resize-none ${errors.excerpt ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="Brief description of the blog post..."
              />
              {errors.excerpt && <p className="text-red-400 text-sm mt-1">{errors.excerpt}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tags</label>
              <TagInput
                tags={formData.tags || []}
                onAdd={(tag) => handleTagAdd('tags', tag)}
                onRemove={(tag) => handleTagRemove('tags', tag)}
                placeholder="Add tags..."
              />
            </div>
          </div>
        );

      case 1: // Content
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Content</h2>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Blog Content *
              </label>
              <RichTextEditor
                value={formData.content || ''}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Write your blog content here..."
                height={500}
              />
              {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>
        );

      case 2: // Settings
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Publication Settings</h2>

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publishDate || ''}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Featured Image
              </label>
              <FileUpload
                onUpload={(files) => handleFileUpload('featuredImage', files)}
                accept="image/*"
                multiple={false}
                className="mb-4"
                uploadedFiles={formData.featuredImage ? [{
                  url: formData.featuredImage,
                  filename: 'featured-image.jpg',
                  size: 0,
                  type: 'image/jpeg'
                }] : []}
                onRemoveFile={() => handleInputChange('featuredImage', '')}
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published || false}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
              <span className="text-white text-sm font-medium">
                {formData.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  function renderProjectStep() {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Project Information</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 ${errors.title ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="Enter project title..."
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tech Stack *
              </label>
              <TagInput
                tags={formData.techStack || []}
                onAdd={(tech) => handleTagAdd('techStack', tech)}
                onRemove={(tech) => handleTagRemove('techStack', tech)}
                placeholder="Add technologies (React, Node.js, etc.)"
              />
              {errors.techStack && <p className="text-red-400 text-sm mt-1">{errors.techStack}</p>}
            </div>
          </div>
        );

      case 1: // Details
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Project Details</h2>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <RichTextEditor
                value={formData.description || ''}
                onChange={(content) => handleInputChange('description', content)}
                placeholder="Describe your project..."
                height={400}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  GitHub Link
                </label>
                <input
                  type="url"
                  value={formData.githubLink || ''}
                  onChange={(e) => handleInputChange('githubLink', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  value={formData.liveDemoLink || ''}
                  onChange={(e) => handleInputChange('liveDemoLink', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        );

      case 2: // Media
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Project Images</h2>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Project Screenshots
              </label>
              <FileUpload
                onUpload={(files) => handleFileUpload('images', files)}
                accept="image/*"
                multiple={true}
                className="mb-4"
              />

              {/* Image Preview */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          handleInputChange('images', newImages);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  function renderCertificationStep() {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Certification Information</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Certification Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 ${errors.title ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="e.g. AWS Solutions Architect Associate"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={formData.issuer || ''}
                onChange={(e) => handleInputChange('issuer', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 ${errors.issuer ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="e.g. Amazon Web Services"
              />
              {errors.issuer && <p className="text-red-400 text-sm mt-1">{errors.issuer}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.issueDate || ''}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-purple-500/50 ${errors.issueDate ? 'border-red-500/50' : 'border-white/20'
                    }`}
                />
                {errors.issueDate && <p className="text-red-400 text-sm mt-1">{errors.issueDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Expiration Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.expirationDate || ''}
                  onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Details
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Additional Details</h2>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 resize-none ${errors.description ? 'border-red-500/50' : 'border-white/20'
                  }`}
                placeholder="Describe what this certification covers..."
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Verification Link */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Verification Link (optional)
              </label>
              <input
                type="url"
                value={formData.verificationLink || ''}
                onChange={(e) => handleInputChange('verificationLink', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50"
                placeholder="https://..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Skills/Tags</label>
              <TagInput
                tags={formData.tags || []}
                onAdd={(tag) => handleTagAdd('tags', tag)}
                onRemove={(tag) => handleTagRemove('tags', tag)}
                placeholder="Add relevant skills..."
              />
            </div>

            {/* Certificate Image/Badge */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Certificate Badge/Image
              </label>
              <FileUpload
                onUpload={(files) => handleFileUpload('imageUrl', files)}
                accept="image/*"
                multiple={false}
                className="mb-4"
              />
              {formData.imageUrl && (
                <div className="relative inline-block">
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Certificate"
                    className="w-32 h-32 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('imageUrl', '')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}

// Tag Input Component
interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}

function TagInput({ tags, onAdd, onRemove, placeholder = "Add tag..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAdd(inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50"
        placeholder={placeholder}
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="w-4 h-4 flex items-center justify-center text-purple-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}