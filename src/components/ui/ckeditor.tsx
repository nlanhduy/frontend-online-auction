import 'ckeditor5/ckeditor5.css'

import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Underline,
} from 'ckeditor5'

import { CKEditor } from '@ckeditor/ckeditor5-react'

interface RichTextEditorProps {
  value?: string
  onChange?: (data: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
}: RichTextEditorProps) {
  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor {
          width: 100%;
        }

        .rich-text-editor .ck-editor {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.2s;
          background: var(--color-background);
        }

        .rich-text-editor .ck-editor:focus-within {
          outline: none;
          border-color: var(--color-ring);
          box-shadow: 0 0 0 3px oklch(from var(--color-ring) l c h / 0.1);
        }

        .rich-text-editor .ck.ck-toolbar {
          background: var(--color-background);
          border: none;
          border-bottom: 1px solid var(--color-border);
          padding: 0.5rem;
          flex-wrap: wrap !important;
        }

        .rich-text-editor .ck.ck-toolbar .ck-toolbar__items {
          gap: 0.25rem;
          flex-wrap: wrap !important;
        }

        .rich-text-editor .ck.ck-button {
          border-radius: var(--radius-md);
          padding: 0.375rem;
          transition: all 0.2s;
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-button:hover {
          background: var(--color-muted);
        }

        .rich-text-editor .ck.ck-button.ck-on {
          background: var(--color-accent);
          color: var(--color-accent-foreground);
        }

        .rich-text-editor .ck.ck-button:active {
          background: var(--color-muted);
        }

        .rich-text-editor .ck.ck-button .ck-icon {
          color: inherit;
        }

        .rich-text-editor .ck.ck-editor__editable {
          min-height: 200px;
          max-height: 500px;
          padding: 1rem;
          padding-top: 0.75rem;
          background: var(--color-background);
          border: none !important;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-editor__editable:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        .rich-text-editor .ck.ck-editor__editable p {
          margin: 0 0 0.5rem 0;
        }

        .rich-text-editor .ck.ck-editor__editable h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-editor__editable h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem 0;
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-editor__editable ul,
        .rich-text-editor .ck.ck-editor__editable ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .rich-text-editor .ck.ck-editor__editable blockquote {
          border-left: 3px solid var(--color-border);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--color-muted-foreground);
          font-style: italic;
        }

        .rich-text-editor .ck.ck-editor__editable a {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .rich-text-editor .ck.ck-dropdown {
          border-radius: var(--radius-md);
        }

        .rich-text-editor .ck.ck-dropdown__button {
          border-radius: var(--radius-md);
          transition: all 0.2s;
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-dropdown__button:hover {
          background: var(--color-muted);
        }

        .rich-text-editor .ck.ck-dropdown__panel {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          background: var(--color-popover);
        }

        .rich-text-editor .ck.ck-list__item {
          border-radius: var(--radius-md);
          color: var(--color-popover-foreground);
        }

        .rich-text-editor .ck.ck-list__item:hover {
          background: var(--color-muted);
        }

        .rich-text-editor .ck.ck-toolbar__separator {
          background: var(--color-border);
          width: 1px;
          margin: 0 0.25rem;
        }

        .rich-text-editor .ck.ck-input {
          background: var(--color-input);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-input:focus {
          border-color: var(--color-ring);
          outline: none;
        }

        .rich-text-editor .ck.ck-label {
          color: var(--color-foreground);
        }

        .rich-text-editor .ck.ck-editor__editable.ck-placeholder::before {
          color: var(--color-muted-foreground);
        }

        .rich-text-editor .ck-editor__main {
          border: 1px solid var(--color-border);
        }

        .rich-text-editor .ck.ck-toolbar-dropdown > .ck-dropdown__panel {
          max-width: none !important;
        }

        .rich-text-editor .ck.ck-toolbar-dropdown {
          display: none !important;
        }
      `}</style>

      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Heading,
            Link,
            List,
            BlockQuote,
            Alignment,
            FontSize,
            FontColor,
            FontBackgroundColor,
          ],
          toolbar: {
            items: [
              'heading',
              '|',
              'fontSize',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'link',
              'bulletedList',
              'numberedList',
              '|',
              'alignment',
              'blockQuote',
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              {
                model: 'heading1',
                view: 'h1',
                title: 'Heading 1',
                class: 'ck-heading_heading1',
              },
              {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2',
                class: 'ck-heading_heading2',
              },
              {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3',
                class: 'ck-heading_heading3',
              },
            ],
          },
          fontSize: {
            options: [10, 12, 14, 16, 18, 20, 24],
          },
          placeholder,
        }}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData()
          onChange?.(data)
        }}
      />
    </div>
  )
}
