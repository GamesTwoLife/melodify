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
	public readonly downloadPath: string = resolve(__dirname, "../../../../downloads");
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
				'yt-dlp not found! Install from https://github.com/yt-dlp/yt-dlp following all instructions'
			);
		}
	}

	async downloadAudio(searchQuery: string, format: AudioFormat = 'best'): Promise<string> {
		await this.checkYtDlpInstallation();

		const outputPath = resolve(this.downloadPath, `${searchQuery}.%(ext)s`);

		const args = [
			"--no-cache-dir",
			'-x',
			"-f", `bestaudio[ext=${format}]/bestaudio`,
			"--audio-quality", "0",
			"--add-metadata",
			'--prefer-ffmpeg', 
			"-o", outputPath,
			"--print", "after_move:filepath",
			`ytsearch1:"${searchQuery} (Official Video)"`
		];

		const process = spawn("yt-dlp", args);
		let output = '';

		return new Promise((resolve, reject) => {
			process.stdout.on('data', (data) => (output += data.toString()));

			process.on('close', (code) => {
				if (code !== 0) {
					return reject(new Error(`yt-dlp failed with code ${code}`));
				}

				try {
					const filePath = output.trim()

					resolve(filePath);
				} catch {
					reject(new Error(`yt-dlp failed with an error (code ${code})`));
				}
			});
		});
	}
}