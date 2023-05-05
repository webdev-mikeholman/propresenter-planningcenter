import WebSocket from 'ws'
import dotenv from 'dotenv'
dotenv.config({'path': '../../../.env'})
let isDev = true
const webSocketURI = ''
const ws = ''

export class ProPresenterModel {
	constructor() {
		this.getWebSocket()
		this.ws = new WebSocket(this.webSocketURI)
	}

	getWebSocket() {
		return new Promise(async resolve => {
			if (!isDev) {
				this.webSocketURI = `ws://${process.env.PRO_PRESENTER_IP_REG}:${process.env.PRO_PRESENTER_PORT_REG}/${process.env.PRO_PRESENTER_TYPE_REG}`
			} else {
				this.webSocketURI = `ws://${process.env.PRO_PRESENTER_IP_LOCAL}:${process.env.PRO_PRESENTER_PORT_LOCAL}/${process.env.PRO_PRESENTER_TYPE_LOCAL}`
			}
			resolve(this.webSocketURI)
		})
	}

	getFullPlayLists() {
		return new Promise(async resolve => {
			await this.init()
			this.ws.send(
				JSON.stringify({
					action: 'playlistRequestAll'
				})
			)
			this.ws.on('message', async message => {
				let data = JSON.parse(message)

				if (data.hasOwnProperty('playlistAll')) {
					resolve(data)
				}
			})
		})
	}

	init() {
		return new Promise(resolve => {
			this.ws.on('open', async () => {
				this.ws.send(
					JSON.stringify({
						action: 'authenticate',
						protocol: '701',
						password: 'controller'
					})
				)
				resolve(true)
			})
		})
	}
}

// async function init() {
// 	const prop = new ProPresenter()
// 	console.log(await prop.getFullSongList())
// }



// init()
