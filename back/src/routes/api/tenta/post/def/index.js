const { data: store } = require('@store')
const fan = require('./fan')
const valve = require('./valve')
const reset = require('./reset')
const tune = require('./tune')
const warming = require('./warming')
const zero = require('./zero')


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
			store.mobile[code] ??= {}
			store.mobile[code] = { ...store.mobile[code], ...obj }
			return true
		} catch (error) {
			throw new Error('Мобильный клиент: Запись данных не успешна!')
		}
	}
}
