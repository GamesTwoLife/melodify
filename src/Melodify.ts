import { AudioFormat, DownloadManager } from "./managers/DownloadManager";
import { SpotifyProvider } from "./providers/spotify/SpotifyProvider";

export interface MelodifyOptions {
	/**
	 * Your Spotify Client Id
	 */
	spotifyClientId: string;

	/**
	 * Your Spotify Client Secret
	 */
	spotifyClientSecret: string;
}

/**
 * Main Melodify class
 */
export class Melodify {
	public spotifyProvider: SpotifyProvider;
	private downloadManager: DownloadManager = new DownloadManager()

	/**
	 * Melodify Options
	 */
	public readonly options: Required<MelodifyOptions>;

	/**
	 * 
	 * @param options Options to pass to create this Melodify instance
	 * @param options.spotifyClientId Your Spotify Client Id (https://developer.spotify.com/dashboard)
	 * @param options.spotifyClientSecret Your Spotify Client Secret (https://developer.spotify.com/dashboard)
	 */
	public constructor(options: MelodifyOptions) {
		this.options = options
		this.spotifyProvider = new SpotifyProvider(this.options.spotifyClientId, this.options.spotifyClientSecret);
	}

	/**
	 * Download audio file from Spotify Response
	 * @param query Query from spotify response
	 * @param format Audio format for download (For best quality recommended "best" or "opus")
	 */
	public async downloadTrack(query: string, format: AudioFormat = "best"): Promise<string> {
		return await this.downloadManager.downloadAudio(query, format);
	}
}