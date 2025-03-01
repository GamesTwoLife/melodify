import { AlbumResponse, ArtistResponse, ExtendedPlaylistResponse, SearchItemsResponse, TrackObject, TrackResponse } from "../../models";

export type SearchItemType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode' | 'audiobook';
export type SearchResponse =
	TrackObject |
	AlbumResponse |
	SearchItemsResponse |
	ExtendedPlaylistResponse

export interface IProvider {
	search(
		query: string,
		type: Required<SearchItemType[]>,
		market?: string,
		limit?: number,
		offcet?: number,
		include_external?: "audio"
	): Promise<SearchResponse>;
	searchTrack(id: string, market?: string): Promise<TrackResponse>;
	searchPlaylist(playlist_id: string, market?: string): Promise<ExtendedPlaylistResponse>;
	searchAlbum(album_id: string, market?: string): Promise<AlbumResponse>;
	searchArtist(id: string, market?: string): Promise<ArtistResponse>;
	searchArtistTopTracks(id: string, market?: string): Promise<TrackObject>;
}