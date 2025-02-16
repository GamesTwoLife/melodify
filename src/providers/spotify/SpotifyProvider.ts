import { AlbumResponse, ArtistResponse, PlaylistResponse, PlaylistTrackObject, SearchItemsResponse, TrackResponse } from "../../models";
import { IProvider, SearchItemType } from "../interfaces/IProvider";

type SpotifyAuthResponse = { access_token: string; refresh_token: string; token_type: "Bearer"; expires_in: number; };

export class SpotifyProvider implements IProvider {
	private readonly clientId: string;
	private readonly clientSecret: string;
	private authData!: SpotifyAuthResponse;
	private refreshTimeout: NodeJS.Timeout | null = null;
	public authenticated: boolean = false;

	constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;

		if (!this.clientId && !this.clientSecret) {
			throw new Error("clientId & clientSecret are required")
		}
	}

	public get getToken() {
		return this.authData;
	}

	public async authenticate() {
		try {
			this.authData = await this.getSpotifyAuth();

			console.log("✅ Авторизація успішна! Access Token:", this.authData.access_token);
			this.authenticated = true;

			this.scheduleTokenRefresh();
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error authenticating with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while authenticating with Spotify.");
		}
	}

	private async getSpotifyAuth(): Promise<SpotifyAuthResponse> {
		try {
			const response = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"),
				},
				body: new URLSearchParams({
					grant_type: "client_credentials",
				}),
			});
			
			if (!response.ok) throw new Error("Не вдалося отримати access_token");
			
			return await response.json() as SpotifyAuthResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error authenticating with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while authenticating with Spotify.");
		}
	}

	private scheduleTokenRefresh() {
		if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
	
		const refreshTime = (this.authData.expires_in - 300) * 1000; // Оновлюємо за 5 хв до закінчення
	
		this.refreshTimeout = setTimeout(() => {
		  this.refreshAccessToken();
		}, refreshTime);
	}

	private async refreshAccessToken() {
		try {
		  const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
			  "Content-Type": "application/x-www-form-urlencoded",
			  Authorization: "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"),
			},
			body: new URLSearchParams({
			  grant_type: "refresh_token",
			  refresh_token: this.authData.refresh_token,
			}),
		  });
	
		  if (!response.ok) throw new Error("Не вдалося оновити токен!");
	
		  this.authData = await response.json() as SpotifyAuthResponse;
	
		  console.log("🔄 Токен оновлено:", this.authData.access_token);
	
		  // Перезапускаємо таймер на оновлення
		  this.scheduleTokenRefresh();
		} catch (error) {
		  console.error("❌ Помилка оновлення токена:", error);
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
		
			const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type.join(",")}&market=${market}&limit=${limit}&offset=${offset}&include_external=${include_external}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.authData.access_token}`,
      				'Content-Type': 'application/json'
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
					Authorization: `Bearer ${this.authData.access_token}`,
      				'Content-Type': 'application/json'
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
						Authorization: `Bearer ${this.authData.access_token}`,
      					'Content-Type': 'application/json'
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
					Authorization: `Bearer ${this.authData.access_token}`,
      				'Content-Type': 'application/json'
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
					Authorization: `Bearer ${this.authData.access_token}`,
      				'Content-Type': 'application/json'
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