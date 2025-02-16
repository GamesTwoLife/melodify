import { execSync, spawn } from "child_process";
import { mkdir } from "fs/promises";
import { resolve } from "path";

export type AudioFormat =
	'best' |
	'aac' |
	'alac' |
	'flac' |
	'm4a' |
	'mp3' |
	'opus' |
	'vorbis' |
	'wav'

export class DownloadManager {
	private downloadPath: string = './downloads'
	private ytDlpChecked = false;

	constructor() {
		this.ensureDownloadPath();
	}

	private async ensureDownloadPath() {
		try {
			await mkdir(this.downloadPath, { recursive: true });
		} catch (error) {
			console.error('Error creating download directory:', error);
		}
	}

	private async checkYtDlpInstallation(): Promise<void> {
		if (this.ytDlpChecked) return;
	
		try {
			execSync(`yt-dlp --version`, { stdio: 'ignore' });
			this.ytDlpChecked = true;
		} catch (error) {
			throw new Error(
				'yt-dlp не знайдено! Встановіть з https://github.com/yt-dlp/yt-dlp дотримуючись усіх інструкцій'
			);
		}
	}

	async downloadAudio(searchQuery: string, format: AudioFormat = 'best'): Promise<string> {
		await this.checkYtDlpInstallation();

		const outputPath = resolve(this.downloadPath, `${searchQuery}.%(ext)s`);

		const args = [
			'-x', 
			'--audio-format', format, 
			'--audio-quality', '0',
			'--add-metadata', 
			'--prefer-ffmpeg', 
			'-o', outputPath, 
			`ytsearch:"${searchQuery}"`
		];

		return new Promise((resolve, reject) => {
			const process = spawn("yt-dlp", args);
			let output = '';

			process.stdout.on('data', (data) => (output += data.toString()));

			process.on('close', (code) => {
				if (code === 0) {
					const filePath = output.trim().split('\n').pop();
					if (filePath) {
						resolve(filePath);
					} else {
						reject(new Error('Не вдалося отримати шлях до файлу'));
					}
				} else {
					reject(new Error(`yt-dlp завершено з помилкою (код ${code})`));
				}
			});
		});
	}
}