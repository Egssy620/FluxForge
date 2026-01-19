use crate::config::{self, AppConfig};
use crate::pdf;
use crate::archive;
use crate::video;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

// ============================================
// Config Commands
// ============================================

#[tauri::command]
pub fn get_config(app: AppHandle) -> Result<AppConfig, String> {
    config::load_config(&app)
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    config::save_config(&app, &config)
}

#[tauri::command]
pub async fn select_folder() -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    
    // Note: This requires the dialog plugin
    // For now, return a placeholder
    Ok(None)
}

#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

// ============================================
// PDF Commands
// ============================================

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfInfo {
    pub path: String,
    pub page_count: u32,
    pub file_size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConvertOptions {
    pub format: String,       // "jpg", "png", "svg"
    pub dpi: u32,
    pub pages: Option<Vec<u32>>, // None = all pages
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConvertResult {
    pub success: bool,
    pub output_files: Vec<String>,
    pub output_folder: String,
    pub message: String,
}

#[tauri::command]
pub fn get_pdf_info(path: String) -> Result<PdfInfo, String> {
    pdf::get_info(&path)
}

#[tauri::command]
pub async fn convert_pdf_to_images(
    app: AppHandle,
    paths: Vec<String>,
    options: ConvertOptions,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    pdf::convert_to_images(&config, &paths, &options).await
}

#[tauri::command]
pub async fn convert_pdf_to_svg(
    app: AppHandle,
    paths: Vec<String>,
    pages: Option<Vec<u32>>,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    pdf::convert_to_svg(&config, &paths, pages).await
}

#[tauri::command]
pub async fn merge_pdfs(
    app: AppHandle,
    paths: Vec<String>,
    output_name: String,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    pdf::merge(&config, &paths, &output_name).await
}

#[tauri::command]
pub async fn split_pdf(
    app: AppHandle,
    path: String,
    split_points: Vec<u32>,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    pdf::split(&config, &path, &split_points).await
}

#[tauri::command]
pub async fn extract_pdf_pages(
    app: AppHandle,
    path: String,
    pages: Vec<u32>,
    output_name: String,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    pdf::extract_pages(&config, &path, &pages, &output_name).await
}

// ============================================
// Archive Commands
// ============================================

#[derive(Debug, Serialize, Deserialize)]
pub struct ArchiveOptions {
    pub format: String,       // "zip", "7z"
    pub password: Option<String>,
}

#[tauri::command]
pub async fn extract_archive(
    app: AppHandle,
    path: String,
    password: Option<String>,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    archive::extract(&config, &path, password).await
}

#[tauri::command]
pub async fn create_archive(
    app: AppHandle,
    paths: Vec<String>,
    output_name: String,
    options: ArchiveOptions,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    archive::create(&config, &paths, &output_name, &options).await
}

// ============================================
// Video Commands
// ============================================

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    pub path: String,
    pub duration_seconds: f64,
    pub width: u32,
    pub height: u32,
    pub fps: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GifOptions {
    pub start_time: f64,
    pub end_time: f64,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub quality: u32,        // 1-5
    pub output_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GifEstimate {
    pub estimated_size_mb: f64,
    pub duration_seconds: f64,
    pub frame_count: u32,
}

#[tauri::command]
pub fn get_video_info(path: String) -> Result<VideoInfo, String> {
    video::get_info(&path)
}

#[tauri::command]
pub async fn convert_video_to_gif(
    app: AppHandle,
    path: String,
    options: GifOptions,
) -> Result<ConvertResult, String> {
    let config = config::load_config(&app)?;
    video::convert_to_gif(&config, &path, &options).await
}

#[tauri::command]
pub fn generate_gif_preview(
    path: String,
    options: GifOptions,
) -> Result<GifEstimate, String> {
    video::estimate_gif_size(&path, &options)
}
