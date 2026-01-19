use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub export_folder: String,
    pub export_folder_name: String,
    pub theme: String, // "dark" or "light"
    pub default_pdf_dpi: u32,
    pub auto_create_date_folders: bool,
    pub cloud_sync_folder: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            export_folder: String::new(),
            export_folder_name: String::from("FluxForge"),
            theme: String::from("dark"),
            default_pdf_dpi: 150,
            auto_create_date_folders: true,
            cloud_sync_folder: None,
        }
    }
}

/// Category folder names
pub const CATEGORY_FOLDERS: [&str; 4] = [
    "PDF_Images",
    "PDF_Operations", 
    "Archives",
    "GIF",
];

/// Get config file path
fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    fs::create_dir_all(&app_data)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    
    Ok(app_data.join("config.json"))
}

/// Initialize config on app startup
pub async fn init_config(app: &AppHandle) -> Result<(), String> {
    let config_path = get_config_path(app)?;
    
    if !config_path.exists() {
        // Create default config
        let mut config = AppConfig::default();
        
        // Set default export folder to Documents
        if let Ok(docs) = app.path().document_dir() {
            config.export_folder = docs.to_string_lossy().to_string();
        }
        
        save_config_to_file(&config, &config_path)?;
        
        // Create export folder structure
        create_export_folders(&config)?;
    }
    
    Ok(())
}

/// Load config from file
pub fn load_config(app: &AppHandle) -> Result<AppConfig, String> {
    let config_path = get_config_path(app)?;
    
    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))
    } else {
        Ok(AppConfig::default())
    }
}

/// Save config to file
pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path(app)?;
    save_config_to_file(config, &config_path)?;
    
    // Ensure export folders exist
    create_export_folders(config)?;
    
    Ok(())
}

fn save_config_to_file(config: &AppConfig, path: &PathBuf) -> Result<(), String> {
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(path, content)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    
    Ok(())
}

/// Create export folder structure
pub fn create_export_folders(config: &AppConfig) -> Result<PathBuf, String> {
    let base_path = PathBuf::from(&config.export_folder)
        .join(&config.export_folder_name);
    
    fs::create_dir_all(&base_path)
        .map_err(|e| format!("Failed to create export folder: {}", e))?;
    
    // Create category folders
    for folder in CATEGORY_FOLDERS.iter() {
        let folder_path = base_path.join(folder);
        fs::create_dir_all(&folder_path)
            .map_err(|e| format!("Failed to create {} folder: {}", folder, e))?;
    }
    
    Ok(base_path)
}

/// Get output path with date folder
pub fn get_output_path(config: &AppConfig, category: &str) -> Result<PathBuf, String> {
    let base_path = PathBuf::from(&config.export_folder)
        .join(&config.export_folder_name)
        .join(category);
    
    if config.auto_create_date_folders {
        let date = chrono::Local::now().format("%Y-%m-%d").to_string();
        let dated_path = base_path.join(&date);
        
        fs::create_dir_all(&dated_path)
            .map_err(|e| format!("Failed to create date folder: {}", e))?;
        
        Ok(dated_path)
    } else {
        fs::create_dir_all(&base_path)
            .map_err(|e| format!("Failed to create output folder: {}", e))?;
        
        Ok(base_path)
    }
}
