import axios from "axios";
import { AlbumResponse, ArtistResponse, PlaylistResponse, PlaylistTrackObject, SearchItemsResponse, TrackResponse } from "../../models";
import { IProvider, SearchItemType } from "../interfaces/IProvider";

export class SpotifyProvider implements IProvider {
	private readonly clientId: string;
	private readonly clientSecret: string;

	constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;

		if (!this.clientId && !this.clientSecret) {
			throw new Error("clientId & clientSecret are required")
		}
	}

	private async getSpotifyAuth(): Promise<string> {
		try {
			const response = await axios.post(
				'https://accounts.spotify.com/api/token',
				{
					headers: {
						'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					params: {
						grant_type: 'client_credentials'
					}
				}
			);

			return response.data.access_token as string;
		} catch (error) {
			throw new Error(`Error fetching Spotify token: ${error}`);
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
		const token = await this.getSpotifyAuth()

		try {
			const response = await axios.post(
				'https://api.spotify.com/v1/search',
				{
					headers: { 'Authorization': `Bearer ${token}` },
					params: {
						q: query,
						type: type.join(","),
						market,
						limit: limit.toString(),
						offset: offset.toString(),
						include_external,
					}
				}
			);

			return response.data as SearchItemsResponse;
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	async searchTrack(id: Required<string>, market: string = "EN"): Promise<TrackResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const response = await axios.post(
				`https://api.spotify.com/v1/tracks/${id}`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					},
					params: {
						market: market
					}
				}
			);

			return response.data as TrackResponse;
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	async searchPlaylist(playlist_id: Required<string>, market: string = "EN"): Promise<PlaylistTrackObject[]> {
		const token = await this.getSpotifyAuth()

		let allTracks: PlaylistTrackObject[] = [];
		let offset = 0;
		const limit = 100;

		try {
			while (true) {
				const response = await axios.get(
					`https://api.spotify.com/v1/playlists/${playlist_id}`,
					{
						headers: { 'Authorization': `Bearer ${token}` },
						params: {
							market: market,
							limit: limit.toString(),
							offset: offset.toString()
						}
					}
				);
	
				const data = response.data as PlaylistResponse;
	
				const tracks = data.tracks.items as PlaylistTrackObject[];
				allTracks.push(...tracks);
	
				if (tracks.length < limit) break;
	
				offset += limit;
			}

			return allTracks;
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	async searchAlbum(album_id: Required<string>, market: string = "EN"): Promise<AlbumResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const url = `https://api.spotify.com/v1/albums/${album_id}?market=${market}`;
    
			const response = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			return response.data as AlbumResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchArtist(id: Required<string>, market: string = "EN"): Promise<ArtistResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const url = `https://api.spotify.com/v1/artists/${id}?market=${market}`;
    
			const response = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			return response.data as ArtistResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}
}