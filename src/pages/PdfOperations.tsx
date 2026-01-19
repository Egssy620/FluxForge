import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Files, Upload, X, Merge, Split, FileOutput } from 'lucide-react';
import { AppConfig } from '../types/config';

interface Props {
  config: AppConfig;
}

type Operation = 'merge' | 'split' | 'extract';

export default function PdfOperations({ config }: Props) {
  const navigate = useNavigate();
  const [operation, setOperation] = useState<Operation>('merge');
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const operations = [
    { id: 'merge' as Operation, name: '結合', icon: Merge, desc: '複数のPDFを1つに' },
    { id: 'split' as Operation, name: '分割', icon: Split, desc: 'PDFを複数に分割' },
    { id: 'extract' as Operation, name: '抽出', icon: FileOutput, desc: '指定ページを抽出' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
              <Files size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">PDF 操作</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Drop zone area */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {files.length > 0 ? (
            <div className="flex-1 glass rounded-2xl p-5 overflow-y-auto">
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-white/5 hover:border-teal-400/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Files size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{(file.size / (1024 * 1024)).toFixed(1)} MB</div>
                    </div>
                    <button onClick={() => removeFile(index)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="flex-1 glass rounded-2xl border-2 border-dashed border-white/10 hover:border-teal-400 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-[var(--text-muted)]">
                <Upload size={32} />
              </div>
              <span className="text-[var(--text-muted)]">PDFファイルをドロップ</span>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="w-[360px] bg-[var(--bg-secondary)]/80 backdrop-blur border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold mb-1">操作設定</h2>
            <p className="text-xs text-[var(--text-muted)]">実行する操作を選択</p>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Operation selection */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">操作</label>
              <div className="space-y-2">
                {operations.map((op) => {
                  const Icon = op.icon;
                  return (
                    <button key={op.id} onClick={() => setOperation(op.id)} className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3 ${operation === op.id ? 'border-teal-400 bg-teal-400/10' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>
                      <Icon size={20} className={operation === op.id ? 'text-teal-400' : 'text-[var(--text-muted)]'} />
                      <div>
                        <div className="font-semibold">{op.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{op.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operation specific settings */}
            {operation === 'split' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">分割位置</label>
                <input type="text" placeholder="例: 5, 10, 15" className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                <p className="text-[10px] text-[var(--text-muted)] mt-2">カンマ区切りでページ番号を指定</p>
              </div>
            )}

            {operation === 'extract' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">抽出ページ</label>
                <input type="text" placeholder="例: 1-3, 5, 8-10" className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                <p className="text-[10px] text-[var(--text-muted)] mt-2">カンマ区切りでページ番号または範囲を指定</p>
              </div>
            )}

            {operation === 'merge' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">出力ファイル名</label>
                <input type="text" defaultValue="merged" className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
              </div>
            )}
          </div>

          {/* Execute button */}
          <div className="p-6 border-t border-white/5">
            <button disabled={files.length === 0} className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload size={18} />
              {operation === 'merge' ? '結合' : operation === 'split' ? '分割' : '抽出'}を実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
