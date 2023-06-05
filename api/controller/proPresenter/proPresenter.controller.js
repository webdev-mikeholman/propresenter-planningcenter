/**
 * ProPresenter Controller
 * Gets slide info from ProPresenter
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */


import {ProPresenterModel} from '../../model/proPresenter/proPresenter.model.js'
import {DateTime} from 'luxon'
import {EventEmitter} from 'events'

const prop = {}
export default class ProPresenterController extends EventEmitter {
	setList = []
	sermonSlideCount = 0
	constructor() {
		super()
		this.prop = new ProPresenterModel
		this.prop.on('newSlide', (data) => {
			console.log('slide')
			console.log(data)
			if (data.hasOwnProperty('presentationPath') && data.presentationPath === '0:9') {
				this.setRemainingSermonSlides(data.slideIndex)
			}
		})
	}
	getFullPlayList() {
		const self = this
		return new Promise(async resolve => {
			const fullList = await self.prop.getFullPlayLists()
			resolve(fullList.playlistAll)
		})
	}

	getThisWeekendPlayList() {
		const self = this
		return new Promise(async resolve => {
			const weekendDate = self.getDateForNextSunday()
			const fullList = await self.getFullPlayList()
			const weekendSongList = fullList.filter(item => {
				let listName = ''
				const dateStringCount = item.playlistName.split('-').length
				if (dateStringCount > 3) {
					listName = item.playlistName.substring(0, 7) + item.playlistName.substring(10, 13)
				} else {
					listName = item.playlistName
				}

				if (listName.indexOf(weekendDate) === 0) {
					return item
				}
			})
			resolve(weekendSongList[0])
		})
	}

	getPreServiceOrderId() {
		const self = this
		return new Promise(async resolve => {
			let orderId = null
			const thisWeekendPlaylist = await self.getThisWeekendPlayList()
			thisWeekendPlaylist.playlist.filter(item => {
				if (item.playlistItemName.indexOf('Pre-Service') > -1) {
					const orderNum = item.playlistItemLocation.substring(2, item.playlistItemLocation.length)
					orderId = orderNum
				}
			})
			resolve(orderId)
		})
	}

	getPostServiceOrderId() {
		const self = this
		return new Promise(async resolve => {
			let orderId = null
			const thisWeekendPlaylist = await self.getThisWeekendPlayList()
			thisWeekendPlaylist.playlist.filter(item => {
				if (item.playlistItemName.indexOf('Post-Service') > -1) {
					const orderNum = item.playlistItemLocation.substring(2, item.playlistItemLocation.length)
					orderId = orderNum
				}
			})
			resolve(orderId)
		})
	}

	getDateForNextSaturday() {
		let isSaturday = false
		let isSunday = false
		let saturdayDate = ''
		const today = DateTime.now().toFormat('d')
		if (today === 6) {
			isSaturday = true
		}
		else if (today === 6) {
			isSunday = true
		}

		if (!isSaturday && !isSunday) {
			saturdayDate = DateTime.now().plus({days: 6 - today}).toFormat('y-MM-dd')
		}
		else if (isSaturday) {
			saturdayDate = DateTime.now().toFormat('y-MM-dd')
		}
		else if (isSunday) {
			saturdayDate = DateTime.now().plus({days: 6}).toFormat('y-MM-dd')
		}

		return saturdayDate
	}

	getDateForNextSunday() {
		let isSaturday = false
		let isSunday = false
		let sundayDate = ''
		const today = DateTime.now().toFormat('d')
		if (today === 6) {
			isSaturday = true
		}
		else if (today === 6) {
			isSunday = true
		}

		if (!isSaturday && !isSunday) {
			sundayDate = DateTime.now().plus({days: 7 - today}).toFormat('y-MM-dd')
		}
		else if (isSunday) {
			sundayDate = DateTime.now().toFormat('y-MM-dd')
		}

		return sundayDate

	}

	getSermonSlideId() {
		const self = this
		return new Promise(async resolve => {
			const fullList = await self.getFullPlayList()
			fullList[0].playlist.filter(item => {
				if (item.playlistItemName.indexOf('Sermon - ') > -1) {
					resolve(item.playlistItemLocation)
				}
			})
		})
	}

	getSermonSlideCount() {
		const self = this
		return new Promise(async resolve => {
			const slideId = await self.getSermonSlideId()
			const count = await self.prop.getSermonSlideCounts(slideId)
			self.sermonSlideCount = count
			console.log(count)
			resolve(true)
		})
	}


	async getCurrentSlide() {
		console.log('Getting current slide')
		await this.prop.getCurrentSlide()
		console.log('Got current slide')
	}

}

async function init() {
	const prop = new ProPresenterController()
	await prop.getSermonSlideCount()
	console.log('got count')
	console.log(await prop.getCurrentSlide())
}

init()