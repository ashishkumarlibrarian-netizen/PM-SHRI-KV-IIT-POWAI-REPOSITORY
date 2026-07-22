import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[16rem] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 ${className || ''}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Heading 1"
          type="button"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Heading 2"
          type="button"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Bold"
          type="button"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Italic"
          type="button"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('underline') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Underline"
          type="button"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Bullet List"
          type="button"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Ordered List"
          type="button"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        <button
          onClick={setLink}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700 text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}
          title="Link"
          type="button"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addImage}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Image"
          type="button"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="flex-grow overflow-y-auto" />
    </div>
  );
}
