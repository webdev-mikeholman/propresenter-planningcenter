/**
 * Live Service Controller
 * Controls Planning Center based on ProPresenter Information
 *
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import { ProPresenterModel } from '../../model/proPresenter/proPresenter.model.js'
import PlanningCenterModel from '../../model/planningCenter/planningCenter.model.js'
import PlanningCenterController from './planningCenter.controller.js'
import ProPresenterController from '../proPresenter/proPresenter.controller.js'

const pcm = new PlanningCenterModel()
const prop = {}
const ppm = new ProPresenterModel()
const ppc = new ProPresenterController()
export default class LiveServiceController extends PlanningCenterController {
	ApiInControl = false
	constructor() {
		super()
	}

	// Get the ProPresenter Pre Service slide ID
	getPreludeId() {
		const self = this
		return new Promise(async (resolve) => {
			const response = await pcm.getFullList()
			const item = response.filter((item) => {
				if (item.attributes.title.toLowerCase().indexOf('prelude') > -1) {
					return item.attributes.title
				}
			})
			resolve(item[0].id)
		})
	}

	// Start Live Service
	startLiveService() {
		const self = this
		return new Promise(async (resolve) => {
			await self.isApiUserInControl()
			const firstProPSongTitle = await ppc.getFirstSongTitle()
			console.log('Propresenter First title: ' + firstProPSongTitle)
			if (firstProPSongTitle !== undefined && firstProPSongTitle !== null) {
				const firstPlanCSongId = await self.getFirstSongId(firstProPSongTitle)
				console.log('First Planning Center Song Id: ' + firstPlanCSongId)
				const currentItem = await self.getCurrentItemId()
				console.log('Current song ID: ' + currentItem)

				// Temp fix.
				//await self.nextItem()
				resolve(true)
				if (firstPlanCSongId !== currentItem) {
					process.nextTick(async () => {
						await self.nextItem()
						self.startLiveService()
						resolve(true)
					})
				}
			}
		})
	}

	// Watch for slide changes
	watchProPresenter() {
		const self = this
		let currentSection = 0
		return new Promise(async (resolve) => {
			await ppc.getCurrentSlide()
			const postSlideId = Number(await ppc.getPostServiceOrderId())
			let postludeCounter = 0
			ppc.on('newSlide', async (data) => {
				if (data.hasOwnProperty('slideIndex')) {
					await self.isApiUserInControl()
					const selectionId = Number(data.presentationPath.substring(2, data.presentationPath.length))
					const slideIndex = data.slideIndex
					console.log(`Section ${selectionId}`)
					console.log(`Slide ${slideIndex + 1}`)
					if (selectionId > 1 && selectionId !== currentSection && selectionId > currentSection && slideIndex === 0 && selectionId < postSlideId) {
						currentSection = selectionId
						await self.nextItem()
					} else if (selectionId === postSlideId && slideIndex === 0) {
						if (postludeCounter < 1) {
							await self.nextItem()
							console.log('Postlude')
						} else {
							await self.nextItem()
							console.log('Next service')
							resolve(true)
						}
						postludeCounter++
					}
				}
			})
		})
	}

	// Get ProPresenter Post Service slide ID
	getPostludeId() {
		const self = this
		return new Promise(async (resolve) => {
			const response = await pcm.getFullList()
			const item = response.filter((item) => {
				if (item.attributes.title.toLowerCase().indexOf('postlude') > -1) {
					return item.attributes.title
				}
			})
			resolve(item)
		})
	}

	// Start Pre Service countdown
	startPrelude() {
		const self = this
		return new Promise(async (resolve) => {
			await self.isApiUserInControl()
			const preludeId = await self.getPreludeId()
			const currentItemId = await pcm.getCurrentItemId()
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

	// Start Pre Service Band Countdown
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
	const lc = new LiveServiceController()
	// lc.watchProPresenter();
	// lc.startLiveService();
}

// Used for testing
init()
