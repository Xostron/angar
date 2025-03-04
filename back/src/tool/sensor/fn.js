const tSens = require('@dict/sensor')
const { msgBS } = require('@tool/message')
const { data: store, wrExtralrm, delExtralrm } = require('@store')
const { getListSens } = require('@tool/get/sensor')
const { getB } = require('@tool/get/building')

// Правила обработки датчиков для разных аналоговых модулей
function getRaw(sens, v) {
	// const { module, equipment } = equip
	// Датчик не объявлен в админке
	if (!sens.module.id || typeof sens.module.channel !== 'number') return null
	// Тип модуля
	// const idEq = module.find((el) => el._id == sens.module.id)?.equipmentId
	// const int10 = equipment?.[idEq]?.re?.type == 'int10'

	// // Для модулей с типом int10
	// if (int10) return +v?.toFixed(sens?.accuracy || 1) ?? null
	// // Для модулей с типом float
	return +v?.toFixed(sens?.accuracy || 1) ?? null
	// return v ? +v.toFixed(sens?.accuracy || 1) : null
}

// Автообнаружжение неисправностей датчиков температуры продукта (посекционно)
function fnDetection(equip, result, retain) {
	const { section, sensor, building } = equip
	// В секции отбираем датчики температуры продукта
	for (const s of section) {
		// Владелец склад
		const buildingId = s.buildingId
		const b = getB(building, buildingId)
		// Настройка Разрешить автообнаружение неисправностей
		if (!retain?.[buildingId]?.setting?.sys?.detection) continue

		// Датчики температуры продукта
		const aTprd = getListSens(s._id, sensor, result, 'tprd')
		if (aTprd.length < 2) continue

		// анализ на неисправности (ref - здоровые датчики, err - неисправные)
		const { ref, err } = detection(aTprd)

		// Неисправные - взводим аварию
		err.forEach((el) => {
			if (!store.alarm?.extralrm?.[buildingId]?.[s._id]?.[el?._id]) {
				wrExtralrm(buildingId, s._id, el._id, msgBS(b, s, el, 99))
			}
			// Перезапись датчика как не валидного
			result[el._id] ??= {}
			result[el._id].value = null
		})
		// Здоровые датчики - удаление аварии
		ref.forEach((el) => {
			delExtralrm(buildingId, s?._id, el._id)
		})
	}
}

// Обнаружение неисправных датчиков (ref - здоровые, err - неисправные)
function detection(aTprd) {
	// Отклонение от ср.арифм
	const delta = 4
	// все датчики (мутируют в здоровые)
	const ref = [...aTprd]
	// Неисправные датчики
	const err = []
	//  Определение неисправных датчиков
	// Цикл, пока не останется 2 датчика в ref
	for (let i = 0; i < ref.length; i++) {
		// среднее арифметическое
		const average =
			ref.reduce((acc, el) => {
				return (acc += el.value)
			}, 0) / ref.length
		// Поиск максимального отклонения
		ref.forEach((el) => {
			el.deviation = Math.abs(el.value - average)
		})
		ref.sort((a, b) => a.deviation - b.deviation)
		// Удаление из здоровых датчиков в неисправные
		if (ref[ref.length - 1].deviation > delta) err.push(ref.pop())
	}
	return { ref, err }
}

// Состояние датчика: выключен-off или авария-alarm
function state(raw, on) {
	// Выведен из работы
	if (on === false) return 'off'
	// Неисправность датчика
	if (raw === null) return 'alarm'
	return 'on'
}

// Проверка диапазонов датчика
function range(r, sens) {
	switch (true) {
		// Температура
		case tSens.temp.includes(sens.type):
			if (r.value > 99) r.value = 99.0
			if (r.value < -99) r.value = -99.0
			break
		// Датчик влажности продукта (при выводе из работы = 80%)
		case sens.type === 'hin':
			if (r.value > 99.8) r.value = 99.8
			if (r.value < 0) r.value = 0.0
			if (r.state === 'off') r.value = 80.0
			break
		// Влажность улицы
		case tSens.mois.includes(sens.type):
			if (r.value > 99.8) r.value = 99.8
			if (r.value < 0) r.value = 0.0
			break
		// Давление
		case tSens.pres.includes(sens.type):
			if (r.value > 2000) r.value = 2000.0
			if (r.value < -2000) r.value = -2000.0
			break
		default:
			break
	}
}

// Аварийные сообщения о неисправности датчика
function webAlarm(r, bld, sect, sens) {
	// Если не валидный, то добавляем в аварию (для отображения на странице Сигналы)
	if (r.state === 'alarm' && !store.alarm?.extralrm?.[bld?._id]?.[sect?._id ?? 'sensor']?.[sens?._id]) {
		sect?.name
			? wrExtralrm(bld._id, sect?._id, sens._id, msgBS(bld, sect, sens, 100))
			: wrExtralrm(bld._id, 'sensor', sens._id, msgBS(bld, 'sensor', sens, 100))
	}
	// Если валидный - удаляем аварию
	if (r.state !== 'alarm') delExtralrm(bld._id, sect?._id ?? 'sensor', sens._id)
}

/**
 * Сообщение об общей аварии по датчику для складов
 * @param {object[]} building склады
 * @param {object} val значение датчика state, min,max
 * @param {string} type Тип датчика tout, hout, tin
 * @param {string} bType Тип склада normal, cold, combi
 */
function fnMsgs(building, val, type, bType) {
	const bld = building.filter((el) => (el.type ?? 'normal') === bType)
	// Датчик ОК - удаление сообщений
	if (val.state === 'on') {
		bld.forEach((b) => {
			delExtralrm(b._id, 'sensor', type + 'alarm')
			delExtralrm(b._id, 'sensor', type + 'off')
		})
		return
	}
	// Датчик выключен или в аварии - создание сообщения
	bld.forEach((b) => {
		val.state === 'off' ? delExtralrm(b._id, 'sensor', type + 'alarm') : delExtralrm(b._id, 'sensor', type + 'off')
		wrExtralrm(b._id, 'sensor', type + val.state, msgBS(b, 'sensor', null, code[type][val.state]))
	})
}

function fnMsg(bld, val, type, bType) {
	if (bld.type === bType) {
		// Датчик ОК - удаление сообщений
		if (val.state === 'on') {
			delExtralrm(bld._id, 'sensor', type + 'alarm')
			delExtralrm(bld._id, 'sensor', type + 'off')
			return
		}
		// Датчик выключен или в аварии - создание сообщения
		wrExtralrm(bld._id, 'sensor', type + val.state, msgBS(bld, 'sensor', null, code[type][val.state]))
	}
}

module.exports = { getRaw, fnDetection, detection, state, range,webAlarm, fnMsgs, fnMsg }

// Коды сообщений
const code = {
	tout: { off: 97, alarm: 98 },
	hout: { off: 95, alarm: 96 },
	tin: { off: 93, alarm: 94 },
}