import { AlbumResponse, ArtistResponse, PlaylistResponse, PlaylistTrackObject, SearchItemsResponse, TrackResponse } from "../../models";
import { IProvider, SearchItemType } from "../interfaces/IProvider";

type SpotifyAuthResponse = { access_token: string; token_type: "Bearer"; expires_in: number; };

export class SpotifyProvider implements IProvider {
	private readonly clientId: string;
	private readonly clientSecret: string;
	private authData!: SpotifyAuthResponse;
	public authenticated: boolean = false;

	constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;

		if (!this.clientId && !this.clientSecret) {
			throw new Error("clientId & clientSecret are required")
		}
	}

	public async authenticate(): Promise<SpotifyAuthResponse> {
		try {
			const response = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({
					grant_type: "client_credentials",
					client_id: this.clientId,
					client_secret: this.clientSecret
				}).toString()
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			
			const data = (await response.json()) as SpotifyAuthResponse;
			this.authData = data;
			this.authenticated = true;
			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error authenticating with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while authenticating with Spotify.");
		}
	}

	async search(
		query: Required<string>,
		type: Required<SearchItemType[]>,
		market: string = "EN",
		limit: number = 25,
		offset: number = 0,
		include_external = "audio"
	): Promise<SearchItemsResponse> {
		try {
			if (!this.authenticated) throw new Error("You are not logged in with a spotify account")
			const url = new URL("https://api.spotify.com/v1/search");
			url.search = new URLSearchParams({
				q: query,
				type: type.join(","),
				market: market,
				limit: limit.toString(),
				offset: offset.toString(),
				include_external: include_external
			}).toString();
		
			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.authData.access_token}`
				}
			});
		
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		
			const data = (await response.json()) as SearchItemsResponse;

			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchTrack(id: Required<string>, market: string = "EN"): Promise<TrackResponse> {
		try {
			if (!this.authenticated) throw new Error("Ви не авторизувались через спотіфай")
			const url = `https://api.spotify.com/v1/tracks/${id}?market=${market}`;
    
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.authData.access_token}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json() as TrackResponse;
			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchPlaylist(playlist_id: Required<string>, market: string = "EN"): Promise<PlaylistTrackObject[]> {
		let allTracks: PlaylistTrackObject[] = [];
		let offset = 0;
		const limit = 100;

		try {
			if (!this.authenticated) throw new Error("Ви не авторизувались через спотіфай")
			const url = `https://api.spotify.com/v1/playlists/${playlist_id}?market=${market}&limit=${limit}&offset=${offset}`;
    
			while (true) {
				const response = await fetch(url, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${this.authData.access_token}`
					}
				});
	
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
	
				const data = await response.json() as PlaylistResponse;
	
				const tracks = data.tracks.items as PlaylistTrackObject[];
				allTracks.push(...tracks);
	
				if (tracks.length < limit) break;
	
				offset += limit;
			}

			return allTracks;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchAlbum(album_id: Required<string>, market: string = "EN"): Promise<AlbumResponse> {
		try {
			if (!this.authenticated) throw new Error("Ви не авторизувались через спотіфай")
			const url = `https://api.spotify.com/v1/albums/${album_id}?market=${market}`;
    
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.authData.access_token}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json() as AlbumResponse;
			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchArtist(id: Required<string>, market: string = "EN"): Promise<ArtistResponse> {
		try {
			if (!this.authenticated) throw new Error("Ви не авторизувались через спотіфай")
			const url = `https://api.spotify.com/v1/artists/${id}?market=${market}`;
    
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.authData.access_token}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json() as ArtistResponse;
			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}
}