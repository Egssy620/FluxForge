import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive as ArchiveIcon, Upload, X, FolderOpen, FolderArchive } from 'lucide-react';
import { AppConfig } from '../types/config';

interface Props {
  config: AppConfig;
}

type Mode = 'extract' | 'compress';

export default function Archive({ config }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('extract');
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState('zip');
  const [password, setPassword] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (mode === 'extract') {
      const archiveFiles = droppedFiles.filter(f => 
        /\.(zip|7z|rar)$/i.test(f.name)
      );
      setFiles(archiveFiles);
    } else {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <ArchiveIcon size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">圧縮・展開</span>
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
                  <div key={index} className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-white/5 hover:border-purple-400/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ArchiveIcon size={18} className="text-white" />
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
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="flex-1 glass rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-400 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-[var(--text-muted)]">
                <Upload size={32} />
              </div>
              <span className="text-[var(--text-muted)]">
                {mode === 'extract' ? '圧縮ファイルをドロップ (ZIP, 7z, RAR)' : 'ファイルをドロップ'}
              </span>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="w-[360px] bg-[var(--bg-secondary)]/80 backdrop-blur border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold mb-1">操作設定</h2>
            <p className="text-xs text-[var(--text-muted)]">展開または圧縮を選択</p>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">モード</label>
              <div className="flex gap-2">
                <button onClick={() => { setMode('extract'); setFiles([]); }} className={`flex-1 py-3 rounded-xl text-sm transition-all border flex items-center justify-center gap-2 ${mode === 'extract' ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>
                  <FolderOpen size={16} />
                  展開
                </button>
                <button onClick={() => { setMode('compress'); setFiles([]); }} className={`flex-1 py-3 rounded-xl text-sm transition-all border flex items-center justify-center gap-2 ${mode === 'compress' ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>
                  <FolderArchive size={16} />
                  圧縮
                </button>
              </div>
            </div>

            {/* Compress format */}
            {mode === 'compress' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">圧縮形式</label>
                <div className="flex gap-2">
                  <button onClick={() => setFormat('zip')} className={`flex-1 py-3 rounded-xl text-sm transition-all border ${format === 'zip' ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>ZIP</button>
                  <button onClick={() => setFormat('7z')} className={`flex-1 py-3 rounded-xl text-sm transition-all border ${format === '7z' ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>7z</button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">
                パスワード（任意）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'extract' ? '展開パスワード' : '圧縮パスワード'}
                className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Output name for compress */}
            {mode === 'compress' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">出力ファイル名</label>
                <input type="text" defaultValue="archive" className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
              </div>
            )}
          </div>

          {/* Execute button */}
          <div className="p-6 border-t border-white/5">
            <button disabled={files.length === 0} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {mode === 'extract' ? <FolderOpen size={18} /> : <FolderArchive size={18} />}
              {mode === 'extract' ? '展開' : '圧縮'}を実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
