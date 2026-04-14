const { data: store } = require('@store')
const fs = require('fs')

const BAT_STATUS_PATH = '/sys/class/power_supply/BAT0/status'

function battery() {
	if (process.platform !== 'linux') return
	// console.log(1, 'Проверка состояния электропитания')
	try {
		const batStatus = fs.readFileSync(BAT_STATUS_PATH, 'utf8').trim()
		store.battery = batStatus === 'Discharging'
		if (store.battery) console.log('⚠️ Система работает от батареи!')
		else console.log('🔌 Питание от сети.')
	} catch (error) {
		console.error('⚠️ Не удалось определить состояние питания')
	}
}

module.exports = battery
