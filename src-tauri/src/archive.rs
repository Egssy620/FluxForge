use crate::commands::{ArchiveOptions, ConvertResult};
use crate::config::{self, AppConfig};
use std::path::Path;
use std::fs;

/// Extract archive (ZIP, 7z, RAR)
pub async fn extract(
    config: &AppConfig,
    path: &str,
    password: Option<String>,
) -> Result<ConvertResult, String> {
    let output_folder = config::get_output_path(config, "Archives")?;
    
    let file_path = Path::new(path);
    let stem = file_path.file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("extracted");
    
    let extract_folder = output_folder.join(stem);
    fs::create_dir_all(&extract_folder)
        .map_err(|e| format!("Failed to create extract folder: {}", e))?;
    
    let extension = file_path.extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    
    match extension.as_str() {
        "zip" => extract_zip(path, &extract_folder, password)?,
        "7z" => extract_7z(path, &extract_folder, password)?,
        "rar" => extract_rar(path, &extract_folder, password)?,
        _ => return Err(format!("Unsupported archive format: {}", extension)),
    }
    
    Ok(ConvertResult {
        success: true,
        output_files: vec![extract_folder.to_string_lossy().to_string()],
        output_folder: output_folder.to_string_lossy().to_string(),
        message: "展開が完了しました".to_string(),
    })
}

fn extract_zip(path: &str, output: &Path, _password: Option<String>) -> Result<(), String> {
    let file = fs::File::open(path)
        .map_err(|e| format!("Failed to open zip file: {}", e))?;
    
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Failed to read zip archive: {}", e))?;
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {}", e))?;
        
        let outpath = match file.enclosed_name() {
            Some(path) => output.join(path),
            None => continue,
        };
        
        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }
            }
            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Failed to create file: {}", e))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to write file: {}", e))?;
        }
    }
    
    Ok(())
}

fn extract_7z(_path: &str, _output: &Path, _password: Option<String>) -> Result<(), String> {
    // TODO: Implement using sevenz-rust crate
    Ok(())
}

fn extract_rar(_path: &str, _output: &Path, _password: Option<String>) -> Result<(), String> {
    // TODO: Implement using unrar crate
    // Note: Requires unrar library installed on system
    Ok(())
}

/// Create archive (ZIP, 7z)
pub async fn create(
    config: &AppConfig,
    paths: &[String],
    output_name: &str,
    options: &ArchiveOptions,
) -> Result<ConvertResult, String> {
    let output_folder = config::get_output_path(config, "Archives")?;
    
    let extension = match options.format.as_str() {
        "7z" => "7z",
        _ => "zip",
    };
    
    let output_filename = if output_name.ends_with(&format!(".{}", extension)) {
        output_name.to_string()
    } else {
        format!("{}.{}", output_name, extension)
    };
    
    let output_path = output_folder.join(&output_filename);
    
    match options.format.as_str() {
        "zip" => create_zip(paths, &output_path, &options.password)?,
        "7z" => create_7z(paths, &output_path, &options.password)?,
        _ => return Err(format!("Unsupported format: {}", options.format)),
    }
    
    Ok(ConvertResult {
        success: true,
        output_files: vec![output_path.to_string_lossy().to_string()],
        output_folder: output_folder.to_string_lossy().to_string(),
        message: format!("{}個のファイルを圧縮しました", paths.len()),
    })
}

fn create_zip(paths: &[String], output: &Path, _password: &Option<String>) -> Result<(), String> {
    let file = fs::File::create(output)
        .map_err(|e| format!("Failed to create zip file: {}", e))?;
    
    let mut zip = zip::ZipWriter::new(file);
    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);
    
    for path in paths {
        let file_path = Path::new(path);
        
        if file_path.is_file() {
            let file_name = file_path.file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("file");
            
            zip.start_file(file_name, options)
                .map_err(|e| format!("Failed to start zip entry: {}", e))?;
            
            let content = fs::read(path)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            
            use std::io::Write;
            zip.write_all(&content)
                .map_err(|e| format!("Failed to write to zip: {}", e))?;
        }
    }
    
    zip.finish()
        .map_err(|e| format!("Failed to finish zip: {}", e))?;
    
    Ok(())
}

fn create_7z(_paths: &[String], _output: &Path, _password: &Option<String>) -> Result<(), String> {
    // TODO: Implement using sevenz-rust crate
    Ok(())
}
