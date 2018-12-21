import request from 'request'
import base64 from 'base64-js'
import { parseParam, decodeKrc } from './util'
import { LYRIC_SEARCH_URL, LYRIC_FETCH_URL } from './consts'

export interface KugouLyricInfo {
	id: string
	accesskey: string
	duration: number
	uid: string
	song: string
	singer: string
}

export interface LyricSearchOption {
	/** music name */
	name: string
	/** duration (unit:ms) */
	time: number
}

export interface LyricFetchOption {
	id: string
	accesskey: string
	fmt: 'lrc' | 'krc'
	/** if need decode krc, give me true */
	decodeKrc?: boolean
}

/**
 * search lyrics from Kugou
 * @param option search option
 */
export function search(option: LyricSearchOption): Promise<Array<KugouLyricInfo>> {
	return new Promise((resolve, reject) => {
		//http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=歌曲名&duration=歌曲总时长(毫秒)&hash=歌曲Hash值
		const url = LYRIC_SEARCH_URL + '?' + parseParam({ ver: 1, man: 'yes', client: 'pc', keyword: option.name, duration: option.time })
		let buffer = ''
		const req = request(url)
		let err: Error
		req.on('data', data => buffer += data)
		req.on('error', _err => err = _err)
		req.on('complete', () => {
			req.removeAllListeners()
			if (err) return reject(err)
			try {
				var { candidates } = JSON.parse(buffer)
				resolve(candidates)
			} catch (err) {
				reject(err)
			}
		})
	})
}

/**
 * get lyric from Kugou
 * @param option fetch option
 */
export function fetch(option: LyricFetchOption): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		//http://lyrics.kugou.com/download?ver=1&client=pc&id=10515303&accesskey=3A20F6A1933DE370EBA0187297F5477D&fmt=lrc&charset=utf8 
		const url = LYRIC_FETCH_URL + '?' + parseParam({ ver: 1, client: 'pc', id: option.id, accesskey: option.accesskey, fmt: option.fmt, charset: 'utf8' })
		const req = request(url)
		let buffer = ''
		let err: Error
		req.on('data', data => buffer += data)
		req.on('error', e => err = e)
		req.on('complete', () => {
			if (err) return reject(err)
			try {
				const res = JSON.parse(buffer)
				if (res.fmt != 'lrc' && res.fmt != 'krc') throw new Error('unkown format')
				if (!res.content) throw new Error('empty content')
				let buf = new Buffer(base64.toByteArray(res.content))
				if (res.fmt == 'krc' && option.decodeKrc) resolve(decodeKrc(buf))
				else resolve(buf)
			} catch (err) {
				reject(err)
			}
		})
	})
}