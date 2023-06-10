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
const ppm = new ProPresenterModel()

export default class ProPresenterController extends EventEmitter {
	constructor() {
		super()
	}
	getFullPlayList() {
		const self = this
		return new Promise(async resolve => {
			const fullList = await ppm.getFullPlayLists()
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

	getFirstSongTitle() {
		const self = this
		return new Promise(async resolve => {
			try {
				let songName = null
				const thisWeekendPlaylist = await self.getThisWeekendPlayList()
				thisWeekendPlaylist.playlist.filter(item => {

					if (item.playlistItemLocation === '0:1') {
						songName = item.playlistItemName?.substring(0, item.playlistItemName.indexOf('-'))
					}
				})
				resolve(songName.trim())
			} catch (e) {
				console.log(e)
			}
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
		const today = DateTime.now().toFormat('c')
		if (today === 6) {
			isSaturday = true
		}
		else if (today === 7) {
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


	getCurrentSlide() {
		const self = this
		return new Promise(async resolve => {
			await ppm.getCurrentSlide()
			ppm.on('newSlides', (slide) => {
				if (slide.hasOwnProperty('slideIndex')) {
					self.emit('newSlide', slide)
				}
			})
			resolve(true)
		})
	}

}

async function init() {
	const prop = new ProPresenterController()
	await ppm.getCurrentSlide()
}

// Used for testing
//init()