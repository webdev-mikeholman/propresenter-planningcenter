/**
 * Request Utility
 * Connecting to Planning Center to
 * make requests to change to another item
 * 
 * by Mike Holman
 * webdev.mikeholman@gmail.com
 * Copyright (c) 2023
 */

import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({path: '../../../.env'})

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
			console.log('Found error in post')
			console.log(err.response.status)
			console.log(err.response.statusText)
			resolve({error: `${err.response.status} - ${err.response.statusText}`})
		}
	})
}

export {requests, post}