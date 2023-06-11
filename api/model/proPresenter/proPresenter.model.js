/**
 * ProPresenter Model
 * Connecting to ProPresenter to retrieve data
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */


import dotenv from 'dotenv'
import {EventEmitter} from 'events'
import {ws} from '../../util/requests.js'

dotenv.config({'path': '../../../.env'})
let propData = {}
const isDev = process.env.ISDEV
export class ProPresenterModel extends EventEmitter {
	constructor() {
		super()
		this.isDev = isDev
	}

	// Get ProPresenter Slide Information
	getPropData() {
		return new Promise(async resolve => {
			const response = await ws()
			this.propData = response
			resolve(true)
		})
	}

	// Get ProPresenter Full PlayList
	getFullPlayLists() {
		return new Promise(async resolve => {
			if (typeof this.propData === 'undefined' || this.propData.readyState !== this.propData.OPEN) {
				await this.init()
			}
			this.propData.send(
				JSON.stringify({
					action: 'playlistRequestAll'
				})
			)
			this.propData.on('message', async playlist => {
				let data = JSON.parse(playlist)
				if (data.hasOwnProperty('playlistAll')) {
					resolve(data)
				}
			})
		})
	}

	// Get Current Slide from ProPresenter
	getCurrentSlide() {
		return new Promise(async resolve => {
			let hasEmitted = false
			if (typeof this.propData === 'undefined' || this.propData.readyState !== this.propData.OPEN) {
				await this.init()
			}
			this.propData.send(
				JSON.stringify({
					action: 'presentationCurrent'
				})
			)
			this.propData.on('message', async message => {
				let data = JSON.parse(message)
				if (data.hasOwnProperty('slideIndex')) {
					if (this.isDev === 'true') {
						// ProPresenter sends 2 of everything.  This makes sure only one slide goes through
						if (!hasEmitted) {
							this.emit('newSlides', data)
						}
						hasEmitted = !hasEmitted
					} else {
						this.emit('newSlides', data)
					}
				}

			})
			resolve(true)
		})
	}

	init() {
		const self = this
		return new Promise(async resolve => {
			if (typeof self.propData === 'undefined') {
				await self.getPropData()
			}
			self.propData.on('open', async () => {
				self.propData.send(
					JSON.stringify({
						action: 'authenticate',
						protocol: '701',
						password: 'controller'
					})
				)
				self.propData.on('error', err => {
					console.log('Error from WS')
					console.error(err)
				})
				resolve(true)
			})
		})
	}
}

async function init() {
	const prop = new ProPresenterModel()
	//await prop.init()

	//await prop.getCurrentSlide()
}


// Used for testing
//init()
