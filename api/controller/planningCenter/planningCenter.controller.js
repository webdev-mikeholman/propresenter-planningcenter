/**
 * Planning Center Controller
 * Gets or changes status
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import PlanningCenterModel from '../../model/planningCenter/planningCenter.model.js'
const pc = {}
export default class PlanningCenterController {
	ApiInControl = false
	constructor() {
		this.pc = new PlanningCenterModel
	}
	getUserInControl() {
		const self = this
		return new Promise(async resolve => {
			const response = await this.pc.getLiveControllerUser()
			if (response === true) {
				self.ApiInControl = true
			} else {
				self.ApiInControl = false
			}
			resolve(response)
		})
	}
	setAPIControl() {
		const self = this
		return new Promise(async resolve => {
			const response = await this.pc.setAPIUser()
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
			const response = await this.pc.releaseAPIUser()
			resolve(response)
		})
	}
	nextItem() {
		const self = this
		return new Promise(async resolve => {
			if (self.ApiInControl) {
				const response = await self.pc.goToNext()
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
				const response = await self.pc.goToPrevious()
				resolve(response)
			}
			else {
				await self.setAPIControl()
				self.nextItem()
			}
		})
	}
}


// async function init() {
// 	const pc = new PlanningCenterController
// 	pc.setAPIControl()
// }

// init()