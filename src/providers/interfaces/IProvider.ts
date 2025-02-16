import { AlbumResponse, ArtistResponse, PlaylistResponse, SearchItemsResponse, TrackResponse } from "../../models";

export type SearchItemType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode' | 'audiobook';

export interface IProvider {
	search(query: string, type: Required<SearchItemType[]>, market?: string, limit?: number, offcet?: number, include_external?: "audio"): Promise<SearchItemsResponse>;
	searchTrack(id: string, market?: string): Promise<TrackResponse>;
	searchPlaylist(playlist_id: string, market?: string, fields?: string, additional_types?: string): Promise<PlaylistResponse>;
	searchAlbum(album_id: string, market?: string): Promise<AlbumResponse>;
	searchArtist(id: string): Promise<ArtistResponse>;
}