/**
 * Master Controller
 * Controlling when Planning Center should change to next item
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */


//console.log('CHILD CREATED!', process.pid);
import fs from 'fs';
const schedule = JSON.parse(fs.readFileSync('../../model/schedule/schedule.json'))
import PreServiceController from '../planningCenter/preservice.controller.js'
import {DateTime as DT} from 'luxon'
const today = null
const dayOfWeek = null
const serviceToday = false
const startPreService = false
const startService = false
const startPostService = false

export default class MasterController {
	constructor() {
		process.on('message', async (msg) => {
			if (msg === 'Start service') {
				result.message = this.checkSchedules();
				if (result.message === 'done') {
					process.exit();
				}
				process.send(result);
			}
		});
		this.dayOfWeek = DT.now().toFormat('cccc')
		this.today = DT.now().toFormat('yyyy-LL-dd')
	}

	async checkSchedules() {
		const ps = new PreServiceController
		schedule.serviceTimes.find(info => {
			if (info.day === this.dayOfWeek) {
				this.serviceToday = true
			}
		});

		if (this.serviceToday) {
			const nextServiceTime = this.getNextServiceTime()

			const startTime = DT.fromISO(this.today + 'T' + nextServiceTime.time)
			const preServiceStartTime = startTime.minus({minutes: 29, seconds: 59})

			const bandOpenerInfo = await ps.getBandOpenerInfo()
			let bandSongLength = 0

			if (bandOpenerInfo.hasOwnProperty('attributes') && bandOpenerInfo.attributes.hasOwnProperty('length')) {
				bandSongLength = bandOpenerInfo.attributes.length
			}

			const countdown = setInterval(async () => {
				const now = DT.now()
				const remainingTime = startTime.diff(now)
				//console.log(remainingTime.toFormat('mm:ss'))
				if (remainingTime === 0) {
					console.log('Start live service')
					clearInterval(countdown)
					//this.startLiveService()
				} else if (remainingTime.toFormat('mm') == '00') {
					console.log(remainingTime.toFormat('ss'))
				} else {
					if (remainingTime.toFormat('mm:ss') === '30:00') {
						console.log(remainingTime.toFormat('mm:ss'))
						this.startPreService()
					}

					if (bandSongLength > 0 && Number(remainingTime.toFormat('ss')) === Number(bandSongLength)) {
						console.log(remainingTime.toFormat('mm:ss'))
						await this.startBandPrelude()
						console.log('Prelude-band started')
					}

				}
			}, 1000)
		}
	}

	startPreService() {
		return new Promise(async resolve => {
			const ps = new PreServiceController
			await ps.startPrelude()
			console.log('PreService started')
		})
	}

	startBandPrelude() {
		return new Promise(async resolve => {
			const ps = new PreServiceController
			await ps.startBandPrelude()

		})
	}

	getNextServiceTime() {
		const dayInfo = []
		const now = DT.now()
		schedule.serviceTimes.filter(async info => {
			if (info.day === this.dayOfWeek) {
				dayInfo.push(info)
			}
		});

		if (dayInfo.length > 0) {
			for (let i = 0; i < dayInfo.length; i++) {
				if (DT.fromISO(this.today + 'T' + dayInfo[i].time) >= now) {
					return (dayInfo[i])
				}
			}
		}
	}
}






async function init() {
	const mc = new MasterController
	mc.checkSchedules()
}

init()