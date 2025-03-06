import { AlbumResponse, ArtistResponse, ExtendedPlaylistResponse, PlaylistResponse, SearchItemsResponse, TrackObject, TrackResponse } from "../../models";

export type SearchItemType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode' | 'audiobook';

/**
 * @deprecated This interface is deprecated and will be removed in future versions.
 */
export interface IProvider {
	getAvailableMarkets(): Promise<{ markets: string[]; }>;
	search(
		query: string,
		type: Required<SearchItemType[]>,
		market?: string,
		limit?: number,
		offcet?: number,
		include_external?: "audio"
	): Promise<TrackObject | AlbumResponse | SearchItemsResponse | PlaylistResponse>;
	searchTrack(id: string, market?: string): Promise<TrackResponse>;
	searchPlaylistInfo(playlist_id: string, market?: string): Promise<PlaylistResponse>;
	searchPlaylistTracks(playlist_id: string, market?: string): Promise<ExtendedPlaylistResponse>;
	searchAlbum(album_id: string, market?: string): Promise<AlbumResponse>;
	searchArtist(id: string, market?: string): Promise<ArtistResponse>;
	searchArtistTopTracks(id: string, market?: string): Promise<TrackObject>;
}