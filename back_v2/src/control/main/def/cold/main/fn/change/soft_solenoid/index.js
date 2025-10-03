const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
// Ступенчатое управление соленоидами испарителя
// Комби склад в режиме холодильник:
// 1. Сразу все соленоиды включаются/выключаются,
// если температура канала в норме (Тк > Tкан.зад. + Гис)

// 2. Если Темп. канала < Ткан.задания - Гис - Темп. канала замерзает,
// необходимо прогреть. В алгоритме плавного пуска ВНО отрабатывает логика
// на обогрев канала с учетом/без наличия соленоида подогрева, но если
// все узлы обогрева включены и по прошествию s.fan.wait, все еще
// требуется прогрев канала, то отрабатывает ЛОГИКА ОТКЛ СОЛЕНОИДОВ ИСПАРИТЕЛЯ
// Например, Испаритель1: сол 1, сол2   Испаритель2: сол3, сол4
// Отключение: Обогрев канала включен, сигнал на обогрев активен -> ждем время -> выкл сол4
// -> ждем время -> выкл сол2 -> ждем время -> выкл сол1 и сол2
// -> выдаем предупреждение "Низкая температура канала"
const { data: store, readAcc } = require('@store')

function softsol(idB, solenoid, sl, clr, accAuto) {
	const extraCO2 = readAcc(idB, 'building', 'co2')
	if (extraCO2.sol) return fnSol(idB, extraCO2, solenoid)
	const secId = clr.sectionId
	const map = accAuto?.cold?.softSol?.[secId]
	// Комби: Флаг для отключения соленоидов испарителя, true - все вспомагательные механизмы подогрева канала запущены
	const allStarted = store?.watchdog?.softFan?.[secId]?.allStarted
	// console.log(99001, 'SOFT SOLENOID', clr.name, store?.watchdog?.softFan?.[secId])
	// console.log(99001, 'SOFT SOLENOID', clr.name, store?.watchdog?.softFan?.[secId])

	solenoid.forEach((el) => {
		// Вкл/выкл соленоидов в обычном режиме
		if (!allStarted) return ctrlDO(el, idB, sl ? 'on' : 'off')
		// Текущий соленоид
		const cur = map.get(el._id)
		// Счетчик выключенных соленоидов
		// allStarted=true - "Низкая температура канала" - все ВНО и соленоид подогрева включены
		if (new Date() > cur?.date) {
			if (el.order === 1) return map.set('warning', true)
			ctrlDO(el, idB, 'off')
		}
	})
}

/**
 * Инициализация очереди отключения соленоидов,
 * @param {*} accAuto
 * @param {*} sect
 * @param {*} coolerS
 * @param {*} s
 */
function initSoftsol(accAuto, sect, coolerS, s) {
	// Флаг для отключения соленоидов испарителя, true - все вспомагательные механизмы подогрева канала запущены
	const allStarted = store?.watchdog?.softFan?.[sect._id]?.allStarted
	// Прекратить обновление точки отсчета при срабатывании флага отключения соленоидов
	if (accAuto?.cold?.softSol?.[sect._id] && allStarted) return
	accAuto.cold.softSol ??= {}
	accAuto.cold.softSol[sect._id] = coolerS
		.flatMap((el) => {
			return el.solenoid.map((e) => ({ ...e, orderClr: el.order }))
		})
		// .filter((el) => el.order > 1)
		.sort((a, b) => a.orderClr - b.orderClr && a.order - b.order)
		.reverse()
		.reduce((map, el, i) => {
			map.set(el._id, {
				...el,
				date: new Date(new Date().getTime() + (i + 1) * s.fan.wait * 1000),
			})
			return map
		}, new Map())
	accAuto.cold.softSol[sect._id].set('warning', false)
}
module.exports = { softsol, initSoftsol }

// Отключение соленоидов
function fnSol(idB, extraCO2, sol) {
	if (!extraCO2.sol) return
	sol.forEach((el) => ctrlDO(el, idB, 'off'))
}
