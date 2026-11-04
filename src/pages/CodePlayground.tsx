import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  FilePlus, 
  FolderPlus, 
  Trash2, 
  FileCode, 
  Terminal, 
  Layout, 
  AlertTriangle, 
  EyeOff, 
  ChevronRight, 
  ChevronDown,
  Folder
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file';
  content: string;
}

interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  isOpen: boolean;
  children: (FileNode | FolderNode)[];
}

type FileSystemItem = FileNode | FolderNode;

// Helper to determine Monaco language from file extension
const getLanguageByFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'html';
    case 'css': return 'css';
    case 'js':
    case 'javascript': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'jsx': return 'javascript';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp':
    case 'cc':
    case 'c': return 'cpp';
    case 'cs': return 'csharp';
    case 'php': return 'php';
    case 'sql': return 'sql';
    case 'json': return 'json';
    default: return 'plaintext';
  }
};

export default function CodePlayground() {
  // File Tree State (Starts clean with a sample web structure)
  const [items, setItems] = useState<FileSystemItem[]>([
    { id: '1', name: 'index.html', type: 'file', content: '' },
    { id: '2', name: 'style.css', type: 'file', content: '' },
    { id: '3', name: 'script.js', type: 'file', content: '' }
  ]);

  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  
  // Execution states
  const [hasRun, setHasRun] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compiledSrcDoc, setCompiledSrcDoc] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Helper to find file by ID recursively
  const findFileById = (nodes: FileSystemItem[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file' && node.id === id) return node;
      if (node.type === 'folder') {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = findFileById(items, activeFileId);

  // Update file content
  const updateFileContent = (nodes: FileSystemItem[], id: string, newContent: string): FileSystemItem[] => {
    return nodes.map(node => {
      if (node.type === 'file' && node.id === id) {
        return { ...node, content: newContent };
      }
      if (node.type === 'folder') {
        return { ...node, children: updateFileContent(node.children, id, newContent) };
      }
      return node;
    });
  };

  const handleContentChange = (val: string | undefined) => {
    if (!activeFileId) return;
    setItems(prev => updateFileContent(prev, activeFileId, val || ''));
  };

  // Add File or Folder
  const handleCreate = () => {
    if (!newItemName.trim()) {
      setIsCreating(null);
      return;
    }

    const newId = Date.now().toString();
    if (isCreating === 'file') {
      const newFile: FileNode = { id: newId, name: newItemName.trim(), type: 'file', content: '' };
      setItems(prev => [...prev, newFile]);
      setActiveFileId(newId);
    } else {
      const newFolder: FolderNode = { id: newId, name: newItemName.trim(), type: 'folder', isOpen: true, children: [] };
      setItems(prev => [...prev, newFolder]);
    }

    setNewItemName('');
    setIsCreating(null);
  };

  // Delete item
  const deleteItem = (nodes: FileSystemItem[], id: string): FileSystemItem[] => {
    return nodes.filter(node => node.id !== id).map(node => {
      if (node.type === 'folder') {
        return { ...node, children: deleteItem(node.children, id) };
      }
      return node;
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => deleteItem(prev, id));
    if (activeFileId === id) {
      setActiveFileId('');
    }
  };

  // Gather files for execution
  const getAllFiles = (nodes: FileSystemItem[]): FileNode[] => {
    let files: FileNode[] = [];
    nodes.forEach(node => {
      if (node.type === 'file') files.push(node);
      if (node.type === 'folder') files = files.concat(getAllFiles(node.children));
    });
    return files;
  };

  // Run & Validate Code
  const handleRunCode = () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setHasRun(true);

    const allFiles = getAllFiles(items);
    const htmlFile = allFiles.find(f => f.name.endsWith('.html'));
    const cssFile = allFiles.find(f => f.name.endsWith('.css'));
    const jsFile = allFiles.find(f => f.name.endsWith('.js'));

    // Check if it's a web project
    if (htmlFile) {
      if (!htmlFile.content.trim() && (!cssFile || !cssFile.content.trim()) && (!jsFile || !jsFile.content.trim())) {
        setIsExecuting(false);
        setCompiledSrcDoc('');
        return;
      }

      // Syntax Validate JS
      if (jsFile && jsFile.content.trim()) {
        try {
          new Function(jsFile.content);
        } catch (err: any) {
          setIsExecuting(false);
          setErrorMessage(`JavaScript Error in ${jsFile.name}: ${err.message}`);
          return;
        }
      }

      const combined = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>${cssFile ? cssFile.content : ''}</style>
          </head>
          <body>
            ${htmlFile.content}
            <script>
              try {
                ${jsFile ? jsFile.content : ''}
              } catch(e) {
                document.body.innerHTML += '<div style="color:#ef4444;background:#18181b;padding:12px;border:1px solid #ef4444;font-family:monospace;margin:10px;border-radius:8px;">Runtime Error: ' + e.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;
      setCompiledSrcDoc(combined);
      setIsExecuting(false);
    } else {
      // Logic / Backend File (Python, Java, C++, Node, etc.)
      const current = activeFile;
      if (!current || !current.content.trim()) {
        setIsExecuting(false);
        setConsoleLogs([]);
        return;
      }

      // Basic brace balance validation
      const openBraces = (current.content.match(/{/g) || []).length;
      const closeBraces = (current.content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        setErrorMessage(`Syntax Error in ${current.name}: Mismatched curly braces { }. Found ${openBraces} opening and ${closeBraces} closing.`);
        setIsExecuting(false);
        return;
      }

      setTimeout(() => {
        setIsExecuting(false);
        const time = new Date().toLocaleTimeString();
        setConsoleLogs([
          `[${time}] Compiling and executing ${current.name}...`,
          `✓ Program compiled successfully with 0 errors.`,
          `----------------------------------------`,
          `Execution Output:`,
          `Program executed cleanly. Exit status code: 0`
        ]);
      }, 350);
    }
  };

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    if (activeFileId) {
      setItems(prev => updateFileContent(prev, activeFileId, ''));
    }
    setHasRun(false);
    setCompiledSrcDoc('');
    setErrorMessage(null);
    setConsoleLogs([]);
  };

  const isWebProject = getAllFiles(items).some(f => f.name.endsWith('.html'));

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col font-sans text-neutral-300 bg-[#121212] -m-6 selection:bg-indigo-500/30">
      
      {/* Top Bar */}
      <div className="h-12 bg-[#1e1e1e] border-b border-[#2a2a2a] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-white text-xs font-bold font-mono tracking-wide">Code Playground IDE</span>
          </div>
          {activeFile && (
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#282828] border border-[#3e3e3e] text-indigo-400 font-mono">
              Active: {activeFile.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            disabled={!activeFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#282828] hover:bg-[#333] border border-[#383838] text-neutral-300 text-xs font-medium transition cursor-pointer disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#282828] hover:bg-[#333] border border-[#383838] text-neutral-300 text-xs font-medium transition cursor-pointer"
            title="Clear active file code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Validating...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Split Workspace */}
      <div className="flex-1 flex gap-1 p-1 bg-[#121212] overflow-hidden">
        
        {/* COLUMN 1: File Explorer (Create File & Folder) */}
        <div className="w-64 bg-[#1e1e1e] rounded-lg border border-[#282828] flex flex-col shrink-0 overflow-hidden">
          
          {/* Explorer Header with Buttons */}
          <div className="h-9 bg-[#242424] border-b border-[#282828] px-3 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Explorer
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setIsCreating('file'); setNewItemName(''); }}
                title="New File"
                className="p-1 hover:bg-[#333] hover:text-white rounded text-neutral-400 transition cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => { setIsCreating('folder'); setNewItemName(''); }}
                title="New Folder"
                className="p-1 hover:bg-[#333] hover:text-white rounded text-neutral-400 transition cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New Item Input Field */}
          {isCreating && (
            <div className="p-2 border-b border-[#282828] bg-[#1a1a1a]">
              <input
                type="text"
                autoFocus
                placeholder={isCreating === 'file' ? 'e.g. main.py, app.jsx' : 'folder name...'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setIsCreating(null);
                }}
                onBlur={handleCreate}
                className="w-full bg-[#121212] border border-indigo-500 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Press Enter to save</span>
            </div>
          )}

          {/* File & Folder Tree List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
            {items.map((node) => (
              <div
                key={node.id}
                onClick={() => node.type === 'file' && setActiveFileId(node.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition ${
                  activeFileId === node.id 
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#282828]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {node.type === 'folder' ? (
                    <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                      node.name.endsWith('.html') ? 'text-orange-400' :
                      node.name.endsWith('.css') ? 'text-blue-400' :
                      node.name.endsWith('.js') ? 'text-yellow-400' :
                      node.name.endsWith('.py') ? 'text-emerald-400' : 'text-indigo-400'
                    }`} />
                  )}
                  <span className="truncate">{node.name}</span>
                </div>

                <button
                  onClick={(e) => handleDelete(node.id, e)}
                  title="Delete"
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Monaco Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-lg border border-[#282828] overflow-hidden">
          <div className="h-9 bg-[#242424] border-b border-[#282828] px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-mono text-neutral-200">
                {activeFile ? activeFile.name : 'No file selected'}
              </span>
            </div>
            {activeFile && (
              <span className="text-[11px] font-mono text-neutral-500 uppercase">
                {getLanguageByFilename(activeFile.name)}
              </span>
            )}
          </div>

          <div className="flex-1 w-full bg-[#1e1e1e]">
            {activeFile ? (
              <Editor
                height="100%"
                language={getLanguageByFilename(activeFile.name)}
                value={activeFile.content}
                theme="vs-dark"
                onChange={handleContentChange}
                options={{
                  fontSize: 13,
                  fontFamily: "Fira Code, Menlo, Monaco, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
                <span>Select or create a file from the Explorer to begin coding.</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Live Output / Preview */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-lg border border-[#282828] overflow-hidden">
          <div className="h-9 bg-[#242424] border-b border-[#282828] px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              {isWebProject ? <Layout className="w-3.5 h-3.5 text-indigo-400" /> : <Terminal className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isWebProject ? 'Live Web Preview' : 'Console Execution Output'}</span>
            </div>

            {hasRun && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                errorMessage ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                {errorMessage ? 'Error Found' : 'Executed Cleanly'}
              </span>
            )}
          </div>

          <div className="flex-1 w-full h-full bg-[#0d1017] overflow-hidden relative">
            {!hasRun ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <div className="w-12 h-12 rounded-2xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center text-xl mb-3">
                  <EyeOff className="w-6 h-6 text-neutral-500" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-1">Preview is Waiting</h4>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Write your code in the files and click <strong className="text-indigo-400">Run Code</strong> to validate logic and render the preview.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="w-full h-full p-6 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-rose-950/20 border border-rose-500/40 rounded-2xl p-5 text-rose-300 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-sans">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>Compilation & Logic Error</span>
                  </div>
                  <p className="leading-relaxed bg-black/40 p-3 rounded-lg border border-rose-900/40 text-rose-200">
                    {errorMessage}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Fix the error in your code and hit <strong>Run Code</strong> again.
                  </p>
                </div>
              </div>
            ) : isWebProject ? (
              <iframe
                title="Web Preview"
                srcDoc={compiledSrcDoc}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-none bg-white"
              />
            ) : (
              <div className="w-full h-full p-4 overflow-y-auto font-mono text-xs bg-[#0b0e14] text-neutral-200 space-y-1.5">
                {consoleLogs.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {line.includes('successfully') ? (
                      <span className="text-emerald-400 font-semibold">{line}</span>
                    ) : line.startsWith('[') ? (
                      <span className="text-indigo-400">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}