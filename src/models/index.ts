type AlbumType = "album" | "single" | "compilation";
type ReleaseDatePrecision = "year" | "month" | "day";
type RestrictionsReason = "market" | "product" | "explicit";

interface ImageObject {
	url: Required<string>,
	height: Required<number | null>,
	width: Required<number | null>
}

interface CopyrightObject {
	text: string,
	type: string
}

export interface TrackObject {
	album: {
		album_type: Required<AlbumType>,
		total_tracks: Required<number>,
		available_markets: Required<string[]>,
		external_urls: {
			spotify: string
		},
		href: Required<string>,
		id: Required<string>,
		images: Required<ImageObject[]>,
		name: string,
		release_date: Required<string>,
		release_date_precision: Required<ReleaseDatePrecision>,
		restrictions: {
			reason: Required<RestrictionsReason>
		},
		type: "album",
		uri: Required<string>,
		artists: Required<SimplifiedArtistObject[]>
	},
	artists: SimplifiedArtistObject[],
	available_markets: string[],
	disc_number: number,
	duration_ms: number,
	explicit: boolean,
	external_ids: {
		isrc: string,
		ean: string,
		upc: string
	},
	external_urls: {
		spotify: string
	},
	href: Required<string>,
	id: Required<string>,
	is_playable: boolean,
	linked_from: {},
	restrictions: {
		reason: Required<RestrictionsReason>
	},
	name: Required<string>,
	popularity: Required<number>,
	/**
	 * @deprecated
	 * @description A link to a 30 second preview (MP3 format) of the track. Can be null
	 */
	preview_url: string | null,
	track_number: Required<number>,
	type: Required<"track">,
	uri: Required<string>,
	is_local: Required<boolean>
}

export interface EpisodeObject {
	/**
	 * @deprecated
	 * @description A URL to a 30 second preview (MP3 format) of the episode. null if not available.
	 */
	audio_preview_url: Required<string | null>,
	description: Required<string>,
	html_description: Required<string>,
	duration_ms: Required<number>,
	explicit: Required<boolean>,
	external_url: Required<{
		spotify: string
	}>,
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	is_externally_hosted: Required<boolean>,
	is_playable: Required<boolean>,
	/**
	 * @deprecated
	 * @description The language used in the episode, identified by a ISO 639 code. This field is deprecated and might be removed in the future. Please use the languages field instead.
	 */
	language: Required<string>,
	name: Required<string>,
	release_date: Required<string>,
	release_date_precision: Required<ReleaseDatePrecision>,
	resume_point: {
		fully_played: boolean,
		resume_position_ms: number,
	},
	type: "episode",
	restrictions: {
		reason: RestrictionsReason
	},
	show: Required<{
		available_markets: Required<string>,
		copyrights: Required<CopyrightObject[]>,
		description: Required<string>,
		html_description: Required<string>,
		explicit: Required<boolean>,
		external_url: Required<{
			spotify: string
		}>,
		href: Required<string>,
		id: Required<string>,
		images: Required<ImageObject[]>,
		is_externally_hosted: Required<boolean>,
		languages: Required<string[]>,
		media_type: Required<string>,
		name: Required<string>,
		publisher: Required<string>,
		type: Required<"show">,
		uri: Required<string>,
		total_episodes: Required<number>,
	}>,
}

interface ArtistObject {
	external_urls: {
		spotify: string
	},
	followers: {
		href: string | null,
		total: number
	},
	genres: string[],
	href: string,
	id: string,
	images: Required<ImageObject[]>,
	name: string,
	popularity: number,
	type: "artist",
	uri: string
}

interface PlaylistTrackObject {
	added_at: string,
	added_by: {
		external_urls: {
			spotify: string
		},
		followers: {
			href: string,
			total: number
		},
		href: string,
		id: string,
		type: "user",
		uri: string
	},
	is_local: boolean,
	track: TrackObject | EpisodeObject
}

interface SimplifiedTrackObject {
	artists: Required<ArtistObject[]>,
	available_markets: string[],
	disc_number: number,
	duration_ms: number,
	explicit: boolean,
	external_urls: {
		spotify: string
	},
	href: string,
	id: string,
	is_playable: boolean,
	linked_from: {
		external_urls: {
			spotify: string
		},
		href: string,
		id: string,
		type: string,
		uri: string
	},
	restrictions: {
		reason: Required<RestrictionsReason>
	},
	name: string,
	preview_url: string,
	track_number: number,
	type: string,
	uri: string,
	is_local: boolean
}

interface SimplifiedArtistObject {
	external_urls: {
		spotify: string
	},
	href: string,
	id: string,
	name: string,
	type: "artist",
	uri: string
}

interface SimplifiedAlbumObject {
	album_type: Required<AlbumType>,
	total_tracks: Required<number>,
	available_markets: Required<string[]>,
	external_urls: {
		spotify: Required<string>
	},
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	name: Required<string>,
	release_date: Required<string>,
	release_date_precision: Required<ReleaseDatePrecision>,
	restrictions: {
		reason: Required<RestrictionsReason>
	},
	type: "album",
	uri: Required<string>,
	artists:  Required<SimplifiedArtistObject[]>
}

