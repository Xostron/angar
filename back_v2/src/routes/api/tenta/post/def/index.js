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
const zero = require('./zero')

// callback формирование данных на запись в retain.json
const cb = {
	section,
	automode,
	start,
	product,
	sensor,
	setting,
}

const data = {
	// Команды по изменению retain.json
	section: fn('section'),
	automode: fn('automode'),
	start: fn('start'),
	product: fn('product'),
	sensor: fn('sensor'),
	setting: fn('setting'),
	// Команды управления
	fan,
	valve,
	reset,
	tune,
	warming,
	zero,
}

module.exports = data

// Запись в retain.json
function fn(code) {
	return async function (obj) {
		try {
			await createAndModifySync(obj, 'data', retainDir, cb[code])
			return true
		} catch (error) {
			throw new Error('Мобильный клиент: Запись данных не успешна!')
		}
	}
}
