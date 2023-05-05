import {ProPresenterModel} from '../../model/proPresenter/proPresenter.model.js'
import {DateTime} from 'luxon'

const prop = {}
export default class ProPresenterController {
	setList = []
	constructor() {
		this.prop = new ProPresenterModel
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

}

async function init() {
	const prop = new ProPresenterController()
	//console.log(await prop.getPostServiceOrderId())
}

init()