interface SimplifiedPlaylistObject {
	collaborative: boolean,
	description: string,
	external_urls: {
		spotify: string
	},
	href: string,
	id: string,
	images: Required<ImageObject[]>,
	name: string,
	owner: {
		external_urls: {
			spotify: string
		},
		followers: {
			href: string | null,
			total: number
		},
		href: string,
		id: string,
		type: "user",
		uri: string,
		display_name: string | null
	},
	public: boolean,
	snapshot_id: string,
	tracks: {
		href: string,
		total: number
	},
	type: string,
	uri: string
}

interface SimplifiedShowObject {
	available_markets: Required<string[]>,
	copyrights: Required<CopyrightObject>,
	description: Required<string>,
	html_description: Required<string>,
	explicit: Required<boolean>,
	external_urls: Required<{
		spotify: string
	}>,
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	is_externally_hosted: Required<boolean>,
	languages: Required<string[]>,
	media_type: Required<string>,
	name: Required<string>,
	publisher: Required<string>,
	type: "show",
	uri: Required<string>,
	total_episodes: Required<number>
}

interface SimplifiedEpisodeObject {
	/**
	 * @deprecated
	 * @description A URL to a 30 second preview (MP3 format) of the episode. null if not available.
	 */
	audio_preview_url: Required<string | null>,
	description: Required<string>,
	html_description: Required<string>,
	duration_ms: Required<number>,
	explicit: Required<boolean>,
	external_urls: Required<{
		spotify: string
	}>,
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	is_externally_hosted: Required<boolean>,
	is_playable: Required<boolean>,
	/**
	 * @deprecated
	 * @description The language used in the episode, identified by a ISO 639 code. This field is deprecated and might be removed in the future. Please use the languages field instead.
	 */
	language: string,
	languages: Required<string[]>,
	name: Required<string[]>,
	release_date: Required<string[]>,
	release_date_precision: Required<ReleaseDatePrecision>,
	resume_point: {
		fully_played: boolean,
		resume_position_ms: number
	},
	type: Required<"episode">,
	uri: Required<string>,
	restrictions: {
		reason: Required<RestrictionsReason>
	}
}

interface SimplifiedAudiobookObject {
	authors: [{
		name: string
	}],
	available_markets: string[],
	copyrights: [
		{
			text: string,
			type: string
		}
	],
	description: string,
	html_description: string,
	edition: string,
	explicit: boolean,
	external_urls: {
		spotify: string
	},
	href: string,
	id: string,
	images: Required<ImageObject[]>,
	languages: string[],
	media_type: string,
	name: string,
	narrators: [{
		name: string
	}],
	publisher: string,
	type: "audiobook",
	uri: string,
	total_chapters: number
}

/**
 * @description Search response
 */
export interface SearchItemsResponse {
	tracks?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<TrackObject[]>
	}
	artists?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<ArtistObject>
	}
	albums?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedAlbumObject[]>
	}
	playlists?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedPlaylistObject[]>
	}
	shows?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedShowObject[]>
	}
	episodes?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedEpisodeObject>
	}
	audiobooks?: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedAudiobookObject>
	}
}

/**
 * @description An artist
 */
export interface ArtistResponse extends ArtistObject {}

/**
 * @description An track
 */
export interface TrackResponse extends TrackObject {}

/**
 * @description An album
 */
export interface AlbumResponse {
	album_type: Required<AlbumType>,
	total_tracks: Required<number>,
	available_markets: Required<string[]>,
	external_urls: Required<{
		spotify: string
	}>,
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	name: Required<string>,
	release_date: Required<string>,
	release_date_precision: Required<ReleaseDatePrecision>,
	restrictions: {
		reason: Required<RestrictionsReason>
	},
	type: "album",
	uri: Required<string>,
	artists: Required<SimplifiedArtistObject[]>,
	tracks: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<SimplifiedTrackObject[]>
	},
	copyrights: Required<CopyrightObject[]>,
	external_ids: {
		isrc: Required<string>,
		ean: Required<string>,
		upc: Required<string>
	},
	/**
	 * @deprecated The array is always empty.
	 */
	genres: Required<string[]>,
	label: Required<string>,
	popularity: Required<number>
}

/**
 * @description An playlist
 */
export interface PlaylistResponse {
	collaborative: Required<boolean>,
	description: Required<string>,
	external_urls: Required<{
		spotify: string
	}>,
	followers: {
		href: string | null,
		total: number
	},
	href: Required<string>,
	id: Required<string>,
	images: Required<ImageObject[]>,
	name: Required<string>,
	owner: {
		external_urls: {
			spotify: string
		},
		followers: {
			href: string,
			total: number
		},
		href: string,
		id: string,
		type: "user",
		uri: string,
		display_name: string
	},
	public: Required<boolean>,
	snapshot_id: Required<string>,
	tracks: {
		href: Required<string>,
		limit: Required<number>,
		next: Required<string | null>,
		offset: Required<number>,
		previous: Required<string | null>,
		total: Required<number>,
		items: Required<PlaylistTrackObject[]>
	},
	type: Required<string>,
	uri: Required<string>
}