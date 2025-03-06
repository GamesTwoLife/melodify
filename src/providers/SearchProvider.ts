import axios from "axios";
import { AlbumResponse, ArtistResponse, PlaylistResponse, SearchItemsResponse, LoadType, TrackObject, TrackResult, ArtistResult, AlbumResult, PlaylistResult, VideoResult, SearchResult, Market, TrackResponse, VideoPlaylistResult, PlaylistTrackObject } from "../models";
import { TypedEventEmitter } from "../Utils";

interface SearchOptions {
	spotify?: {
		clientId?: string | null;
		clientSecret?: string | null;
	};
	youtube?: {
		apiKey?: string | null;
	}
}

interface YTSearchResponse {
	kind: string,
	etag: string,
	id: { videoId?: string; playlistId?: string; },
	snippet: {
		publishedAt: string;
		channelId: string;
		title: string;
		description: string;
		thumbnails: {
			default: {
				url: string;
				width: number;
				height: number;
			},
			medium: {
				url: string;
				width: number;
				height: number;
			},
			high: {
				url: string;
				width: number;
				height: number;
			},
			standard: {
				url: string;
				width: number;
				height: number;
			},
			maxres: {
				url: string;
				width: number;
				height: number;
			}
		},
		channelTitle: string;
		playlistId: string;
		position: number;
		resourceId: { kind: string; videoId: string; };
		videoOwnerChannelTitle: string;
		videoOwnerChannelId: string;
	}
}

interface YTSearchPLaylistResponse {
	kind: string,
	etag: string,
	nextPageToken: string,
	items: YTSearchResponse[],
	pageInfo: { totalResults: number; resultsPerPage: number; }
}

interface YTPlaylistInfo {
	kind: string,
	etag: string,
	id: string,
	snippet: {
		publishedAt: string;
		title: string;
		description: string;
		thumbnails: {
			default: { url: string; width: number; height: number; },
			medium: { url: string; width: number; height: number; },
			high: { url: string; width: number; height: number; },
			standard: { url: string; width: number; height: number; },
			maxres: { url: string; width: number; height: number; },
		};
		channelTitle: string;
		localized: {
			title: string;
			description: string;
		};
	},
	contentDetails: { itemCount: string; }
}

// Interfaces are not final, but types are, and therefore has an index signature
// https://stackoverflow.com/a/64970740
export type SearchProviderEvents = {
	/**
	 * Emitted when data useful for debugging is produced
	 * @eventProperty
	 */
	'debug': [name: string, info: string];

	/**
	 * Emitted when an error occurs during the search operation
	 * @eventProperty
	 */
	'error': [error: unknown];
}

export class SearchProvider extends TypedEventEmitter<SearchProviderEvents> {
	private readonly spotifyBaseUrl: string = "https://api.spotify.com/v1";
	private readonly youtubeBaseUrl: string = "https://www.googleapis.com/youtube/v3";
	private readonly clientId!: string;
	private readonly clientSecret!: string;
	private readonly apiKey!: string;
	private accessToken: string | null = null;
	private tokenExpiresIn: number | null = null;

	public constructor(options: SearchOptions) {
		super();

		if (typeof options !== "object" || options === null) throw new Error("options must be an object");

		if (options.spotify && options.spotify.clientId && options.spotify.clientSecret) {
			this.clientId = options.spotify.clientId;
			this.clientSecret = options.spotify.clientSecret;
		}

		if (options.youtube && options.youtube.apiKey) {
			this.apiKey = options.youtube.apiKey;
		}
	}

	private async getSpotifyAccessToken() {
		if (!this.clientId && !this.clientSecret) throw new Error("Either both clientId and clientSecret must be provided.");
		if (this.accessToken && this.tokenExpiresIn && Date.now() < this.tokenExpiresIn) {
			return this.accessToken;
		}

		const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

		try {
			const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
				grant_type: "client_credentials"
			}), {
				headers: {
					Authorization: `Basic ${credentials}`,
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});
	
			this.accessToken = response.data.access_token as string;
			this.tokenExpiresIn = Date.now() + (response.data.expires_in as number) * 1000;
	
