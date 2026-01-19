import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { AppConfig, ConvertResult, PdfInfo } from '../types/config';
import ExportModal from '../components/ExportModal';

interface Props {
  config: AppConfig;
}

interface FileItem {
  path: string;
  name: string;
  size: number;
  pageCount: number;
}

const formats = [
  { id: 'jpg', name: 'JPG', desc: '圧縮画像' },
  { id: 'png', name: 'PNG', desc: '高品質画像' },
  { id: 'svg', name: 'SVG', desc: 'ベクター形式' },
  { id: 'webp', name: 'WebP', desc: 'Web最適化' },
];

const dpiOptions = [
  { value: 72, label: '72 DPI（Web向け）' },
  { value: 150, label: '150 DPI（標準）' },
  { value: 300, label: '300 DPI（印刷品質）' },
  { value: 600, label: '600 DPI（高品質）' },
];

export default function PdfConvert({ config }: Props) {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [format, setFormat] = useState('jpg');
  const [dpi, setDpi] = useState(config.default_pdf_dpi);
  const [pageMode, setPageMode] = useState<'all' | 'select'>('all');
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportResult, setExportResult] = useState<ConvertResult | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    await addFiles(droppedFiles);
  };

  const addFiles = async (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    
    for (const file of pdfFiles) {
      try {
        const info = await invoke<PdfInfo>('get_pdf_info', { path: (file as any).path });
        setFiles(prev => [...prev, {
          path: (file as any).path || file.name,
          name: file.name,
          size: file.size,
          pageCount: info.page_count,
        }]);
      } catch {
        setFiles(prev => [...prev, {
          path: (file as any).path || file.name,
          name: file.name,
          size: file.size,
          pageCount: 1,
        }]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  const parsePageRange = (range: string): number[] => {
    const pages: number[] = [];
    const parts = range.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) pages.push(i);
      } else {
        const num = parseInt(trimmed);
        if (!isNaN(num)) pages.push(num);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const paths = files.map(f => f.path);
      const pages = pageMode === 'select' && pageRange ? parsePageRange(pageRange) : undefined;

      let result: ConvertResult;
      if (format === 'svg') {
        result = await invoke<ConvertResult>('convert_pdf_to_svg', { paths, pages });
      } else {
        result = await invoke<ConvertResult>('convert_pdf_to_images', {
          paths,
          options: { format, dpi, pages },
        });
      }
      setExportResult(result);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">PDF 変換</span>
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
                  <div key={index} className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-white/5 hover:border-red-400/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-[var(--text-muted)] flex gap-3">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.pageCount} ページ</span>
                      </div>
                    </div>
                    <button onClick={() => removeFile(index)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="flex-1 glass rounded-2xl border-2 border-dashed border-white/10 hover:border-red-400 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-[var(--text-muted)]">
                <Upload size={32} />
              </div>
              <span className="text-[var(--text-muted)]">PDFファイルをドロップ</span>
              <span className="text-xs text-[var(--text-muted)] opacity-60">または クリックして選択</span>
            </div>
          )}

          {files.length > 0 && (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="h-28 glass rounded-2xl border-2 border-dashed border-white/10 hover:border-red-400 flex items-center justify-center gap-3 cursor-pointer transition-colors">
              <Upload size={20} className="text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">PDFを追加</span>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="w-[360px] bg-[var(--bg-secondary)]/80 backdrop-blur border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold mb-1">変換設定</h2>
            <p className="text-xs text-[var(--text-muted)]">出力形式とオプションを選択</p>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Format selection */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">出力形式</label>
              <div className="grid grid-cols-2 gap-3">
                {formats.map((f) => (
                  <button key={f.id} onClick={() => setFormat(f.id)} className={`p-4 rounded-xl text-center transition-all border-2 ${format === f.id ? 'border-red-400 bg-red-400/10' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* DPI selection */}
            {format !== 'svg' && (
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">解像度</label>
                <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-red-400">
                  {dpiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Page selection */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-3">ページ選択</label>
              <div className="flex gap-2">
                <button onClick={() => setPageMode('all')} className={`flex-1 py-3 rounded-xl text-sm transition-all border ${pageMode === 'all' ? 'border-red-400 bg-red-400/10 text-red-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>すべて</button>
                <button onClick={() => setPageMode('select')} className={`flex-1 py-3 rounded-xl text-sm transition-all border ${pageMode === 'select' ? 'border-red-400 bg-red-400/10 text-red-400' : 'border-white/5 bg-[var(--bg-tertiary)] hover:border-white/20'}`}>指定</button>
              </div>
              {pageMode === 'select' && (
                <div className="mt-3">
                  <input type="text" value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder="例: 1-3, 5, 8-10" className="w-full h-10 px-3 bg-[var(--bg-tertiary)] border border-white/5 rounded-lg text-sm focus:outline-none focus:border-red-400" />
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">カンマ区切りでページ番号または範囲を指定</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">変換サマリー</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">ファイル数</span><span className="font-medium">{files.length} ファイル</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">総ページ数</span><span className="font-medium">{totalPages} ページ</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">出力形式</span><span className="font-medium">{format.toUpperCase()} {format !== 'svg' && `(${dpi} DPI)`}</span></div>
              </div>
            </div>
          </div>

          {/* Convert button */}
          <div className="p-6 border-t border-white/5">
            <button onClick={handleConvert} disabled={files.length === 0 || isProcessing} className="w-full py-4 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Upload size={18} />変換を開始（{totalPages}ファイル生成）</>}
            </button>
          </div>
        </div>
      </div>

      {exportResult && <ExportModal result={exportResult} onClose={() => setExportResult(null)} />}
    </div>
  );
}
