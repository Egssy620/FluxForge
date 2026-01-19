import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import Home from './pages/Home';
import PdfConvert from './pages/PdfConvert';
import PdfOperations from './pages/PdfOperations';
import Archive from './pages/Archive';
import VideoToGif from './pages/VideoToGif';
import Settings from './pages/Settings';
import { AppConfig, defaultConfig } from './types/config';
import { ThemeProvider } from './hooks/useTheme';

function App() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await invoke<AppConfig>('get_config');
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: AppConfig) => {
    try {
      await invoke('save_config', { config: newConfig });
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-primary">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={config.theme as 'dark' | 'light'}>
      <div className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        {/* Background gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="bg-gradient-orb w-[600px] h-[600px] opacity-40 -top-48 -left-48"
            style={{ background: 'radial-gradient(circle, rgba(124, 92, 255, 0.35) 0%, transparent 70%)' }}
          />
          <div 
            className="bg-gradient-orb w-[500px] h-[500px] opacity-25 top-1/2 -right-36"
            style={{ background: 'radial-gradient(circle, rgba(92, 156, 255, 0.25) 0%, transparent 70%)' }}
          />
          <div 
            className="bg-gradient-orb w-[400px] h-[400px] opacity-20 -bottom-24 left-1/3"
            style={{ background: 'radial-gradient(circle, rgba(255, 92, 138, 0.2) 0%, transparent 70%)' }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pdf-convert" element={<PdfConvert config={config} />} />
            <Route path="/pdf-operations" element={<PdfOperations config={config} />} />
            <Route path="/archive" element={<Archive config={config} />} />
            <Route path="/video-to-gif" element={<VideoToGif config={config} />} />
            <Route 
              path="/settings" 
              element={<Settings config={config} onConfigChange={updateConfig} />} 
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