			return this.accessToken;
		} catch (error) {
			throw new Error(`Error fetching Spotify token: ${error}`);
		}
	}

	async getAvailableMarkets(): Promise<{ markets: string[]; }> {
		const token = await this.getSpotifyAccessToken();

		try {
			const response = await axios.get(
				'https://api.spotify.com/v1/markets',
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			);

			return response.data as { markets: string[] };
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	public async search(query: string, market: Market = "US"): Promise<TrackResult | ArtistResult | AlbumResult | PlaylistResult | VideoResult | VideoPlaylistResult | SearchResult> {
		try {
			const spotifyRegex = /https:\/\/open\.spotify\.com\/(track|artist|album|playlist)\/([a-zA-Z0-9]{22})/;
			const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:.*[?&](?:v=|list=)|playlist\?list=)|youtu\.be\/)([^"&?\/\s]{11,34})/;

			const spotifyMatch = query.match(spotifyRegex);
			const youtubeMatch = query.match(youtubeRegex);

			if (spotifyMatch && this.clientId && this.clientSecret) {
				const [_, type, id] = spotifyMatch;
				this.emit('debug', "[Spotify]", `Query: ${query} | ID: ${spotifyMatch[2]}`);
				switch (type) {
					case "track":
						{
							const res = await this.searchSpotifyTrack(id, market);

							return {
								loadType: LoadType.TRACK,
								data: res
							} as TrackResult;
						}
					case "artist":
						{
							const res = await this.searchSpotifyArtist(id, market);
							return {
								loadType: LoadType.ARTIST,
								data: res
							} as ArtistResult;
						}
					case "album":
						{
							const res = await this.searchSpotifyAlbum(id, market);
							return {
								loadType: LoadType.ALBUM,
								data: res
							} as AlbumResult;
						}
					case "playlist":
						{
							const res = await this.searchSpotifyPlaylist(id, market);
							return {
								loadType: LoadType.PLAYLIST,
								data: res
							} as PlaylistResult;
						}
					default:
						throw new Error(`Unsupported Spotify type: ${type}`);
				}
			} else if (youtubeMatch && this.apiKey) {
				const videoOrPlaylistId = youtubeMatch[1];
				if (videoOrPlaylistId.startsWith("PL") || videoOrPlaylistId.startsWith("UU") || videoOrPlaylistId.startsWith("RD")) {
					const res = await this.searchYoutube(videoOrPlaylistId, "playlist");

					return {
						loadType: LoadType.VIDEO_PLAYLIST,
						data: res
					} as unknown as VideoPlaylistResult;
				} else {
					const res = await this.searchYoutube(videoOrPlaylistId, "video");
					return {
						loadType: LoadType.VIDEO,
						data: res
					} as VideoResult;
				}
			} else {
				if (this.clientId && this.clientSecret) {
					const res = await this.spotifySearch(query);
					return {
						loadType: LoadType.SEARCH,
						data: res
					} as SearchResult;
				} else if (this.apiKey) {
					const res = await this.searchYoutube(query, "video");
					return {
						loadType: LoadType.VIDEO,
						data: res
					} as VideoResult;
				} else {
					throw new Error("Either both clientId and clientSecret must be provided, or apiKey must be provided.");
				}
			}
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching: ${error}`);
		}
	}

	private async spotifySearch(query: string) {
		const token = await this.getSpotifyAccessToken();

		try {
			const response = await axios.get(
				`${this.spotifyBaseUrl}/search`,
				{
					headers: { Authorization: `Bearer ${token}` },
					params: {
						q: query,
						type: "track,artist,album,playlist",
						market: "UA",
						limit: 25,
						offset: 0
					}
				}
			);

			const resData = response.data as Omit<SearchItemsResponse, "audiobooks" | "episodes" | "shows">

			return resData ?? null;
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching on Spotify: ${error}`);
		}
	}

	private async searchSpotifyTrack(trackId: string, market: Market = "US") {
		const token = await this.getSpotifyAccessToken();

		try {
			const response = await axios.get(`${this.spotifyBaseUrl}/tracks/${trackId}`, {
				headers: { Authorization: `Bearer ${token}` },
				params: { market: market }
			});
	
			const resData = response.data as TrackResponse;

			return {
				type: resData.type,
				id: resData.id,
				name: resData.name,
				artists: resData.artists,
				images: resData.album.images,
				duration: resData.duration_ms,
				url: resData.external_urls.spotify
			};
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching on Spotify: ${error}`);
		}
	}

	private async searchSpotifyPlaylist(playlistId: string, market: Market = "US") {
		const token = await this.getSpotifyAccessToken();
		let allTracks: PlaylistTrackObject[] = [];
		let offset = 0;
		const limit = 100;
		
		try {
			const response = await axios.get(`${this.spotifyBaseUrl}/playlists/${playlistId}`, {
				headers: { Authorization: `Bearer ${token}` },
				params: { market, limit: 100, offset: 0 }
			});
	
			const resData = response.data as PlaylistResponse;

			while (true) {
				const tracksResponse = await axios.get(
					`${this.spotifyBaseUrl}/playlists/${playlistId}/tracks`,
					{
						headers: { Authorization: `Bearer ${token}` },
						params: {
							market,
							limit: limit.toString(),
							offset: offset.toString()
						}
					}
				);
	
				const tracksData = tracksResponse.data.items as PlaylistTrackObject[];

				allTracks.push(...tracksData);

				if (tracksData.length < limit) break;

				offset += limit;
			}

			return {
				id: resData.id,
				name: resData.name,
				artists: {
					external_urls: resData.owner.external_urls,
					href: resData.owner.href,
					id: resData.owner.id,
					name: resData.owner.display_name,
					uri: resData.owner.uri
				},
				images: resData.images,
				url: resData.external_urls.spotify,
				tracks: allTracks
			};
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching on Spotify: ${error}`);
		}
	}

	private async searchSpotifyArtist(artistId: string, market: Market = "US") {
		const token = await this.getSpotifyAccessToken();

		try {
			const response = await axios.get(`${this.spotifyBaseUrl}/artists/${artistId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
	
			const resData = response.data as ArtistResponse;
	
			const response2 = await axios.get(`${this.spotifyBaseUrl}/artists/${artistId}/top-tracks`, {
				headers: { Authorization: `Bearer ${token}` },
				params: { market: market }
			});
	
			const tracks = response2.data.tracks as TrackObject[];
			
			return {
				id: resData.id,
				name: resData.name,
				images: resData.images,
				url: resData.external_urls.spotify,
				tracks: tracks.map((track) => ({
					id: track.id,
					name: track.name,
					artists: track.artists.map((a) => a.name).join(", "),
					images: track.album.images,
					duration: track.duration_ms,
					url: track.external_urls.spotify,
				}))
			}
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching on Spotify: ${error}`);
		}
	}

	private async searchSpotifyAlbum(albumId: string, market: Market = "US") {
		const token = await this.getSpotifyAccessToken();

		try {
			const response = await axios.get(`${this.spotifyBaseUrl}/albums/${albumId}`, {
				headers: { Authorization: `Bearer ${token}` },
				params: { market: market }
			});
	
			const resData = response.data as AlbumResponse;
	
			return {
				id: resData.id,
				name: resData.name,
				images: resData.images,
				url: resData.external_urls.spotify,
				tracks: resData.tracks.items.map((track) => ({
					id: track.id,
					name: track.name,
					artists: track.artists,
					duration: track.duration_ms,
					url: track.external_urls.spotify,
				}))
			}
		} catch (error) {
			this.emit('error', error);
			throw new Error(`Unexpected error while searching on Spotify: ${error}`);
		}
	}

	private async searchYoutube(query: string, type: "video" | "playlist") {
		switch (type) {
			case "video":
				{
					try {
						const response = await axios.get(`${this.youtubeBaseUrl}/search`, {
							params: {
								q: query,
								type: type,
								part: "snippet",
								maxResults: 1,
								key: this.apiKey
							}
						});

						const resData = response.data.items[0] as YTSearchResponse;
				
						return {
							id: resData.id.videoId,
							name: resData.snippet.title,
							channel: resData.snippet.channelTitle,
							images: {
								url: resData.snippet.thumbnails.high.url,
								width: resData.snippet.thumbnails.high.width,
								height: resData.snippet.thumbnails.high.height,
							},
							url: `https://www.youtube.com/watch?v=${resData.id.videoId}`,
						};
					} catch (error) {
						this.emit('error', error);
			
						if (axios.isAxiosError(error)) {
							const status = error.response?.status;
							const data = error.response?.data;
				
							if (status === 403 && data?.error?.errors?.some((e: any) => e.reason === "rateLimitExceeded")) {
								const retryAfter = error.response?.headers["retry-after"];
								const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : null;
				
								throw new Error(
									retrySeconds
										? `YouTube rate limit exceeded. Try again in ${retrySeconds} seconds.`
										: "YouTube rate limit exceeded. Try again later."
								);
							}
				
							if (status === 403) {
								throw new Error("YouTube API access denied (check quota, billing, or project permissions).");
							}
				
							throw new Error(`YouTube API error: ${error.message}`);
						}
			
						throw new Error(`Unexpected error while searching on YouTube: ${error}`);
					}
				};

			case "playlist":
				{
					try {
						const pl_info = await this.getPlaylistInfo(query);
						let videos: VideoPlaylistResult["data"]["tracks"][0][] = [];
						let nextPageToken: string | undefined = undefined;

						do {
							const response = await axios.get(`${this.youtubeBaseUrl}/playlistItems`, {
								params: {
									part: "snippet",
									playlistId: query,
									maxResults: 50,
									pageToken: nextPageToken,
									key: this.apiKey
								}
							});
				
							const resData = response.data as YTSearchPLaylistResponse;

							videos.push(...resData.items.map((item) => ({
								id: `${item.snippet.resourceId.videoId}`,
								name: item.snippet.title,
								channel: item.snippet.videoOwnerChannelTitle,
								images: item.snippet.thumbnails,
								url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
							})));
					
							nextPageToken = resData.nextPageToken;
						} while (nextPageToken);

						return {
							name: pl_info.snippet.title,
							author: pl_info.snippet.channelTitle,
							images: pl_info.snippet.thumbnails,
							tracks: videos
						};
					} catch (error) {
						this.emit('error', error);
			
						if (axios.isAxiosError(error)) {
							const status = error.response?.status;
							const data = error.response?.data;
				
							if (status === 403 && data?.error?.errors?.some((e: any) => e.reason === "rateLimitExceeded")) {
								const retryAfter = error.response?.headers["retry-after"];
								const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : null;
				
								throw new Error(
									retrySeconds
										? `YouTube rate limit exceeded. Try again in ${retrySeconds} seconds.`
										: "YouTube rate limit exceeded. Try again later."
								);
							}
				
							if (status === 403) {
								throw new Error("YouTube API access denied (check quota, billing, or project permissions).");
							}
				
							throw new Error(`YouTube API error: ${error.message}`);
						}
			
						throw new Error(`Unexpected error while searching on YouTube: ${error}`);
					}
				};
		}
	}

	private async getPlaylistInfo(playlistId: string) {
		try {
			const response = await axios.get(`${this.youtubeBaseUrl}/playlists`, {
				params: {
					part: "snippet,contentDetails",
					id: playlistId,
					key: this.apiKey
				}
			});
	
			const playlist = response.data.items[0] as YTPlaylistInfo;

			return playlist;
		} catch (error) {
			this.emit('error', error);
	
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const data = error.response?.data;
	
				if (status === 403 && data?.error?.errors?.some((e: any) => e.reason === "rateLimitExceeded")) {
					const retryAfter = error.response?.headers["retry-after"];
					const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : null;
	
					throw new Error(
						retrySeconds
							? `YouTube rate limit exceeded. Try again in ${retrySeconds} seconds.`
							: "YouTube rate limit exceeded. Try again later."
					);
				}
	
				if (status === 403) {
					throw new Error("YouTube API access denied (check quota, billing, or project permissions).");
				}
	
				throw new Error(`YouTube API error: ${error.message}`);
			}
	
			throw new Error(`Unexpected error while fetching playlist info: ${error}`);
		}
	}
	
}