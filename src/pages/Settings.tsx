import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Folder, Moon, Sun, Cloud, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { AppConfig } from '../types/config';

interface Props {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
}

const cloudServices = [
  { id: 'gdrive', name: 'Google Drive', connected: true },
  { id: 'dropbox', name: 'Dropbox', connected: false },
  { id: 'icloud', name: 'iCloud', connected: false },
  { id: 'box', name: 'Box', connected: false },
];

const dpiOptions = [
  { value: 72, label: '72 DPI（Web向け）' },
  { value: 150, label: '150 DPI（標準）' },
  { value: 300, label: '300 DPI（印刷品質）' },
];

export default function Settings({ config, onConfigChange }: Props) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <span className="text-lg font-semibold">設定</span>
        </div>
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all">
          <X size={18} />
        </button>
      </header>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          
          {/* Appearance */}
          <section>
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-4">外観</h2>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">ダークモード</div>
                  <div className="text-xs text-[var(--text-muted)]">暗い配色を使用します</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full relative transition-colors ${
                    theme === 'dark' ? 'bg-gradient-to-r from-accent-primary to-accent-secondary' : 'bg-white/10'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                    theme === 'dark' ? 'left-7' : 'left-1'
                  }`}>
                    {theme === 'dark' ? (
                      <Moon size={14} className="absolute inset-0 m-auto text-accent-primary" />
                    ) : (
                      <Sun size={14} className="absolute inset-0 m-auto text-amber-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Output settings */}
          <section>
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-4">出力設定</h2>
            <div className="space-y-3">
              <div className="glass rounded-xl p-4">
                <div className="font-medium mb-1">エクスポート先フォルダ</div>
                <div className="text-xs text-[var(--text-muted)] mb-3">変換したファイルの保存先</div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={localConfig.export_folder}
                    onChange={(e) => handleChange('export_folder', e.target.value)}
                    className="flex-1 h-11 px-4 bg-[var(--bg-primary)] border border-white/5 rounded-xl text-sm font-mono focus:outline-none focus:border-accent-primary"
                  />
                  <button className="px-4 h-11 glass rounded-xl flex items-center gap-2 text-sm hover:bg-white/5 transition-colors">
                    <Folder size={16} />
                    参照
                  </button>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium mb-1">日付フォルダを自動作成</div>
                    <div className="text-xs text-[var(--text-muted)]">エクスポート時に日付別フォルダを作成</div>
                  </div>
                  <button
                    onClick={() => handleChange('auto_create_date_folders', !localConfig.auto_create_date_folders)}
                    className={`w-14 h-8 rounded-full relative transition-colors ${
                      localConfig.auto_create_date_folders ? 'bg-gradient-to-r from-accent-primary to-accent-secondary' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                      localConfig.auto_create_date_folders ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Default quality */}
          <section>
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-4">デフォルト品質</h2>
            <div className="glass rounded-xl p-4">
              <div className="font-medium mb-3">PDF → 画像の解像度</div>
              <select
                value={localConfig.default_pdf_dpi}
                onChange={(e) => handleChange('default_pdf_dpi', Number(e.target.value))}
                className="w-full h-11 px-4 bg-[var(--bg-primary)] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-accent-primary"
              >
                {dpiOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Cloud connections */}
          <section>
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-4">クラウド連携</h2>
            <div className="grid grid-cols-2 gap-3">
              {cloudServices.map((service) => (
                <button
                  key={service.id}
                  className={`p-4 rounded-xl border transition-colors flex items-center gap-3 ${
                    service.connected
                      ? 'border-success bg-success/5'
                      : 'glass hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    service.id === 'gdrive' ? 'bg-blue-500' :
                    service.id === 'dropbox' ? 'bg-blue-600' :
                    service.id === 'icloud' ? 'bg-gray-600' : 'bg-blue-700'
                  }`}>
                    <Cloud size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className={`text-[11px] ${service.connected ? 'text-success' : 'text-[var(--text-muted)]'}`}>
                      {service.connected ? '連携済み' : '未接続'}
                    </div>
                  </div>
                  {service.connected && (
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Version */}
          <div className="text-center py-6 text-[var(--text-muted)] text-xs">
            FluxForge v1.0.0 — Made with ♥
          </div>
        </div>
      </div>
    </div>
  );
}
