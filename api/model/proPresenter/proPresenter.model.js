import WebSocket from 'ws'
import dotenv from 'dotenv'
import {EventEmitter} from 'events'

dotenv.config({'path': '../../../.env'})
let isDev = true
const webSocketURI = ''
const ws = ''

export class ProPresenterModel extends EventEmitter {
	constructor() {
		super()
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

	getCurrentSlide() {
		return new Promise(async resolve => {
			//await this.init() // @TODO: Need to check if already initialized
			this.ws.send(
				JSON.stringify({
					action: 'presentationCurrent'
				})
			)
			this.ws.on('message', async message => {
				let data = JSON.parse(message)
				console.log(data)
				this.emit('newSlide', data)
			})

		})
	}

	getSermonSlideCounts(sermonSlideId = null) {
		return new Promise(async resolve => {
			this.ws.send(
				JSON.stringify({
					action: 'presentationRequest',
					presentationPath: sermonSlideId
				})
			)
			this.ws.on('message', async message => {
				let totalCount = 0
				let data = JSON.parse(message)
				if (data.hasOwnProperty('presentation') && data.presentation.hasOwnProperty('presentationSlideGroups')) {
					totalCount = data.presentation.presentationSlideGroups[0].groupSlides.length
				}
				resolve(totalCount)
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

async function init() {
	const prop = new ProPresenterModel()
	console.log(await prop.getCurrentSlide())
}



//init()
