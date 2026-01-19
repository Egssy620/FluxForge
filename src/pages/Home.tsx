import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Sun, Moon, FileText, Files, Archive, Video } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const welcomeMessages = [
  '何を変換しますか？',
  '今日は何を作りますか？',
  'ファイル変換、始めましょう',
  '準備はできましたか？',
  'さあ、始めよう',
  '何をお手伝いしましょう？',
  '変換したいファイルは？',
  '作業を始めましょう',
];

const categories = [
  {
    id: 'pdf-convert',
    title: 'PDF 変換',
    description: 'PDFを画像（JPG, PNG）やSVGに変換',
    icon: FileText,
    color: 'from-red-400 to-red-500',
    path: '/pdf-convert',
  },
  {
    id: 'pdf-operations',
    title: 'PDF 操作',
    description: '結合・分割・ページ抽出',
    icon: Files,
    color: 'from-teal-400 to-teal-500',
    path: '/pdf-operations',
  },
  {
    id: 'archive',
    title: '圧縮・展開',
    description: 'ZIP, 7z, RARの圧縮と展開',
    icon: Archive,
    color: 'from-purple-400 to-purple-500',
    path: '/archive',
  },
  {
    id: 'video-gif',
    title: '動画 → GIF',
    description: '動画をアニメーションGIFに変換',
    icon: Video,
    color: 'from-amber-400 to-amber-500',
    path: '/video-to-gif',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);

  useEffect(() => {
    // Random message on mount
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  const handleCategoryClick = (path: string) => {
    // Change welcome message for next time
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-accent-primary/30 transition-all duration-400 group-hover:rotate-[-10deg] group-hover:scale-110">
            FF
          </div>
          <span className="text-2xl font-semibold bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            FluxForge
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all duration-300 relative overflow-hidden"
            title="テーマ切り替え"
          >
            <Sun 
              size={20} 
              className={`absolute transition-all duration-500 ${
                theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
              }`}
            />
            <Moon 
              size={20} 
              className={`absolute transition-all duration-500 ${
                theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
              }`}
            />
          </button>

          {/* Settings button */}
          <button
            onClick={() => navigate('/settings')}
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all duration-300 group"
            title="設定"
          >
            <Settings size={20} className="transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-10">
        {/* Welcome text */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light tracking-tight mb-4 bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent animate-in slide-up">
            {welcomeMessage}
          </h1>
          <p className="text-[var(--text-muted)] animate-in slide-up stagger-1">
            カテゴリを選択して作業を開始
          </p>
        </div>

        {/* Category cards grid */}
        <div className="grid grid-cols-2 gap-6 max-w-[720px] w-full">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onClick={() => handleCategoryClick(category.path)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[var(--text-muted)] text-xs">
        FluxForge v1.0.0 — ファイル変換をもっとシンプルに
      </footer>
    </div>
  );
}

interface CategoryCardProps {
  category: typeof categories[0];
  index: number;
  onClick: () => void;
}

function CategoryCard({ category, index, onClick }: CategoryCardProps) {
  const Icon = category.icon;
  
  return (
    <div
      onClick={onClick}
      className={`
        relative p-8 rounded-3xl cursor-pointer transition-all duration-400
        glass glass-hover glass-reflection
        hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30
        animate-in slide-up
      `}
      style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'both' }}
    >
      {/* Icon */}
      <div className={`
        w-16 h-16 rounded-2xl mb-5 flex items-center justify-center
        bg-gradient-to-br ${category.color}
        relative
      `}>
        <div className="absolute inset-0 rounded-2xl bg-inherit blur-xl opacity-50" />
        <Icon size={28} className="text-white relative z-10" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
        {category.title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {category.description}
      </p>

      {/* Arrow button */}
      <ArrowButton />
    </div>
  );
}

function ArrowButton() {
  return (
    <div className="
      absolute bottom-6 right-6 w-8 h-8 rounded-lg
      glass flex items-center justify-center
      text-[var(--text-muted)] z-10 overflow-hidden
      hover:bg-accent-primary hover:border-accent-primary hover:text-white
      transition-all duration-300 group/arrow
    ">
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className="transition-transform duration-300 group-hover/arrow:animate-bounce-arrow"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}
