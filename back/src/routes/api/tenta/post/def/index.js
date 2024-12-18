const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const section = require('./section')
const automode = require('./automode')
const start = require('./start')
const product = require('./product')
const fan = require('./fan')
const valve = require('./valve')
const reset = require('./reset')
const sensor = require('./sensor')
const setting = require('./setting')
const tune = require('./tune')
const warming = require('./warming')

const data = {
	section: fn('section'),
	automode: fn('automode'),
	start: fn('start'),
	product: fn('product'),
	sensor: fn('sensor'),
	setting: fn('setting'),
	fan,
	valve,
	reset,
	tune,
	warming,
}

module.exports = data

function fn(code) {
	return function (obj) {
		return new Promise((resolve, reject) => {
			try {
				createAndModifySync(obj, 'data', retainDir, cb[code])
				resolve()
			} catch (error) {
				reject(error)
			}
		})
	}
}
const cb = {
	section,
	automode,
	start,
	product,
	sensor,
	setting,
}
