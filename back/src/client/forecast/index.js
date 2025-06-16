const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
const { data: store } = require('@store')
const api = require('@tool/api')

const apiConfig = (data, params) => ({
	method: 'GET',
	maxBodyLength: Infinity,
	url: 'angar/forecast',
	headers: { 'Content-Type': 'application/json', ip: process.env.IP },
	data,
	params,
})

async function forecast(bldId) {
	try {
		if (!bldId) return false
		const { retain, total, humAbs } = store.value
		const setting = store.calcSetting
		const o = {}
		o[bldId] = {
			start: retain?.[bldId]?.start,
			automode: retain?.[bldId]?.automode,
			product: retain?.[bldId]?.product,
			tout: total.tout,
			hout: total.hout,
			tprd: total?.[bldId]?.tprd,
			houtAbs: humAbs?.out?.[bldId] ?? humAbs?.out?.com,
			hinAbs: humAbs?.in?.[bldId],
			target: setting?.[bldId]?.cooling?.target,
		}
		const response = await api(apiConfig(o, { bldId }))
		console.log(553, response.data)
		return response.data
	} catch (error) {
		console.log(error.toJSON()?.message)
		throw error
	}
}

module.exports = forecast
