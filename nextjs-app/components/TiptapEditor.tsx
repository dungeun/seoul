'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TiptapEditor({ value, onChange, placeholder, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-2">
        {/* Text formatting */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="굵게"
          >
            <strong>굵게</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="기울임"
          >
            <em>기울임</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            title="취소선"
          >
            <s>취소선</s>
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-l pl-2">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('heading', { level }) ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title={`제목 ${level}`}
            >
              제목{level}
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-l pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="글머리 기호"
          >
            • 목록
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="번호 매기기"
          >
            1. 목록
          </button>
        </div>

        {/* Block formatting */}
        <div className="flex gap-1 border-l pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            title="인용문"
          >
            " 인용
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-3 py-1 rounded text-sm hover:bg-gray-100"
            title="구분선"
          >
            — 구분선
          </button>
        </div>

        {/* History */}
        <div className="flex gap-1 border-l pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="px-3 py-1 rounded text-sm hover:bg-gray-100"
            disabled={!editor.can().chain().focus().undo().run()}
            title="실행 취소"
          >
            ↶ 취소
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="px-3 py-1 rounded text-sm hover:bg-gray-100"
            disabled={!editor.can().chain().focus().redo().run()}
            title="다시 실행"
          >
            ↷ 다시
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}