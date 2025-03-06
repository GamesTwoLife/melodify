import { AudioFormat, DownloadManager } from "./managers/DownloadManager";
import { SearchProvider } from "./providers/SearchProvider";
import { SpotifyProvider } from "./providers/spotify/SpotifyProvider";

export interface MelodifyOptions {
	/**
	 * Your Spotify Client Id (https://developer.spotify.com/dashboard)
	 */
	spotifyClientId?: string;

	/**
	 * Your Spotify Client Secret (https://developer.spotify.com/dashboard)
	 */
	spotifyClientSecret?: string;

	/**
	 * Your Youtube Data API Key (https://console.cloud.google.com/apis/credentials)
	 */
	youtubeApiKey?: string;
}

/**
 * Main Melodify class
 */
export class Melodify {
	private downloadManager: DownloadManager = new DownloadManager();

	/**
	 * @deprecated This property is deprecated and will be removed in future versions. 
	 * Please use the '{@link searchProvider}' instead, which provides enhanced functionality including support for YouTube.
	 */
	public spotifyProvider: SpotifyProvider;
	public searchProvider: SearchProvider;
	public downloadPath: string = this.downloadManager.downloadPath;

	/**
	 * Melodify Options
	 */
	public readonly options: MelodifyOptions;

	/**
	 * 
	 * @param options Options to pass to create this Melodify instance
	 */
	public constructor(options: MelodifyOptions) {
		this.options = options

		const clientId = this.options.spotifyClientId ?? null;
		const clientSecret = this.options.spotifyClientSecret ?? null;
		const apiKey = this.options.youtubeApiKey ?? null;
		
		this.spotifyProvider = new SpotifyProvider(clientId, clientSecret);
		this.searchProvider = new SearchProvider({
			spotify: { clientId, clientSecret },
			youtube: { apiKey }
		});
	}

	/**
	 * Download audio file from Spotify Response
	 * @param query Query from spotify response
	 * @param format Audio format for download (For best quality recommended "best")
	 */
	public async downloadTrack(query: string, format: AudioFormat = "best"): Promise<string> {
		return await this.downloadManager.downloadAudio(query, format);
	}
}