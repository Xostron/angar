const { arrCtrlDO, ctrlDO, ctrlADO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
const { checklist } = require('../fn/init_data')
// 10сек
const _delay = 10_000

// Тест вкл ВНО по очереди
function fan(bld, obj, m, demo, permission, code) {
	// Сейчас в работе другой тест
	if (!permission) {
		// Активен - Тест включения всех ВНО
		if (code == 'allFan') return
		// Активен - Тест испарителей, обычные ВНО отключаем, испарители не трогаем
		if (code == 'coolerCool') return arrCtrlDO(bld._id, m.fanBN, 'off')

		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!m.fanBexc) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}

	// Тест
	singleOn(bld, obj, m.fanBexc, demo)
}

function singleOn(bld, obj, fans, demo) {
	demo.acc ??= {}
	demo.acc.order ??= 0
	// Все ВНО проверены
	// if (demo.acc.order === -1) return
	demo.acc.time ??= new Date()
	const chk = checklist[demo.order]

	fans.forEach((el, i) => {
		// ВНО не равный номеру очереди - dsrk.xftv
		if (demo.acc.order !== i) {
			ctrlADO(el, bld._id, 'off')
			return
		}
		// Текущий ВНО (равный номеру очереди)
		const t = compareTime(demo.acc.time, chk.last)
		// Время прошло
		if (t) {
			ctrlADO(el, bld._id, 'off')
			// Переключение на следующий ВНО с проверкой конца очереди
			demo.acc.order++
			demo.acc.time = new Date()
			// Финиш теста ВНО, очистка аккума, переход к следующему тесту
			if (typeof demo.acc.order == 'number' && demo.acc.order >= fans.length) {
				delete demo.acc?.order
				delete demo.acc?.time
				demo.order++
				demo.timeT = new Date()
			}
			return
		}
		// Время не прошло - Включаем ВНО + проверка работы
		ctrlADO(el, bld._id, 'on', 100)
		check(el, bld, obj, demo)
	})

	// console.log('test fan', demo.acc)
}

// Проверка вкл/выкл ВНО
function check(el, bld, obj, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.acc.time, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	const v = obj?.value?.[el._id]
	demo.checklist.fan[el._id] ??= {}
	// Выбит автомат qf: true - автомат выбит, false - ок, null - неисправен модуль
	if (v.qf && !demo.checklist.fan[el._id].qf) demo.checklist.fan[el._id].qf = 'автомат выбит'
	// Перегрев двигателя heat: true - перегрев, false - ок, null - неисправен модуль
	if (v.heat && !demo.checklist.fan[el._id].heat)
		demo.checklist.fan[el._id].heat = 'перегрев мотора'
	// Дребезг контактора
	if (isExtralrm(bld._id, el._id, 'debdo') && !demo.checklist.fan[el._id].debdo)
		demo.checklist.fan[el._id].debdo = 'частое включение'
	// Модуль или Конфигурация
	if (v.state == 'stop' && !demo.checklist.fan[el._id].stop)
		demo.checklist.fan[el._id].stop = 'ошибка модуля или конфигурации'
	// Превышен ток двигателя
	if (
		v.state == 'run' &&
		v.vai > (+el?.actuator?.current ?? 30) &&
		!demo.checklist.fan[el._id].vai
	)
		demo.checklist.fan[el._id].vai = 'превышен ток двигателя'
}

module.exports = fan
