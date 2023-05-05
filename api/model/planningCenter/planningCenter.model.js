import {requests, post} from '../../util/requests.js'
import dotenv from 'dotenv'
dotenv.config({'path': '../../../.env'})


export class PlanningCenterModel {
	serviceId = 0
	planId = 0
	isDev = true
	campusName = ''
	constructor() {
		if (this.isDev) {
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
		return new Promise(async resolve => {
			try {
				const response = await requests(`?where[name]=${self.campusName}`)
				if (response.length > 0) {
					self.serviceId = response[0].id
					resolve(response[0].id)
				} else {
					resolve({error: 'No Service ID'})
				}
			} catch (err) {
				console.log(err.statusText)
			}
		})
	}

	//Retrieves the next plan ID based on service ID
	getPlanId() {
		const self = this
		return new Promise(async resolve => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			const response = await requests(`/${self.serviceId}/plans?order=sort_date&filter=future`)
			if (response.length > 0) {
				self.planId = response[0].id
				resolve(response[0].id)
			} else {
				resolve({error: 'No Plan ID'})
			}
		})
	}

	//@TODO: Need to get song list.  Need order of song list.  Need do be able to switch to the right slides (e.g. Prelude, Prelude-Band, and Postlude)

	//Retrieves the current active user controlling live updates
	getLiveControllerUser() {
		const self = this
		return new Promise(async resolve => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}
			const response = await requests(`/${self.serviceId}/plans/${self.planId}/live?include=controller`)
			if (response.hasOwnProperty('included') && response.included.length > 0) {
				resolve(response.included)
			} else {
				resolve({error: 'No Live Controller ID'})
			}
		})
	}

	//Sets the live controller user to the API user
	setAPIUser() {  // @NOTE:  Need to set a counter for error attempts
		const self = this
		return new Promise(async resolve => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/toggle_control?include=controller`)
			if (response.data.hasOwnProperty('links') && response.data.links.controller !== null) {
				if (response.included[0].id === process.env.PLANCTR_API_ID) {
					resolve(true)
				}
				else {
					self.setAPIUser()
				}
			} else {
				resolve({error: 'No Live Controller ID'})
			}
		})
	}

	//Sets the live controller user to no one
	releaseAPIUser() {  // @NOTE:  Need to set a counter for error attempts
		const self = this
		return new Promise(async resolve => {
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
		return new Promise(async resolve => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/go_to_next_item?include=current_item_time`)
			resolve(response)
		})
	}

	//Goes to the previous item
	goToPrevious() {
		const self = this
		return new Promise(async resolve => {
			if (self.serviceId === 0) {
				await self.getServiceId()
			}
			if (self.planId === 0) {
				await self.getPlanId()
			}

			const response = await post(`/${self.serviceId}/plans/${self.planId}/live/go_to_previous_item?include=current_item_time`)
			resolve(response)
		})
	}

}

// set for testing purposes
// async function init() {
// 	const pc = new PlanningCenter()
// 	serviceId = await pc.getServiceId()
// 	planId = await pc.getPlanId()
// }

//init()