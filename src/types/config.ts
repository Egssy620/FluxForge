export interface AppConfig {
  export_folder: string;
  export_folder_name: string;
  theme: string;
  default_pdf_dpi: number;
  auto_create_date_folders: boolean;
  cloud_sync_folder: string | null;
}

export const defaultConfig: AppConfig = {
  export_folder: '',
  export_folder_name: 'FluxForge',
  theme: 'dark',
  default_pdf_dpi: 150,
  auto_create_date_folders: true,
  cloud_sync_folder: null,
};

export interface ConvertResult {
  success: boolean;
  output_files: string[];
  output_folder: string;
  message: string;
}

export interface PdfInfo {
  path: string;
  page_count: number;
  file_size: number;
}

export interface VideoInfo {
  path: string;
  duration_seconds: number;
  width: number;
  height: number;
  fps: number;
}

export interface GifOptions {
  start_time: number;
  end_time: number;
  width: number;
  height: number;
  fps: number;
  quality: number;
  output_name: string;
}

export interface GifEstimate {
  estimated_size_mb: number;
  duration_seconds: number;
  frame_count: number;
}
