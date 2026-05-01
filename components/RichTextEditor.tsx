'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
}

function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-0.5 inline-block" />
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ blockquote: false, code: false, codeBlock: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    immediatelyRender: false,
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-[280px] px-4 py-3 text-sm text-gray-800 focus:outline-none font-[inherit] leading-relaxed',
      },
    },
  })

  /* sync external value changes (e.g. initial load from server) */
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const e = editor

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

        {/* Undo / Redo */}
        <Btn title="Undo" onClick={() => e.chain().focus().undo().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-1" />
          </svg>
        </Btn>
        <Btn title="Redo" onClick={() => e.chain().focus().redo().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 14l5-5-5-5M19 9H9a6 6 0 000 12h1" />
          </svg>
        </Btn>

        <Divider />

        {/* Bold / Italic / Underline */}
        <Btn title="Bold (Ctrl+B)" active={e.isActive('bold')} onClick={() => e.chain().focus().toggleBold().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
        </Btn>
        <Btn title="Italic (Ctrl+I)" active={e.isActive('italic')} onClick={() => e.chain().focus().toggleItalic().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
          </svg>
        </Btn>
        <Btn title="Underline (Ctrl+U)" active={e.isActive('underline')} onClick={() => e.chain().focus().toggleUnderline().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 3v7a6 6 0 0012 0V3M4 21h16"/>
          </svg>
        </Btn>

        <Divider />

        {/* Align */}
        <Btn title="Rata kiri" active={e.isActive({ textAlign: 'left' })} onClick={() => e.chain().focus().setTextAlign('left').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </Btn>
        <Btn title="Rata tengah" active={e.isActive({ textAlign: 'center' })} onClick={() => e.chain().focus().setTextAlign('center').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </Btn>
        <Btn title="Rata kanan" active={e.isActive({ textAlign: 'right' })} onClick={() => e.chain().focus().setTextAlign('right').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
          </svg>
        </Btn>
        <Btn title="Rata penuh" active={e.isActive({ textAlign: 'justify' })} onClick={() => e.chain().focus().setTextAlign('justify').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn title="Bullet list" active={e.isActive('bulletList')} onClick={() => e.chain().focus().toggleBulletList().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="4" cy="7" r="1.5" fill="currentColor" stroke="none"/><line x1="8" y1="7" x2="21" y2="7"/>
            <circle cx="4" cy="13" r="1.5" fill="currentColor" stroke="none"/><line x1="8" y1="13" x2="21" y2="13"/>
            <circle cx="4" cy="19" r="1.5" fill="currentColor" stroke="none"/><line x1="8" y1="19" x2="21" y2="19"/>
          </svg>
        </Btn>
        <Btn title="Numbered list" active={e.isActive('orderedList')} onClick={() => e.chain().focus().toggleOrderedList().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1v4M4 6 3 7M3 10h2"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h2v1l-2 1h2v1H3"/>
          </svg>
        </Btn>

        <Divider />

        {/* Indent / Outdent via list sink/lift */}
        <Btn title="Indent" onClick={() => e.chain().focus().sinkListItem('listItem').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            <line x1="7" y1="12" x2="21" y2="12"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l4 3-4 3"/>
          </svg>
        </Btn>
        <Btn title="Outdent" onClick={() => e.chain().focus().liftListItem('listItem').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            <line x1="7" y1="12" x2="21" y2="12"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 9l-4 3 4 3"/>
          </svg>
        </Btn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
