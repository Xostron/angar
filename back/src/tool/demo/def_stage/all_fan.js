const { arrCtrlDO } = require('@tool/command/module_output')
const { isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const { stasis } = require('../fn')
const { getOwnerName } = require('@tool/get/building')
// 10сек
const _delay = 10_000
const _min_volt = 365

/**
 * Тест одновременное вкл всех ВНО
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} m Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function allFan(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		// ВНО используются в нескольких тестах,
		// поэтому тут заглушка для того чтобы тесты с ВНО не влияли друг на друга
		// Активен - Тест одиночного включения ВНО
		if (code == 'fan') return
		// Активен - Тест испарителей, обычные ВНО отключаем, испарители не трогаем
		if (code == 'coolerCool') return arrCtrlDO(bld._id, m.fanBN, 'off')
		// Активен - другие тесты
		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет ВНО пропускаем данный тест
	if (!m.fanBexc?.length) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}
// console.log(11, m.fanBexc)
	// Включить все ВНО
	arrCtrlDO(bld._id, m.fanBexc, 'on')

	// Аккумулятор
	demo.accAllFan ??= {}
	const acc = demo.accAllFan
	// Фиксируем начальную температуру испарителя перед включением двигателей
	m.tcnlB.forEach((el) => {
		acc[el._id] ??= {}
		stasis(el._id, obj.value?.[el._id], acc)
	})

	// Проверка и запись неисправностей в журнал
	check(bld, obj, m.fanBexc, demo)
	fnVolt(bld, obj, checklistPNR, demo)
	fnTcnl(bld, obj, checklistPNR, demo, m.tcnlB)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, fans, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	fans.forEach((el) => {
		const v = obj?.value?.[el._id]
		demo.checklist.allFan.list[el._id] ??= {}
		demo.checklist.allFan.list[el._id].name = getOwnerName(el, obj.data, {
			flt: ['sect', 'cooler'],
		})
		// Выбит автомат qf: true - автомат выбит, false - ок, null - неисправен модуль
		if (v?.qf && !demo.checklist.allFan.list[el._id].qf)
			demo.checklist.allFan.list[el._id].qf = 'автомат выбит'
		// Перегрев двигателя heat: true - перегрев, false - ок, null - неисправен модуль
		if (v?.heat && !demo.checklist.allFan.list[el._id].heat)
			demo.checklist.allFan.list[el._id].heat = 'перегрев мотора'
		// Дребезг контактора
		if (isExtralrm(bld._id, el._id, 'debdo') && !demo.checklist.allFan.list[el._id].debdo)
			demo.checklist.allFan.list[el._id].debdo = 'частое включение'
		// Модуль или Конфигурация
		if (v.state == 'stop' && !demo.checklist.allFan.list[el._id].stop)
			demo.checklist.allFan.list[el._id].stop = 'ошибка модуля или конфигурации'
		// Превышен ток двигателя
		if (
			v.state == 'run' &&
			el?.actuator?.current &&
			v.vai > +el?.actuator?.current &&
			!demo.checklist.allFan.list[el._id].vai
		)
			demo.checklist.allFan.list[el._id].vai =
				`превышен ток двигателя ${v.vai}А > ${+el?.actuator?.current}А (по паспорту)`
	})
}

module.exports = allFan

function fnTcnl(bld, obj, checklistPNR, demo, tcnlB) {
	// Проверка температуры канала после включения ВНО на 70% пройденного теста
	const t = compareTime(demo.timeT, checklistPNR.last * 0.7)
	// Время не прошло
	if (!t) return
	tcnlB.forEach((el) => {
		const v = obj.value?.[el._id]
		const av = demo.accAllFan?.[el._id]
		const sect = obj.data.section.find((sec) => sec._id === el.owner.id)
		demo.checklist.allFan.list[el._id] ??= {}
		if (
			v.value >= av.value - 0.1 &&
			v.value <= av.value + 0.1 &&
			!demo.checklist.allFan.list[el._id]?.tcnl
		)
			demo.checklist.allFan.list[el._id].tcnl =
				`${sect?.name ?? ''} ${el.name} не меняется состояние датчика при работе вентиляторов `
	})
}

/**
 * Низкое напряжение сети
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} demo Аккумулятор демо (сохраняемый в retain)
 */
function fnVolt(bld, obj, checklistPNR, demo) {
	// Проверка напряжения сети после включения ВНО на 20% пройденного теста
	const t = compareTime(demo.timeT, checklistPNR?.[demo.order]?.last * 0.2)
	// Время не прошло
	if (!t) return
	// Список электросчетчиков
	const deviceVolt = obj.data.device.filter((el) => el.device.code == 'pui')
	// Имя владельца электросчетчика: склад/секция
	let ownerName = 'склада'

	// По устройствам электроизмерений
	deviceVolt.forEach((el) => {
		// Аккумулятор демо
		demo.checklist.allFan.list[el._id] ??= {}
		// Показания устройства
		const volt = obj.value?.[el._id]
		// В какой секции добавлено устройство
		const sect = obj.data.section.find((sec) => sec._id === el.sectionId)
		// Если электросчетчиков > 1 => то (по-хорошему) значит у каждой секции свой счетчик
		// и владельцами считаем секции, иначе владелец по-умолчанию склад
		if (deviceVolt.length > 1) ownerName = sect?.name ?? ''
		// По показаниям электросчетчика: Ua, Ub, Uc - напряжение каждой фазы
		for (const key in volt) {
			if (key == 'state') continue
			// Если напряжение меньше => логируем неисправность
			if (volt[key] < _min_volt && !demo.checklist.allFan.list[el._id][key])
				demo.checklist.allFan.list[el._id][key] =
					`низкое напряжение на входе ${ownerName}, фаза ${key} = ${volt[key]}В`
		}
		// console.log(el)
	})
}
