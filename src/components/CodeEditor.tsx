import React, { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

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
    <div className={`h-full ${className}`}>
      <div className="h-full overflow-auto rounded-md">
        <CodeMirror
          value={value}
          onChange={(val) => {
            if (onChange && !readOnly) {
              onChange(val);
            }
          }}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          editable={!readOnly && !!onChange}
          readOnly={readOnly || !onChange}
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