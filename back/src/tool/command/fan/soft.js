const { isExtralrm } = require('@tool/message/extralrm')
const { sensor } = require('@tool/command/sensor')
const { ctrlB } = require('@tool/command/fan')
const { data: store } = require('@store')

// Плавный пуск/стоп вентиляторов на всех секция по цепочке
function ctrlFSoft(bldId, obj, s, seB, m, resultFan) {
	// Плавный пуск (все вентиляторы на контакторах)
	main(bldId, obj, s, seB, m, resultFan)
	// Плавный пуск (1 вентилятор на ПЧ, остальные на контакторах)
}

function main(bldId, obj, s, seB, m, resultFan) {
	if (!resultFan.list?.length) return
	resultFan.list.forEach((secId) => {
		const aCmd = store.aCmd?.[secId]?.fan
		const fans = resultFan.fan.filter((el) => el.owner.id === secId)
		if (!aCmd) return
		softStartSec(obj, bldId, secId, aCmd, fans, s, seB)
	})
}

module.exports = ctrlFSoft

function softStartSec(obj, bldId, secId, aCmd, fans, s, seB) {
	// TODO
	// 1. Включить 1 вентилятор на секциях
	// 2. Подождать s.fan.delay
	// 3. Измерить давление канала
	// 4. Если давление от вентилятора/ов больше, отключить вентилятор на секции (если из больше 1)
	// 4. Если давление меньше, подключить следующий
	// 5. Повтор со 2 по 4
	const se = sensor(bldId, secId, obj)
	console.log(444, bldId, secId, aCmd, se)
	if (aCmd.type != 'on') return



	// Запуск цепочки
	if (!store.watchdog?.[fans[0]._id]?.on) {
		store.watchdog ??= {}
		store.watchdog[fans[0]._id] ??= {}
		store.watchdog[fans[0]._id].on = new Date(new Date().getTime() + aCmd.delay * 1000)
	}
	// Проверка условий и подключение/отключение вентилятора
	const queue = []
	fans.forEach((f, i) => {
		if (!store.watchdog?.[f._id]?.on) return
		if (compareTime(store.watchdog[f._id].on, aCmd.delay)) return
		// if (se.p < s.fan.pressure)
	})
	// // Проверка истекло ли время с момента запуска
	if (compareTime(store.watchdog[fanSec[0]._id].on, aCmd.delay)) {
	}
	for (let i = 1; i < fanSec.length; i++) {
		const prev = fanSec[i - 1]
		if (store.watchdog[prev._id].next) {
			ctrlB(fanSec[i], buildingId, aCmd.type)
			// store.watchdog[fanSec[i]._id] ??= {}
			// store.watchdog[fanSec[i]._id].on = new Date()
		}
	}
}
