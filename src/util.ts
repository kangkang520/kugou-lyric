import zlib from 'zlib'
import { KRC_ENCODE_KEY } from './consts'

export function parseParam(param: { [i: string]: string | number }) {
	return Object.keys(param).map(k => `${k}=${encodeURIComponent(param[k] + '')}`).join('&')
}


/**
 * parse time ($Minutes:$Seconds) to ms
 * @param time music time, such as: xx:xx
 */
export function time2ms(time: string) {
	const [m, s] = time.split(/:/).map(s => parseInt(s.trim()))
	if (isNaN(m) || isNaN(s)) throw new Error('time format error')
	return (m * 60 + s) * 1000
}

/**
 * decode krc
 * @param content krc content
 */
export function decodeKrc(content: Buffer): Buffer {
	const buffer = new Buffer(content.length - 4)
	//解码
	for (let i = 4; i < content.length; i++) {
		buffer[i - 4] = content[i] ^ KRC_ENCODE_KEY[(i - 4) % 16]
	}
	//解压
	return zlib.unzipSync(buffer)
}

export function stringeq(str: string, sub: string, offset = 0) {
	let eq = true
	if (sub.length + offset > str.length) return false
	for (let i = 0; i < sub.length; i++) {
		if (sub[i] != str[i + offset]) return false
	}
	return eq
}