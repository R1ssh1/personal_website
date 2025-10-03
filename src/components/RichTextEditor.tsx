'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  height = 400,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="ylhbn2a2mfv3w3m6jsnsnnfj6hutz9aixtwnqx6wjinxotth"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height: height,
          menubar: true,
          plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount advlist preview fullscreen insertdatetime help',
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | codesample | fullscreen preview help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
            pre {
              background-color: #f4f4f4;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 8px 12px;
              font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            }
          `,
          placeholder: placeholder,

          // Image upload configuration
          images_upload_handler: async (blobInfo: any, progress: (percent: number) => void) => {
            return new Promise(async (resolve, reject) => {
              try {
                const formData = new FormData();
                formData.append('files', blobInfo.blob(), blobInfo.filename());
                formData.append('folder', 'blog-images');

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  reject(errorData.error || 'Upload failed');
                  return;
                }

                const data = await response.json();
                if (data.success && data.file) {
                  resolve(data.file.url);
                } else {
                  reject(data.error || 'Upload failed');
                }
              } catch (error) {
                reject(error instanceof Error ? error.message : 'Upload failed');
              }
            });
          },

          // Image upload validation
          images_upload_base_path: '',
          images_upload_credentials: false,
          automatic_uploads: true,

          // File picker for images
          file_picker_types: 'image',
          file_picker_callback: (callback: (url: string, meta?: { alt?: string; title?: string }) => void, value: string, meta: any) => {
            // Create a file input element
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            input.onchange = async function () {
              const file = (this as HTMLInputElement).files?.[0];
              if (!file) return;

              try {
                const formData = new FormData();
                formData.append('files', file);
                formData.append('folder', 'blog-images');

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error('Upload failed');
                }

                const data = await response.json();
                if (data.success && data.file) {
                  callback(data.file.url, { alt: file.name });
                } else {
                  throw new Error(data.error || 'Upload failed');
                }
              } catch (error) {
                console.error('File upload error:', error);
                // Could show a toast notification here
              }
            };

            input.click();
          },

          // Code sample languages
          codesample_languages: [
            { text: 'HTML/XML', value: 'markup' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'TypeScript', value: 'typescript' },
            { text: 'CSS', value: 'css' },
            { text: 'Python', value: 'python' },
            { text: 'Java', value: 'java' },
            { text: 'C++', value: 'cpp' },
            { text: 'C#', value: 'csharp' },
            { text: 'PHP', value: 'php' },
            { text: 'Ruby', value: 'ruby' },
            { text: 'Go', value: 'go' },
            { text: 'Rust', value: 'rust' },
            { text: 'SQL', value: 'sql' },
            { text: 'JSON', value: 'json' },
            { text: 'Bash', value: 'bash' },
          ],

          // Paste options
          paste_data_images: true,
          paste_as_text: false,

          // Link options
          link_assume_external_targets: true,
          target_list: [
            { title: 'Same window', value: '' },
            { title: 'New window', value: '_blank' },
          ],

          // Accessibility
          a11y_advanced_options: true,

          // Advanced options
          browser_spellcheck: true,
          contextmenu: 'link image table',

          // Skin and content CSS
          skin: 'oxide',
          content_css: 'default',

          // Performance
          convert_urls: false,
          relative_urls: false,

          // Custom styles
          style_formats: [
            {
              title: 'Headings', items: [
                { title: 'Heading 1', format: 'h1' },
                { title: 'Heading 2', format: 'h2' },
                { title: 'Heading 3', format: 'h3' },
                { title: 'Heading 4', format: 'h4' },
                { title: 'Heading 5', format: 'h5' },
                { title: 'Heading 6', format: 'h6' }
              ]
            },
            {
              title: 'Inline', items: [
                { title: 'Bold', format: 'bold' },
                { title: 'Italic', format: 'italic' },
                { title: 'Underline', format: 'underline' },
                { title: 'Strikethrough', format: 'strikethrough' },
                { title: 'Superscript', format: 'superscript' },
                { title: 'Subscript', format: 'subscript' },
                { title: 'Code', format: 'code' }
              ]
            },
            {
              title: 'Blocks', items: [
                { title: 'Paragraph', format: 'p' },
                { title: 'Blockquote', format: 'blockquote' },
                { title: 'Div', format: 'div' },
                { title: 'Pre', format: 'pre' }
              ]
            }
          ]
        }}
      />
    </div>
  );
}