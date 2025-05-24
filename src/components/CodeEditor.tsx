import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

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