/**
 * Request Utility
 * Connecting to Planning Center to
 * make requests to change to another item
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import path from 'path';
import {fileURLToPath} from 'url';
import axios from 'axios'
import dotenv from 'dotenv'
import WebSocket from 'ws'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, '../../.env')})
const isDev = process.env.ISDEV
const isBackup = process.env.ISBACKUP
const requests = params => {
	return new Promise(async resolve => {
		const appId = process.env.PLANCTRPROD_APP_ID
		const secret = process.env.PLANCTRPROD_SECRET_KEY
		const url = process.env.PLANCTR_BASE_URL
		const paramsUrl = `${url}${params}`

		try {
			const {data} = await axios.get(paramsUrl !== '' ? paramsUrl : url, {
				auth: {
					username: appId,
					password: secret
				}
			})
			resolve(data.data)
		} catch (err) {
			console.log('error message');
			console.log(err.message)
			if (err.response.status !== 404) {
				console.log('Found error in get')
				console.log(err.response.status)
				console.log(err.response.statusText)
			}
			resolve({error: `${err.response.status} - ${err.response.statusText}`})
		}
	})
}

const post = params => {
	return new Promise(async resolve => {
		const appId = process.env.PLANCTRPROD_APP_ID
		const secret = process.env.PLANCTRPROD_SECRET_KEY
		const url = process.env.PLANCTR_BASE_URL
		//console.log(`appId: ${appId}`)
		const paramsUrl = `${url}${params}`
		try {
			const {data} = await axios.post(paramsUrl !== '' ? paramsUrl : url, {}, {
				auth: {
					username: appId,
					password: secret
				}
			})
			resolve(data)
		} catch (err) {
			console.log(err)
			console.log('Found error in post')
			console.log(err.response.status)
			console.log(err.response.statusText)
			resolve({error: `${err.response.status} - ${err.response.statusText}`})
		}
	})
}

const update = params => {
	return new Promise(async resolve => {
		const appId = process.env.PLANCTRPROD_APP_ID
		const secret = process.env.PLANCTRPROD_SECRET_KEY
		const url = process.env.PLANCTR_BASE_URL
		const updateParam = params.split('?')
		const additionalParams = convertStringToObject(updateParam[1])
		const paramsUrl = `${url}${updateParam[0]}`

		try {
			const {data} = await axios.patch(paramsUrl !== '' ? paramsUrl : url, {"data": {"attributes": additionalParams}}, {
				auth: {
					username: appId,
					password: secret
				}
			})
			resolve(data)
		} catch (err) {
			console.log(err)
			console.log('Found error in post')
			console.log(err.response.status)
			console.log(err.response.statusText)
			resolve({error: `${err.response.status} - ${err.response.statusText}`})
		}
	})
}

const convertStringToObject = data => {
	let newResult = ''
	newResult = '{"' + data.replace(/&/g, '", "')
		.replace(/=/g, '":"') + '"}',
		function (key, value) {
			return key === "" ? value : decodeURIComponent(value)
		}
	return JSON.parse(newResult)
}

const ws = () => {
	return new Promise(async resolve => {
		const url = await getWebSocketUrl()
		const wss = new WebSocket(url)
		console.log('New web socket created')
		resolve(wss)
	})
}

const getWebSocketUrl = () => {
	let url = ''
	return new Promise(async resolve => {
		if (isDev !== 'true') {
			if (!isBackup) {
				url = `ws://${process.env.PRO_PRESENTER_IP_REG}:${process.env.PRO_PRESENTER_PORT_REG}/${process.env.PRO_PRESENTER_TYPE_REG}`
			} else {
				url = `ws://${process.env.PRO_PRESENTER_IP_BU}:${process.env.PRO_PRESENTER_PORT_REG}/${process.env.PRO_PRESENTER_TYPE_REG}`
			}
		} else {
			url = `ws://${process.env.PRO_PRESENTER_IP_LOCAL}:${process.env.PRO_PRESENTER_PORT_LOCAL}/${process.env.PRO_PRESENTER_TYPE_LOCAL}`
		}

		resolve(url)
	})
}

export {requests, post, update, ws}