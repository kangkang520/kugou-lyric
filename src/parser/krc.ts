import { stringeq } from "./../util"

export interface KrcWord {
	text: string
	duration: number
}

export interface KrcItem {
	time: number
	duration: number
	words: Array<KrcWord>
}

export interface KrcInfo {
	ti?: string
	ar?: string
	al?: string
	by?: string
	offset?: string
	items: Array<KrcItem>
}

function parseWords(str: string) {
	const words: Array<KrcWord> = []
	do {
		const match = str.match(/^<(\d+),(\d+),(\d+)>([\s\S]+?)(<|$)/)
		if (!match) break
		const [sub, offset, duration, _, text] = match
		const isEnd = sub[sub.length - 1] != '<'
		words.push({ text: text, duration: parseInt(duration) })
		if (isEnd) break
		else str = str.substr(sub.length - 1)
	} while (true)
	return words
}

/**
 * parse krc
 * @param content content of krc
 */
export function parseKrc(content: Buffer | string): KrcInfo {
	const krc: KrcInfo = { items: [] }
	//行分割
	const lines = (content + '').split(/\r?\n/).map(s => s.trim()).filter(s => !!s)
	//逐行转换
	lines.forEach(line => {
		//基本信息
		if (stringeq(line, '[ti:')) krc.ti = line.match(/\[ti:([\s\S]*?)\]/)![1]
		else if (stringeq(line, '[ar:')) krc.ar = line.match(/\[ar:([\s\S]*?)\]/)![1]
		else if (stringeq(line, '[al:')) krc.al = line.match(/\[al:([\s\S]*?)\]/)![1]
		else if (stringeq(line, '[by:')) krc.by = line.match(/\[by:([\s\S]*?)\]/)![1]
		else if (stringeq(line, '[offset:')) krc.offset = line.match(/\[offset:([\s\S]*?)\]/)![1]
		else {
			//时间和文本
			const match = line.match(/^((\[\d+,\d+\])+)([\s\S]+)$/)
			if (!match) return
			const times = match[1]
			const body = match[3]
			//时间
			const tmatch = times.match(/\[\d+,\d+\]/g)
			if (!tmatch) return
			//文本
			const words = parseWords(body)
			//每个时间
			tmatch.forEach(time => {
				const match = time.match(/^\[(\d+),(\d+)\]$/)
				if (!match) return
				krc.items.push({
					time: parseInt(match[1]),
					duration: parseInt(match[2]),
					words
				})
			})
		}
	})
	//排序
	krc.items = krc.items.sort((a, b) => {
		if (a.time == b.time) return 0
		if (a.time > b.time) return 1
		return -1
	})
	return krc
}