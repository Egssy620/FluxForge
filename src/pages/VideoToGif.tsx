import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Upload, Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Box } from 'lucide-react';
import { AppConfig } from '../types/config';

interface Props {
  config: AppConfig;
}

export default function VideoToGif({ config }: Props) {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(270);
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState(3);
  const [outputName, setOutputName] = useState('output');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /\.(mp4|avi|mov|webm)$/i.test(file.name)) {
      setVideoFile(file);
      setOutputName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const duration = endTime - startTime;
  const frameCount = Math.round(duration * fps);
  const estimatedSize = ((width * height * 0.12 * frameCount) / (1024 * 1024)).toFixed(1);

  const resolutionPresets = [
    { label: 'オリジナル (1920×1080)', w: 1920, h: 1080 },
    { label: '半分 (960×540)', w: 960, h: 540 },
    { label: '1/4 (480×270)', w: 480, h: 270 },
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
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Video size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">動画 → GIF 変換</span>
          </div>
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all relative overflow-hidden group">
          <Upload size={16} className="transition-transform group-hover:-translate-y-0.5" />
          エクスポート
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video preview area */}
        <div className="flex-1 flex flex-col bg-[var(--bg-secondary)]">
          {/* Video container */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {videoFile ? (
              <video className="max-w-[80%] max-h-full rounded-lg" />
            ) : (
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="w-[80%] max-w-[800px] aspect-video bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-xl border-2 border-dashed border-white/10 hover:border-amber-400 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors">
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-[var(--text-muted)]">
                  <Video size={32} />
                </div>
                <span className="text-[var(--text-muted)]">動画ファイルをドロップ</span>
                <span className="text-xs text-[var(--text-muted)] opacity-60">MP4, AVI, MOV, WebM</span>
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-3 py-4 bg-[var(--bg-secondary)]/80 border-t border-white/5">
            <button className="w-11 h-11 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group">
              <SkipBack size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <button className="w-11 h-11 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group">
              <SkipForward size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="font-mono text-sm text-[var(--text-secondary)] min-w-[120px] text-center">
              00:00:00 / 00:02:00
            </span>
          </div>

          {/* Timeline */}
          <div className="px-4 pb-4 bg-[#0d0d12]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">タイムライン</span>
              <div className="flex gap-2">
                <button className="w-7 h-7 rounded-md glass flex items-center justify-center text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] hover:scale-110 transition-all">
                  <ZoomOut size={14} />
                </button>
                <button className="w-7 h-7 rounded-md glass flex items-center justify-center text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] hover:scale-110 transition-all">
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>
            <div className="relative h-20 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
              {/* Ruler */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-black/30 flex items-end px-2">
                {['0:00', '0:30', '1:00', '1:30', '2:00'].map((t, i) => (
                  <span key={t} className="absolute text-[9px] font-mono text-[var(--text-muted)]" style={{ left: `${i * 25}%` }}>{t}</span>
                ))}
              </div>
              {/* Selection range */}
              <div className="absolute top-6 bottom-0 left-[20%] right-[30%] bg-amber-500/20 border-l-[3px] border-r-[3px] border-amber-400">
                <div className="absolute left-[-7px] top-0 bottom-0 w-[14px] bg-amber-400 rounded-l cursor-ew-resize flex items-center justify-center hover:bg-amber-300 transition-colors">
                  <span className="text-white text-xs">⋮</span>
                </div>
                <div className="absolute right-[-7px] top-0 bottom-0 w-[14px] bg-amber-400 rounded-r cursor-ew-resize flex items-center justify-center hover:bg-amber-300 transition-colors">
                  <span className="text-white text-xs">⋮</span>
                </div>
              </div>
              {/* Scrubber */}
              <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white z-10">
                <div className="absolute top-0 left-[-6px] w-[14px] h-[14px] bg-white rounded-sm" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[11px] font-mono text-[var(--text-muted)]">
              <span>開始: 00:24:00</span>
              <span>選択範囲: 01:00:00</span>
              <span>終了: 01:24:00</span>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        <div className="w-[320px] bg-[var(--bg-secondary)]/80 backdrop-blur border-l border-white/5 flex flex-col">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-base font-semibold mb-1">出力設定</h2>
            <p className="text-xs text-[var(--text-muted)]">GIFの品質とサイズを調整</p>
          </div>

          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            {/* Resolution */}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-2">解像度</label>
              <div className="flex gap-2 mb-2">
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-20 h-10 px-3 bg-[var(--bg-tertiary)] border border-white/5 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-400" />
                <span className="flex items-center text-[var(--text-muted)]">×</span>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-20 h-10 px-3 bg-[var(--bg-tertiary)] border border-white/5 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-400" />
                <span className="flex items-center text-xs text-[var(--text-muted)]">px</span>
              </div>
              <select className="w-full h-10 px-3 bg-[var(--bg-tertiary)] border border-white/5 rounded-lg text-sm focus:outline-none focus:border-amber-400">
                {resolutionPresets.map((p) => (
                  <option key={p.label} value={`${p.w}x${p.h}`}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* FPS */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">フレームレート</label>
                <span className="text-sm font-mono text-amber-400">{fps} fps</span>
              </div>
              <input type="range" min="5" max="30" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-400/30" />
            </div>

            {/* Quality */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">品質</label>
                <span className="text-sm font-mono text-amber-400">{['最低', '低', '中', '高', '最高'][quality - 1]}</span>
              </div>
              <input type="range" min="1" max="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-400/30" />
            </div>

            {/* Estimation */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                <Box size={14} />
                推定ファイルサイズ
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400 mb-1">{estimatedSize} MB</div>
              <div className="text-[11px] text-[var(--text-muted)]">{width}×{height} / {fps}fps / {duration}秒</div>
              {Number(estimatedSize) > 10 && (
                <div className="mt-3 px-3 py-2 bg-red-500/10 rounded-md text-[11px] text-red-400 flex items-center gap-1.5">
                  <span>⚠</span>
                  10MB以上: 共有に時間がかかる可能性
                </div>
              )}
            </div>

            {/* Preview button */}
            <button className="w-full py-3 rounded-xl glass flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/5 hover:border-amber-400 transition-all group">
              <Play size={16} className="transition-transform group-hover:scale-110" />
              GIFプレビューを生成
            </button>

            {/* Filename */}
            <div className="pt-5 border-t border-white/5">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-2">ファイル名</label>
              <input type="text" value={outputName} onChange={(e) => setOutputName(e.target.value)} placeholder="ファイル名を入力" className="w-full h-11 px-4 bg-[var(--bg-tertiary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
              <p className="text-[11px] text-[var(--text-muted)] mt-2">保存先: GIF/2025-01-19/{outputName}.gif</p>
            </div>

            {/* Shortcuts */}
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg text-[11px] text-[var(--text-muted)]">
              <div className="flex justify-between py-1"><span>再生/停止</span><span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">Space</span></div>
              <div className="flex justify-between py-1"><span>フレーム移動</span><span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">← →</span></div>
              <div className="flex justify-between py-1"><span>開始位置</span><span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">I</span></div>
              <div className="flex justify-between py-1"><span>終了位置</span><span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">O</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
