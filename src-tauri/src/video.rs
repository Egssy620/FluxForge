use crate::commands::{ConvertResult, GifEstimate, GifOptions, VideoInfo};
use crate::config::{self, AppConfig};
use std::path::Path;
use std::process::Command;

/// Get video information using FFprobe
pub fn get_info(path: &str) -> Result<VideoInfo, String> {
    let file_path = Path::new(path);
    
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }
    
    // Try to get video info using ffprobe
    let output = Command::new("ffprobe")
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            path
        ])
        .output();
    
    match output {
        Ok(result) => {
            if result.status.success() {
                let json_str = String::from_utf8_lossy(&result.stdout);
                parse_ffprobe_output(&json_str, path)
            } else {
                // FFprobe failed, return placeholder
                Ok(VideoInfo {
                    path: path.to_string(),
                    duration_seconds: 0.0,
                    width: 1920,
                    height: 1080,
                    fps: 30.0,
                })
            }
        }
        Err(_) => {
            // FFprobe not available, return placeholder
            Ok(VideoInfo {
                path: path.to_string(),
                duration_seconds: 0.0,
                width: 1920,
                height: 1080,
                fps: 30.0,
            })
        }
    }
}

fn parse_ffprobe_output(json: &str, path: &str) -> Result<VideoInfo, String> {
    // Simple JSON parsing without external crate
    let mut duration = 0.0;
    let mut width = 1920;
    let mut height = 1080;
    let mut fps = 30.0;
    
    // Parse duration
    if let Some(dur_start) = json.find("\"duration\":") {
        let dur_str: String = json[dur_start + 11..]
            .chars()
            .skip_while(|c| c.is_whitespace() || *c == '"')
            .take_while(|c| c.is_numeric() || *c == '.')
            .collect();
        duration = dur_str.parse().unwrap_or(0.0);
    }
    
    // Parse width
    if let Some(w_start) = json.find("\"width\":") {
        let w_str: String = json[w_start + 8..]
            .chars()
            .skip_while(|c| c.is_whitespace())
            .take_while(|c| c.is_numeric())
            .collect();
        width = w_str.parse().unwrap_or(1920);
    }
    
    // Parse height
    if let Some(h_start) = json.find("\"height\":") {
        let h_str: String = json[h_start + 9..]
            .chars()
            .skip_while(|c| c.is_whitespace())
            .take_while(|c| c.is_numeric())
            .collect();
        height = h_str.parse().unwrap_or(1080);
    }
    
    Ok(VideoInfo {
        path: path.to_string(),
        duration_seconds: duration,
        width,
        height,
        fps,
    })
}

/// Estimate GIF file size
pub fn estimate_gif_size(path: &str, options: &GifOptions) -> Result<GifEstimate, String> {
    let duration = options.end_time - options.start_time;
    let frame_count = (duration * options.fps as f64) as u32;
    
    // Rough estimation: bytes per frame depends on resolution and quality
    let pixels = options.width * options.height;
    let bytes_per_pixel = match options.quality {
        1 => 0.05,  // Low quality
        2 => 0.08,
        3 => 0.12,  // Medium
        4 => 0.18,
        5 => 0.25,  // High quality
        _ => 0.12,
    };
    
    let estimated_bytes = (pixels as f64) * bytes_per_pixel * (frame_count as f64);
    let estimated_mb = estimated_bytes / (1024.0 * 1024.0);
    
    Ok(GifEstimate {
        estimated_size_mb: (estimated_mb * 10.0).round() / 10.0,
        duration_seconds: duration,
        frame_count,
    })
}

/// Convert video to GIF using FFmpeg
pub async fn convert_to_gif(
    config: &AppConfig,
    path: &str,
    options: &GifOptions,
) -> Result<ConvertResult, String> {
    let output_folder = config::get_output_path(config, "GIF")?;
    
    let output_filename = if options.output_name.ends_with(".gif") {
        options.output_name.clone()
    } else {
        format!("{}.gif", options.output_name)
    };
    
    let output_path = output_folder.join(&output_filename);
    
    // Build FFmpeg command
    let duration = options.end_time - options.start_time;
    let scale_filter = format!("scale={}:{}:flags=lanczos", options.width, options.height);
    let palette_filter = format!(
        "[0:v] fps={},{}[x]; [x] split [a][b]; [a] palettegen=stats_mode=diff [p]; [b][p] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
        options.fps, scale_filter
    );
    
    let result = Command::new("ffmpeg")
        .args([
            "-y",                           // Overwrite output
            "-ss", &options.start_time.to_string(),
            "-t", &duration.to_string(),
            "-i", path,
            "-filter_complex", &palette_filter,
            output_path.to_str().unwrap(),
        ])
        .output();
    
    match result {
        Ok(output) => {
            if output.status.success() {
                Ok(ConvertResult {
                    success: true,
                    output_files: vec![output_path.to_string_lossy().to_string()],
                    output_folder: output_folder.to_string_lossy().to_string(),
                    message: "GIF変換が完了しました".to_string(),
                })
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(format!("FFmpeg error: {}", stderr))
            }
        }
        Err(e) => {
            Err(format!("FFmpeg not found or failed to execute: {}", e))
        }
    }
}
