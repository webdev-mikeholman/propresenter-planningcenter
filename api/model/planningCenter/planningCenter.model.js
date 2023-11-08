/**
 * Planning Center Model
 * Connecting to Planning Center to retrieve data
 *
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import { requests, post, update } from '../../util/requests.js'
import dotenv from 'dotenv'
dotenv.config({ path: '../../../.env' })

export default class PlanningCenterModel {
	serviceId = 0
	planId = 0
	isDev = process.env.ISDEV

	campusName = ''
	constructor() {
		if (this.isDev === 'true') {
			this.campusName = process.env.PLANCTR_DEV_CAMPUS_NAME
		} else {
			this.campusName = process.env.PLANCTR_CAMPUS_NAME
		}

		if (this.serviceId === 0) {
			this.getServiceId()
		}
	}

	//Retrieves the next service ID based on campus name
	getServiceId() {
		const self = this
		return new Promise(async (resolve) => {
			try {
				const response = await requests(`?where[name]=${self.campusName}`)
				if (response.length > 0) {
					self.serviceId = response[0].id
					resolve(response[0].id)
				} else {
					resolve({ error: 'No Service ID' })
				}
			} catch (err) {
				console.log(err.statusText)
			}
		})
	}

	//Retrieves the next plan ID based on service ID
	getPlanId() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			const response = await requests(`/${self.serviceId}/plans?order=sort_date&filter=future`)
			if (response.length > 0) {
				self.planId = response[0].id
				resolve(response[0].id)
			} else {
				resolve({ error: 'No Plan ID' })
			}
		})
	}

	//Retrieves the current active user controlling live updates
	getLiveControllerUser() {
		const self = this
		return new Promise(async (resolve) => {
			let data = null
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}
			// console.log('Service ID: ' + self.serviceId)
			// console.log('Plan ID: ' + self.planId)
			const response = await requests(`/${self.serviceId}/plans/${self.planId}/live?include=controller`)
			if (response.hasOwnProperty('links') && response.relationships.controller.data !== undefined && response.relationships.controller.data !== null) {
				data = response.relationships.controller.data.id
			}
			resolve(data)
		})
	}

	//Sets the live controller user to the API user
	setAPIUser() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/toggle_control?include=controller`)
			if (response.data.hasOwnProperty('links') && response.data.links.controller !== null) {
				if (response.data.relationships.controller.data.id === process.env.PLANCTR_API_ID) {
					resolve(true)
				} else {
					console.log('Need to set API user')
				}
			} else {
				resolve({ error: 'API user not set' })
			}
		})
	}

	//Sets the live controller user to no one
	releaseAPIUser() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/toggle_control?include=controller`)
			if (response.data.hasOwnProperty('links') && response.data.links.controller === null) {
				resolve(true)
			} else {
				self.releaseAPIUser()
			}
		})
	}

	//Goes to the next item
	goToNext() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/go_to_next_item`)
			resolve(response)
		})
	}

	//Goes to the previous item
	goToPrevious() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/go_to_previous_item`)
			resolve(response)
		})
	}

	//Retrieves the full list of items in today's service
	getFullList() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await requests(`/${self.serviceId}/plans/${self.planId}/live/items`)
			resolve(response)
		})
	}

	setCountdown(lengthOfTimeInSeconds) {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			await update(`/${self.serviceId}/plans/${self.planId}/items/864883373?length=${lengthOfTimeInSeconds}`)
			resolve(true)
		})
	}

	//Retrieves the current item ID
	getCurrentItemId() {
		const self = this
		return new Promise(async (resolve) => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}
			try {
				const response = await requests(`/${self.serviceId}/plans/${self.planId}/live/current_item_time`)
				resolve(response)
			} catch (err) {
				console.log(err.status)
			}
		})
	}
}

async function init() {
	// const pcm = new PlanningCenterModel()
	// serviceId = await pcm.getServiceId()
	// planId = await pcm.getPlanId()
	// await pcm.setAPIUser()
	// await pcm.getFullList()
	// await pcm.setCountdown()
}

// Used for testing
//init()
