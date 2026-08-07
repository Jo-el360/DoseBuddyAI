import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Terminal, FileText } from 'lucide-react';
import { RepositoryFile } from '../types';

interface CodeExplorerViewProps {
  repoFiles: RepositoryFile[];
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ repoFiles }) => {
  const [selectedFile, setSelectedFile] = useState<RepositoryFile>(repoFiles[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredFiles = repoFiles.filter(
    (f) => filterCategory === 'all' || f.category === filterCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Explorer Header */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Folder className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold">DoseBuddy AI Codebase Workspace</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Complete, ready-to-run repository organized into <code className="text-sky-300">/backend</code> (FastAPI), <code className="text-sky-300">/frontend</code> (Flutter), <code className="text-sky-300">/firebase</code>, and <code className="text-sky-300">/docs</code>.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          {['all', 'backend', 'frontend', 'firebase', 'docs'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                filterCategory === cat
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Tree List */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Repository Tree ({filteredFiles.length} files)
          </h3>

          {filteredFiles.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelectedFile(f)}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                selectedFile.path === f.path
                  ? 'bg-sky-50 text-sky-900 border-2 border-sky-600 font-bold'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
            >
              <FileCode className={`w-5 h-5 flex-shrink-0 ${
                f.category === 'backend' ? 'text-emerald-600' :
                f.category === 'frontend' ? 'text-sky-600' :
                f.category === 'firebase' ? 'text-amber-600' : 'text-purple-600'
              }`} />
              <div className="truncate">
                <div className="text-sm truncate font-mono">{f.path}</div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{f.category}</span>
              </div>
            </button>
          ))}
        </div>

        {/* File Content Previewer */}
        <div className="md:col-span-2 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-[600px]">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-sm text-sky-200 font-bold">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy File'}</span>
            </button>
          </div>

          <div className="p-6 font-mono text-xs overflow-x-auto flex-1 leading-relaxed bg-slate-950 text-slate-200">
            <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
