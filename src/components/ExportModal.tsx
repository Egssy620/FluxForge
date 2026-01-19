import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Check, Copy, Folder, FileText } from 'lucide-react';
import { ConvertResult } from '../types/config';

interface Props {
  result: ConvertResult;
  onClose: () => void;
}

export default function ExportModal({ result, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(result.output_folder);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFolder = async () => {
    try {
      await invoke('open_folder', { path: result.output_folder });
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const fileCount = result.output_files.length;
  const firstFile = result.output_files[0]?.split(/[/\\]/).pop() || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="h-[3px] bg-gradient-to-r from-accent-primary to-success" />

        {/* Header */}
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-success to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-success/30 animate-in slide-up">
            <Check size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-semibold mb-1">エクスポート完了</h2>
          <p className="text-sm text-[var(--text-muted)]">ファイルが正常に保存されました</p>
        </div>

        {/* File info */}
        <div className="mx-6 mb-6 bg-[var(--bg-tertiary)] rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4 group">
            <div className="w-9 h-9 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] transition-colors group-hover:text-accent-primary group-hover:bg-accent-primary/10">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">ファイル名</div>
              <div className="text-sm font-mono truncate">
                {fileCount > 1 ? `${firstFile} 他${fileCount - 1}件` : firstFile}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 group">
            <div className="w-9 h-9 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] transition-colors group-hover:text-accent-primary group-hover:bg-accent-primary/10">
              <Folder size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">保存先</div>
              <div className="text-sm font-mono truncate">{result.output_folder}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleCopyPath}
            className="flex-1 py-3 rounded-xl glass flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/5 transition-all relative overflow-hidden"
          >
            <span className={`flex items-center gap-2 transition-all duration-300 ${copied ? 'opacity-0 translate-y-full' : 'opacity-100'}`}>
              <Copy size={14} />
              パスをコピー
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-2 bg-success text-white transition-all duration-300 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
              <Check size={14} />
              コピーしました
            </span>
          </button>
          <button
            onClick={handleOpenFolder}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-emerald-400 text-white flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-success/30 hover:-translate-y-0.5 hover:shadow-xl transition-all"
          >
            <Folder size={14} />
            フォルダを開く
          </button>
        </div>

        {/* Close button area */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
