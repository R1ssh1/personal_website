'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import RichTextEditor from './RichTextEditor';
import FileUpload from './FileUpload';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  liveDemoLink?: string;
  images: string[];
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    techStack: initialData?.techStack || [],
    githubLink: initialData?.githubLink || '',
    liveDemoLink: initialData?.liveDemoLink || '',
    images: initialData?.images || [],
  });

  const [techStackInput, setTechStackInput] = useState<string>(
    initialData?.techStack?.join(', ') || ''
  );

  const [projectImages, setProjectImages] = useState<UploadedFile[]>(
    (initialData?.images || []).map((url, index) => ({
      url,
      filename: `Project Image ${index + 1}`,
      size: 0,
      type: 'image/jpeg',
    }))
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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.techStack.length === 0) {
      newErrors.techStack = 'At least one technology is required';
    }

    if (formData.githubLink && !isValidUrl(formData.githubLink)) {
      newErrors.githubLink = 'Please enter a valid GitHub URL';
    }

    if (formData.liveDemoLink && !isValidUrl(formData.liveDemoLink)) {
      newErrors.liveDemoLink = 'Please enter a valid demo URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTechStackChange = (value: string) => {
    setTechStackInput(value);
    const techStack = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    handleInputChange('techStack', techStack);
  };

  const handleImagesUpload = useCallback((files: UploadedFile[]) => {
    const newImages = [...projectImages, ...files];
    setProjectImages(newImages);
    const imageUrls = newImages.map(img => img.url);
    handleInputChange('images', imageUrls);
    setUploadError('');
  }, [projectImages]);

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = projectImages.filter((_, i) => i !== index);
    setProjectImages(newImages);
    const imageUrls = newImages.map(img => img.url);
    handleInputChange('images', imageUrls);
  }, [projectImages]);

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

      // Reset form after successful submission for new projects
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          techStack: [],
          githubLink: '',
          liveDemoLink: '',
          images: [],
        });
        setTechStackInput('');
        setProjectImages([]);
        setUploadError('');
        setErrors({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={`project-form ${className}`}>
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
            placeholder="Enter project title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <div className={`border rounded-lg overflow-hidden ${errors.description ? 'border-red-500' : 'border-gray-300'
            }`}>
            <RichTextEditor
              value={formData.description}
              onChange={(description) => handleInputChange('description', description)}
              placeholder="Describe your project in detail..."
              disabled={isSubmitting}
              height={300}
            />
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Tech Stack */}
        <div>
          <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
            Tech Stack *
          </label>
          <input
            type="text"
            id="techStack"
            value={techStackInput}
            onChange={(e) => handleTechStackChange(e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${errors.techStack ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter technologies separated by commas (e.g., React, Node.js, MongoDB)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple technologies with commas
          </p>
          {errors.techStack && (
            <p className="mt-1 text-sm text-red-600">{errors.techStack}</p>
          )}

          {/* Tech Stack Preview */}
          {formData.techStack.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* GitHub Link */}
        <div>
          <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository
          </label>
          <input
            type="url"
            id="githubLink"
            value={formData.githubLink}
            onChange={(e) => handleInputChange('githubLink', e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${errors.githubLink ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="https://github.com/username/repository"
          />
          {errors.githubLink && (
            <p className="mt-1 text-sm text-red-600">{errors.githubLink}</p>
          )}
        </div>

        {/* Live Demo Link */}
        <div>
          <label htmlFor="liveDemoLink" className="block text-sm font-medium text-gray-700 mb-2">
            Live Demo
          </label>
          <input
            type="url"
            id="liveDemoLink"
            value={formData.liveDemoLink}
            onChange={(e) => handleInputChange('liveDemoLink', e.target.value)}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${errors.liveDemoLink ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="https://your-project-demo.com"
          />
          {errors.liveDemoLink && (
            <p className="mt-1 text-sm text-red-600">{errors.liveDemoLink}</p>
          )}
        </div>

        {/* Project Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Images
          </label>

          <FileUpload
            onUpload={handleImagesUpload}
            onError={handleUploadError}
            multiple={true}
            accept="image/*"
            folder="project-images"
            disabled={isSubmitting}
          />

          {/* Image Preview */}
          {projectImages.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectImages.map((image, index) => (
                <motion.div
                  key={`${image.url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Remove image"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(image.url, '_blank')}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-800 bg-opacity-50 text-white rounded-full text-xs hover:bg-opacity-70 transition-colors"
                    title="View image"
                  >
                    👁
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
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
                : (initialData ? 'Update Project' : 'Create Project')
              }
            </span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}