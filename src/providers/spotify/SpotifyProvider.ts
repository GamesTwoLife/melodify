import axios from "axios";
import { AlbumResponse, ArtistResponse, ExtendedPlaylistResponse, ImageObject, PlaylistResponse, PlaylistTrackObject, SearchItemsResponse, TrackObject, TrackResponse, UserObject } from "../../models";
import { IProvider, SearchItemType, SearchResponse } from "../interfaces/IProvider";

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
				new URLSearchParams({
					grant_type: 'client_credentials'
				}).toString(),
				{
					headers: {
						'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			return response.data.access_token as string;
		} catch (error) {
			throw new Error(`Error fetching Spotify token: ${error}`);
		}
	}

	async getAvailableMarkets() {
		const token = await this.getSpotifyAuth()

		try {
			const response = await axios.get(
				'https://api.spotify.com/v1/markets',
				{
					headers: { 'Authorization': `Bearer ${token}` }
				}
			);

			return response.data as { markets: string[] };
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	async search(
		query: Required<string>,
		type: Required<SearchItemType[]>,
		market: string = "US",
		limit: number = 25,
		offset: number = 0,
		include_external = "audio"
	): Promise<SearchResponse> {
		const token = await this.getSpotifyAuth()

		const spotifyLinkRegex = /https:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]{22})(\?si=[a-z0-9]+)?/;
    	const match = query.match(spotifyLinkRegex);

		try {
			if (match) {
				const [, linkType, id] = match;

				switch (linkType) {
					case "track":
						return await this.searchTrack(id, market);
					
					case "album":
						return await this.searchAlbum(id, market);
					
					case "playlist":
						return await this.searchPlaylist(id, market);
					
					case "artist":
						return await this.searchArtistTopTracks(id, market);
				
					default:
						throw new Error(`Unsupported Spotify link type: ${linkType}`);
				}
			}

			const response = await axios.get(
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

	async searchTrack(id: Required<string>, market: string = "US"): Promise<TrackResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const response = await axios.get(
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

	async searchPlaylist(playlist_id: Required<string>, market: string = "US"): Promise<ExtendedPlaylistResponse> {
		const token = await this.getSpotifyAuth()

		let allTracks: PlaylistTrackObject[] = [];
		let offset = 0;
		const limit = 100;

		let playlistName = '';
		let playlistUrl = '';
		let playlistOwner: UserObject | null = null;
		let playlistImages: ImageObject[] = [];

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

				if (offset === 0) {
					playlistName = data.name;
					playlistUrl = data.external_urls.spotify;
					playlistOwner = data.owner;
					playlistImages = data.images;
				}

				const tracks = data.tracks.items;
				allTracks.push(...tracks);
	
				if (tracks.length < limit) break;
	
				offset += limit;
			}

			return  {
				playlistName,
				playlistUrl,
				playlistOwner: playlistOwner!,
				playlistImages,
				tracks: allTracks
			};
		} catch (error) {
			throw new Error(`Error search with Spotify: ${error}`);
		}
	}

	async searchAlbum(album_id: Required<string>, market: string = "US"): Promise<AlbumResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const url = `https://api.spotify.com/v1/albums/${album_id}`;
    
			const response = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` },
				params: { market }
			});

			return response.data as AlbumResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchArtist(id: Required<string>, market: string = "US"): Promise<ArtistResponse> {
		const token = await this.getSpotifyAuth()

		try {
			const url = `https://api.spotify.com/v1/artists/${id}`;
    
			const response = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` },
				params: { market }
			});

			return response.data as ArtistResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}

	async searchArtistTopTracks(id: Required<string>, market: string = "US"): Promise<TrackObject> {
		const token = await this.getSpotifyAuth()

		try {
			const url = `https://api.spotify.com/v1/artists/${id}/top-tracks`;
    
			const response = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` },
				params: { market }
			});

			return response.data.tracks as TrackObject;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error search with Spotify: ${error.message}`);
			}
			throw new Error("Unknown error occurred while search with Spotify.");
		}
	}
}