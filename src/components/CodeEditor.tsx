import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PencilIcon, EyeIcon } from './icons';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#0f172a', // slate-900
      margin: 0,
      padding: '12px',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '14px',
      lineHeight: '1.5',
    }
  };

  const canEdit = !readOnly && onChange;

  return (
    <div className={`relative h-full ${className}`}>
      {canEdit && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-md transition-colors ${
              isEditing 
                ? 'bg-sky-600 hover:bg-sky-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
            title={isEditing ? '切换到查看模式' : '切换到编辑模式'}
          >
            {isEditing ? (
              <EyeIcon className="w-4 h-4" />
            ) : (
              <PencilIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {isEditing && canEdit ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-3 font-mono text-sm bg-slate-900 text-slate-300 border border-slate-700 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-sky-600 custom-scrollbar"
          aria-label="编辑HTML代码"
        />
      ) : (
        <div className="h-full overflow-auto custom-scrollbar">
          <SyntaxHighlighter
            language="html"
            style={customStyle}
            customStyle={{
              height: '100%',
              margin: 0,
              background: '#0f172a',
            }}
            wrapLongLines={true}
            showLineNumbers={true}
            lineNumberStyle={{
              color: '#64748b',
              fontSize: '12px',
              paddingRight: '12px',
              minWidth: '40px',
            }}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}; 