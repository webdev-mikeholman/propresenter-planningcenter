/**
 * PreService Controller
 * Moves Planning Center to the PreService item
 *
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import PlanningCenterModel from '../../model/planningCenter/planningCenter.model.js'
import PlanningCenterController from './planningCenter.controller.js'
import { ProPresenterModel } from '../../model/proPresenter/proPresenter.model.js'
const pcm = {}

export default class PreServiceController extends PlanningCenterController {
	ApiInControl = false
	constructor() {
		super()
		this.pcm = new PlanningCenterModel()
		this.ppm = new ProPresenterModel()
	}

	getPreludeId() {
		const self = this
		return new Promise(async (resolve) => {
			const response = await self.pcm.getFullList()
			const item = response.filter((item) => {
				if (item.attributes.title.toLowerCase().indexOf('prelude') > -1) {
					return item.attributes.title
				}
			})
			resolve(item[0].id)
		})
	}

	getBandOpenerInfo() {
		const self = this
		let item = []
		return new Promise(async (resolve) => {
			try {
				const response = await self.pcm.getFullList()

				item = response.filter((item) => {
					if (item.attributes.title.toLowerCase().indexOf('-band') > -1) {
						return item.attributes.title
					}
				})
				resolve(item[0])
			} catch (err) {
				console.log('Error getting band opener info')
				console.log(err.message())
				resolve(item)
			}
		})
	}

	getPostludeId() {
		const self = this
		return new Promise(async (resolve) => {
			const response = await self.pcm.getFullList()
			const item = response.filter((item) => {
				if (item.attributes.title.toLowerCase().indexOf('postlude') > -1) {
					return item.attributes.title
				}
			})
			resolve(item[0].id)
		})
	}

	syncCountdown(remainingTime = 1800) {
		const self = this
		return new Promise(async (resolve) => {
			await self.pcm.setCountdown(remainingTime)
			resolve(true)
		})
	}

	startPrelude() {
		const self = this
		return new Promise(async (resolve) => {
			await self.isApiUserInControl()
			const preludeId = await self.getPreludeId()
			const currentItemId = await self.pcm.getCurrentItemId()
			if (currentItemId.hasOwnProperty('error')) {
				const nextItemInfo = await self.nextItem()
				await self.startPrelude()
			} else if (currentItemId.relationships.item.data === null || preludeId !== currentItemId.relationships.item.data.id) {
				const nextItemInfo = await self.nextItem()
				await self.startPrelude()
			} else {
				resolve(true)
			}
		})
	}

	startBandPrelude() {
		const self = this
		return new Promise(async (resolve) => {
			await self.isApiUserInControl()
			const nextItemInfo = await self.nextItem()
			resolve(true)
		})
	}
}

async function init() {
	const pc = new PreServiceController()
	await pc.startPrelude()
}

// Used for testing
//init()
