/**
 * Planning Center Controller
 * Gets or changes status
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import PlanningCenterModel from '../../model/planningCenter/planningCenter.model.js'
import {EventEmitter} from 'events'
const pcm = new PlanningCenterModel()
const ApiInControl = null
export default class PlanningCenterController extends EventEmitter {
	constructor() {
		super()
	}
	getUserInControl() {
		const self = this
		return new Promise(async resolve => {
			const response = await pcm.getLiveControllerUser()
			resolve(response)
		})
	}
	setAPIControl() {
		const self = this
		return new Promise(async resolve => {
			const response = await pcm.setAPIUser()
			if (response === true) {
				self.ApiInControl = true
			} else {
				self.ApiInControl = false
			}
			resolve(response)
		})
	}
	releaseAPIControl() {
		return new Promise(async resolve => {
			const response = await pcm.releaseAPIUser()
			resolve(response)
		})
	}
	nextItem() {
		const self = this
		return new Promise(async resolve => {
			if (self.ApiInControl) {
				const response = await pcm.goToNext()
				resolve(true)
			} else {
				self.ApiInControl = true
				await self.setAPIControl()
				await self.nextItem()
			}
		})
	}
	previousItem() {
		const self = this
		return new Promise(async resolve => {
			if (self.ApiInControl) {
				const response = await pcm.goToPrevious()
				resolve(response)
			}
			else {
				await self.setAPIControl()
				self.previousItem()
			}
		})
	}

	getCurrentItemId() {
		const self = this
		return new Promise(async resolve => {
			let response = null
			await self.isApiUserInControl()
			if (self.ApiInControl) {
				response = await pcm.getCurrentItemId()
				if (typeof response === 'object' && response.relationships.item.data.hasOwnProperty('id') && response.relationships.item.data.id !== null) {
					resolve(response.relationships.item.data.id)
				}
			}
			else {
				console.log("No API control")
				await self.setAPIControl()
				self.getCurrentItemId()
			}
		})
	}

	getFirstSongId(songName) {
		const self = this
		return new Promise(async resolve => {
			const fullList = await pcm.getFullList()
			let itemId = null
			fullList.filter(item => {
				if (item.attributes.title.toLowerCase() === songName.toLowerCase()) {
					itemId = item.id
				}
			})
			resolve(itemId)
		})
	}

	isApiUserInControl() {
		const self = this
		return new Promise(async resolve => {
			try {
				const response = await self.getUserInControl()
				if (response === process.env.PLANCTR_API_ID) {
					self.ApiInControl = true
					resolve(true)
				} else {
					self.setAPIControl()
				}
				resolve(true)
			} catch (e) {
				console.log('error')
				console.log(e)
			}
		})
	}
}


async function init() {
	const pc = new PlanningCenterController
	pc.setAPIControl()
}

// Used for testing
// init()