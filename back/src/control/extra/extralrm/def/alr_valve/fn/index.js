const { compareTime } = require('@tool/command/time')
const { msgV } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')

/**
 * 1.Когда клапан достиг 100% и дальше открывает до концевика,
 * ожидаем x% от шага, если за это время
 * концевик открыто так и не наступит, то авария (Останов всего склада).
 * 2. Когда клапан достиг 0% и дальше закрывает до концевика,
 * ожидаем x% от общего калибровочного времени.
 * 3. Аварию останавливающую весь склад можно запретить в настройках (
 * Авария догого открытия и долгого закрытия
 * ). Также данная авария возникает у тех клапанов чьи секции в авторежиме
 * 4. Если секция в ручном или выкл режиме, авария у клапана возникнет,
 * но весь склад не остановит, просто будет блокировать конкретный клапан
 *
 * @param {*} bld
 * @param {*} sect
 * @param {*} val
 * @param {*} v
 * @param {*} hyst
 * @param {*} hystPos
 * @param {*} typeV
 * @param {*} curTime
 * @param {*} acc
 */
function long(bld, obj, v, s, acc, prepare, type = 'open') {
	// Аккумулятор клапана
	acc[v._id] ??= {}
	// Состояние и текущее положение клапана
	const { state, val } = obj?.value?.[v._id]
	// Время полного открытия
	const { total, wait } = def.wait[type](bld, v, obj, s, type)
	// Клапан уже в аварии
	if (def.isExistLong[type](v._id, acc)) {
		def.message(bld, v, obj, s, acc, prepare, type, (withAlarm = false))
		return
	}
	// Сброс аккумулятора отслеживания аварии:
	// 1. Состояние клапана не открывается/не закрывается
	// 2. Нет расчетов
	if (!['icls', 'iopn'].includes(state) || isNaN(total)) {
		acc[v._id] = {}
		return
	}

	// Точка отсчета долгой работы
	def.detect[type](v._id, val, state, acc)

	// Ожидание долгой работы
	const time = compareTime(type === 'open' ? acc[v._id]?.waitO : acc[v._id]?.waitC, wait)
	console.log('ждем ', type, val, '%=', s.overVlv.long ?? 10, wait)

	// Время не прошло (ждем концевика)
	if (!time) return console.log('Ждем', type, v._id, acc[v._id])

	// Время прошло (Концевик не сработал)
	console.log('авария ', type)
	def.set[type](v, acc)

	def.message(bld, v, obj, s, acc, prepare, type)
}

const def = {
	isExistLong: {
		open(idV, acc) {
			return acc?.[idV]?.alarmOpn
		},
		close(idV, acc) {
			return acc?.[idV]?.alarmCls
		},
	},
	// Расчет времени ожидания аварии
	wait: {
		open(bld, v, obj, s) {
			// Время шага открытия
			const total = s.sys.step * 1000 * s.sys.cf.kIn
			// х% от шага клапана
			const wait = total * ((s?.overVlv?.long ?? 10) / 100)
			return { total, wait }
		},
		close(bld, v, obj, s) {
			// Время калибровки
			const total = obj?.retain?.[bld._id]?.valve?.[v._id]
				? +obj?.retain?.[bld._id]?.valve?.[v._id]
				: undefined
			// Калибровочное время + х%
			wait = total + total * ((s?.overVlv?.long ?? 10) / 100)
			return { total, wait }
		},
	},
	// Точка отсчета долгого открытия
	detect: {
		open(idV, val, state, acc) {
			if (state === 'iopn' && val >= 100 && !acc[idV].waitO) acc[idV].waitO = new Date()
			console.log('Точка отсчета open', acc[idV].waitO)
		},
		close(idV, val, state, acc) {
			if (state === 'icls' && val <= 0 && !acc[idV].waitC) acc[idV].waitC = new Date()
			console.log('Точка отсчета close', acc[idV].waitC)
		},
	},
	// Установка флага аварии клапана
	set: {
		open(v, acc) {
			acc[v._id].alarmOpn = true
		},
		close(v, acc) {
			acc[v._id].alarmCls = true
		},
	},
	// Генерация аварии для останова склада (Настройка: Авария разрешена)
	alarm: {
		open(s, acc) {
			// Долгое открытие не блокирует весь склад
			// if (!s?.overVlv?.onlo) return
			// acc._alarm = true
			// acc.flag = true
		},
		close(s, acc) {
			if (!s?.overVlv?.onlc) return
			// Долгое закрытие блокирует весь склад, если авария в настройках разрешена
			acc._alarm = true
			acc.flag = true
		},
	},
	// Генерация сообщения об аварии
	message(bld, v, obj, s, acc, prepare, type, withAlarm = true) {
		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
		v.sectionId.forEach((idS) => {
			const section = obj.data.section.find((el) => el._id === idS)
			// При аварии клапана всегда генерируется ошибка
			wrExtralrm(
				bld._id,
				idS,
				'alrValve',
				msgV(bld, section, typeV, type === 'open' ? 30 : 31)
			)
			// Выполнить функцию с проверкой Авария разрешена (withAlarm = true)
			if (!withAlarm) return
			// Фильтрация: только для клапанов секций в авто
			if (!prepare.onIdsS.includes(idS)) return
			// Настройка: Авария разрешена для останова склада
			this.alarm[type](s, acc)
		})
	},
}

function fnClear(bld, acc, prepare) {
	// Очистка аккумулятора
	for (const key in acc) delete acc[key]
	// Очистка авар. сообщений
	prepare.vlv.forEach((v) => {
		v.sectionId.forEach((idS) => {
			delExtralrm(bld._id, idS, 'alrValve')
		})
	})
}

module.exports = { long, fnClear }
