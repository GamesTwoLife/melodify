## Melodify

> A stable, updated and powerful music library with support for Spotify and YouTube.

[![npm](https://img.shields.io/npm/v/@gamestwolife/melodify?style=flat-square)](https://www.npmjs.com/package/@gamestwolife/melodify)
![Github Stars](https://img.shields.io/github/stars/GamesTwoLife/melodify?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/GamesTwoLife/melodify?style=flat-square)
![NPM](https://img.shields.io/npm/l/@gamestwolife/melodify?style=flat-square)

## Installation

To install `melodify`, use npm:

```bash
npm install @gamestwolife/melodify
```

### Example

```js
import { Melodify, LoadType } from "@gamestwolife/melodify";

const clientId = "your-client-id";
const clientSecret = "your-client-secret";
const apiKey = "your-youtube-api-key";

(async() => {
	const melodify = new Melodify({
		spotifyClientId: clientId,
		spotifyClientSecret: clientSecret
		youtubeApiKey: apiKey
	});
	
	const search = await melodify.searchProvider.search("Never Gonna Give You Up");

	switch (search.loadType) {
		case LoadType.SEARCH:
			{
				const trackName = `${search.data.tracks.items[0].artists.map(artist => artist.name).join(", ")} - ${search.data.tracks.items[0].name}`;
				console.log(`[${search.loadType}] Track "${trackName}" downloading...`);

				const filePath = await melodify.downloadTrack(trackName);
				console.log(filePath);
			}
			break;
	}
})()
```

### Code made with ❤ by @gamestwolife (GamesTwoLife)