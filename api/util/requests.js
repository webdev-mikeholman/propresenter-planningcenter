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
			console.log(err.response)
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
			console.log(err.response)
		}
	})
}

export {requests, post}