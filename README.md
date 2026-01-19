# FluxForge

ファイル変換をもっとシンプルに。

## 機能

- **PDF 変換**: PDFを画像（JPG, PNG, SVG, WebP）に変換
- **PDF 操作**: 結合・分割・ページ抽出
- **圧縮・展開**: ZIP, 7z, RAR対応
- **動画 → GIF**: Premiere風UIで動画をGIFに変換

## セットアップ

### 必要条件

- Node.js 18以上
- Rust 1.70以上
- Visual Studio Build Tools（C++コンポーネント）
- FFmpeg（動画→GIF機能用、オプション）

### Windows でのインストール手順

**1. 必須ツールをインストール（PowerShellを管理者で実行）**

```powershell
# Rust
winget install Rustlang.Rustup

# Node.js LTS
winget install OpenJS.NodeJS.LTS

# Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Rustup をインストール
winget install Rustlang.Rustup
```

**2. Visual Studio Build Tools の設定**

インストール後、Visual Studio Installer を開いて：
1. 「変更」をクリック
2. 「C++ によるデスクトップ開発」にチェック
3. 「インストール」をクリック

**3. オプション：FFmpeg（動画→GIF機能用）**

```powershell
winget install FFmpeg
```

**4. 確認（新しいPowerShellウィンドウで）**

```powershell
rustc --version   # バージョンが表示されればOK
node --version    # v18以上
```

### インストール

```bash
# プロジェクトディレクトリに移動
cd C:\Users\name\Downloads\fluxforge\fluxforge

# npm依存関係をインストール
npm install

# 開発サーバー起動
npm run tauri dev
```

### ビルド

```bash
# Windows向けビルド
npm run tauri build
```

## プロジェクト構造

```
fluxforge/
├── src-tauri/              # Rust バックエンド
│   ├── src/
│   │   ├── main.rs         # エントリーポイント
│   │   ├── commands.rs     # Tauriコマンド定義
│   │   ├── config.rs       # 設定管理
│   │   ├── pdf.rs          # PDF処理
│   │   ├── archive.rs      # 圧縮/展開
│   │   └── video.rs        # 動画→GIF
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                    # React フロントエンド
│   ├── components/         # 共通コンポーネント
│   ├── pages/              # ページコンポーネント
│   │   ├── Home.tsx
│   │   ├── PdfConvert.tsx
│   │   ├── PdfOperations.tsx
│   │   ├── Archive.tsx
│   │   ├── VideoToGif.tsx
│   │   └── Settings.tsx
│   ├── hooks/              # カスタムフック
│   ├── styles/             # グローバルスタイル
│   ├── types/              # TypeScript型定義
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 出力フォルダ構造

```
[ユーザー指定場所]/FluxForge/
├── PDF_Images/
│   └── 2025-01-19/
├── PDF_Operations/
│   └── 2025-01-19/
├── Archives/
│   └── 2025-01-19/
└── GIF/
    └── 2025-01-19/
```

## 技術スタック

- **フレームワーク**: Tauri 2.0
- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **バックエンド**: Rust
- **PDF処理**: pdf-rs, image-rs
- **圧縮/展開**: zip, sevenz-rust, unrar
- **動画処理**: FFmpeg

## デザイン

- シンプルなガラス（Glass Morphism）UI
- ダーク/ライトテーマ切り替え
- モダンで洗練されたアニメーション

## ライセンス

MIT

---

## トラブルシューティング

### `error: linker 'link.exe' not found`

→ Visual Studio Build Tools の C++ コンポーネントがインストールされていません。
Visual Studio Installer で「C++ によるデスクトップ開発」を追加してください。

### WebView2 エラー（Windows 10）

→ WebView2 ランタイムをインストール：
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 初回ビルドが遅い

→ Rustの依存クレートのコンパイルで5〜10分かかります。2回目以降は高速です。
