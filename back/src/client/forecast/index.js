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
		if (!o[bldId]?.start) throw new Error('Ошибка: Склад выключен')
		if (o[bldId]?.automode !== 'cooling')
			throw new Error('Ошибка: Режим склада должен быть "Хранение"')
		const response = await api(apiConfig(o, { bldId }))
		console.log(553, response.data)
		if (!response.data) throw new Error('Сервер не отвечает')
		return response.data
	} catch (error) {
		console.error(error)
		return { error: error.message }
	}
}

module.exports = forecast
