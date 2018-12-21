# kugou-lyric

search、 download、decode krc(or lrc) from Kugou


## Installation
```
npm install kugou-lyric
```

## Usage

it's verry easy to use this util, if you want to get more information, read `index.d.ts`.

there is a demo to show you how to use it.

```typescript
import { parser, search, fetch, util } from 'kugou-lyric'
// parser: util for parsing krc(decode first) and lrc
// search: search krc and lrc from Kugou
// fetch: download krc and lrc from Kugou
// util: some utils maybe you will use

async function main(){
    // search lyrics, "name" and "time" is required
    const lyrics = await search({ name: 'linkin park - Numb', time: time2ms('03:07') })
    if(!lyrics.length) return
    // get krc or lrc
    const krc = await fetch({
        id: lyrics[0].id,
        accesskey: lyrics[0].accesskey,
        fmt: 'krc',         // if you want to download lrc, using "lrc"
        decodeKrc: true,    // won't decode krc when false
                            // you can use "util.decodeKrc" function to decode it
	})
	// parse krc
	const result = parser.parseKrc(krc)
	// {ti:xx, ar:xx, items:[{time:xx, duration:xx, words:[{text:xx, duration:xx}, ...]]}, ...]}
}
main()
```