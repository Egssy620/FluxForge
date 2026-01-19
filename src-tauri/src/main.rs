// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod pdf;
mod archive;
mod video;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // Config commands
            commands::get_config,
            commands::save_config,
            commands::select_folder,
            commands::open_folder,
            
            // PDF commands
            commands::convert_pdf_to_images,
            commands::convert_pdf_to_svg,
            commands::merge_pdfs,
            commands::split_pdf,
            commands::extract_pdf_pages,
            commands::get_pdf_info,
            
            // Archive commands
            commands::extract_archive,
            commands::create_archive,
            
            // Video commands
            commands::convert_video_to_gif,
            commands::get_video_info,
            commands::generate_gif_preview,
        ])
        .setup(|app| {
            // Initialize config on startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = config::init_config(&app_handle).await {
                    eprintln!("Failed to initialize config: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
