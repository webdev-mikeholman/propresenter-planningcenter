/**
 * Master Controller
 * Controlling when Planning Center should change to next item
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schedule = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../model/schedule/schedule.json')))
import PreServiceController from '../planningCenter/preservice.controller.js'
import LiveServiceController from '../planningCenter/liveservice.controller.js'
import {DateTime as DT} from 'luxon'
const today = null
const dayOfWeek = null
const serviceToday = false
const startPreService = false
const startService = false
const startPostService = false
const serviceIsOver = true
const firstService = ''
const preserviceStarted = false
const result = {}

export default class MasterController {
	constructor() {
		process.on('message', async (msg) => {
			if (msg === 'Start service') {
				result.message = await this.checkSchedules();
				console.log(result.message)
				if (result.message === 'done') {
					process.exit();
				}
				process.send(result);
			}
		});
		this.dayOfWeek = DT.now().toFormat('cccc')
		this.today = DT.now().toFormat('yyyy-LL-dd')
		this.preserviceStarted = preserviceStarted
		this.serviceIsOver = serviceIsOver
	}

	// Verifies there are services 'today'
	checkSchedules() {
		return new Promise(async resolve => {
			const startOffset = 3 // seconds Need to subtract time to match PropPresenter
			const ps = new PreServiceController
			schedule.serviceTimes.find(info => {
				if (info.day === this.dayOfWeek) {
					this.serviceToday = true
				}
			});

			if (this.serviceToday) {
				const nextServiceTime = this.getNextServiceTime()
				if (nextServiceTime !== undefined) {
					const startTime = DT.fromISO(this.today + 'T' + nextServiceTime.time)
					this.firstService = nextServiceTime.firstService

					const bandOpenerInfo = await ps.getBandOpenerInfo()
					let bandSongLength = 0

					if (bandOpenerInfo.hasOwnProperty('attributes') && bandOpenerInfo.attributes.hasOwnProperty('length')) {
						bandSongLength = Number(bandOpenerInfo.attributes.length) + startOffset
					}

					// In console.log, shows seconds left fore going live
					const countdown = setInterval(async () => {
						const now = DT.now()
						const remainingTime = startTime.diff(now)
						//console.log(remainingTime.toFormat('mm:ss'))
						if (remainingTime.toFormat('ss') === '00') {
							console.log('Start live service')
							clearInterval(countdown)
							resolve(await this.startLiveService())
						} else if (remainingTime.toFormat('mm') == '00') {
							console.log(remainingTime.toFormat('ss'))
						} else {
							if ((this.firstService || (!this.firstService && this.serviceIsOver)) && remainingTime.toFormat('mm:ss') === '30:0' + startOffset.toString()) { // change 30:00 to variable and subtract time
								console.log('Starting Prelude')
								this.startPreService()
							}

							if ((this.firstService || (!this.firstService && this.serviceIsOver)) && Number(remainingTime.toFormat('mm')) < 30 && Number(remainingTime.toFormat('ss')) > bandSongLength) {
								if (this.preserviceStarted === false) {
									this.startPreService()
								}
								console.log(remainingTime.toFormat('mm:ss'))
							}

							// Works as long as length is over 1 minute
							if (bandSongLength > 0 && Number(remainingTime.toFormat('ss')) === bandSongLength) {
								console.log('Prelude-band started')
								console.log(remainingTime.toFormat('mm:ss'))
								await this.startBandPrelude()
							}
						}
					}, 1000)
				}
			} else {
				resolve(true)
			}
		})
	}

	// Moves Planning Center to the PreService Item
	startPreService() {
		return new Promise(async resolve => {
			const ps = new PreServiceController
			await ps.startPrelude()
			this.preserviceStarted = true;
			resolve(true)
		})
	}

	// Moves Planning Center to the Band Prelude Item
	startBandPrelude() {
		return new Promise(async resolve => {
			const ps = new PreServiceController
			await ps.startBandPrelude()
			resolve(true)
		})
	}

	// Starts live service
	startLiveService() {
		return new Promise(async resolve => {
			this.serviceIsOver = false
			const ls = new LiveServiceController()
			console.log('Starting LiveService')
			await ls.startLiveService()
			console.log('Watching LiveService')
			await ls.watchProPresenter()
			this.serviceIsOver = true
			console.log('Done!')
			resolve('done')
		})
	}

	// Get next scheduled service time
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

	// Used for testing
	mc.checkSchedules()
	//mc.startLiveService()
}

init()