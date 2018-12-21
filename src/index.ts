import { time2ms, decodeKrc } from "./util"
import * as parser from './parser'
import { search, fetch } from "./fetcher"

const util = {
	time2ms,
	decodeKrc
}

export {
	parser,
	search, fetch,
	util
}

async function main() {
	try {
		// const lrcs = await search({ name: '谢东 - 笑脸', time: time2ms('04:12') })
		const lrcs = await search({ name: 'linkin park - numb', time: time2ms('03:07') })
		const lyric = lrcs[0]
		const lrc = await fetch({ id: lyric.id, accesskey: lyric.accesskey, fmt: 'krc', decodeKrc: true })
		// const result = parseLrc(lrc)
		const result = parser.parseKrc(lrc)
	} catch (err) {
		console.log(err)
	}
}

main()