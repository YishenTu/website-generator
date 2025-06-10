import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { PencilIcon, EyeIcon } from './icons';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  autoScrollToBottom?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className = "",
  autoScrollToBottom = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = !readOnly && !!onChange;
  const editorRef = useRef<EditorView | null>(null);

  // Auto-scroll to bottom when content changes and autoScrollToBottom is enabled
  useEffect(() => {
    if (autoScrollToBottom && editorRef.current && value) {
      const view = editorRef.current;
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        const lastLine = view.state.doc.lines;
        if (lastLine > 0) {
          view.dispatch({
            selection: { anchor: view.state.doc.length },
            effects: EditorView.scrollIntoView(view.state.doc.length)
          });
        }
      });
    }
  }, [value, autoScrollToBottom]);

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

      <div className="h-full overflow-auto">
        <CodeMirror
          value={value}
          onChange={(val) => {
            if (isEditing && canEdit && onChange) {
              onChange(val);
            }
          }}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          editable={isEditing && canEdit}
          readOnly={!isEditing || readOnly || !onChange}
          extensions={[
            html(),
            EditorView.theme({
              '.cm-scroller': {
                overflow: 'auto',
                maxHeight: '100%'
              },
              '.cm-content': {
                padding: '12px'
              }
            })
          ]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: false,
            scrollPastEnd: true
          }}
          style={{
            height: '100%',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        />
      </div>
    </div>
  );
}; 