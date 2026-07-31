const { ctrlV } = require('@tool/command/module_output')
const { compareTime, deltaTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
// 10сек
const _delay = 10_000
// Допустимое расхождение между временем открытия и закрытия не более 10сек
const _timeLimit = 30_000
/**
 * Тест одновременное откр/закр клапанов
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} mech Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function valve(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет ВНО пропускаем данный тест
	if (!m.vlvAll) {
		demo.order++
		return
	}

	// Открыть клапаны
	m.vlvAll.forEach((el) => {
		fnPipeline(bld, obj, el, demo)
		ctrlV(el, bld._id, demo.accVlv[el._id].type)
		check(bld, obj, el, demo)
	})
	finish(m.vlvAll, demo)
	// console.log(22,demo)
}

// Проверка вкл/выкл клапан
function check(bld, obj, el, demo) {
	const acc = demo.accVlv?.[el._id]
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)

	// Время не прошло
	if (!t) return

	// Время прошло - мониторим состояние разгонника
	const v = obj?.value?.[el._id]
	demo.checklist.valve[el._id] ??= {}

	// Выбит автомат qf: true - автомат выбит, false - ок, null - неисправен модуль
	if (v.crash && !demo.checklist.valve[el._id].crash)
		demo.checklist.valve[el._id].crash = 'автомат выбит'

	// нет питания концевиков
	if (
		(isExtralrm(bld._id, el.sectionId, 'vlvLim') || isExtralrm(bld._id, null, 'vlvLim')) &&
		!demo.checklist.valve[el._id].vlvLim
	)
		demo.checklist.valve[el._id].vlvLim = 'нет питания концевиков'

	if (acc.end) {
		const timeOpen = deltaTime(acc.open, acc.close)
		const timeClose = deltaTime(acc.close, acc.end)
		const delta = Math.abs(timeOpen - timeClose)
		if (delta >= _timeLimit && !demo.checklist.valve[el._id].delta)
			demo.checklist.valve[el._id].delta =
				`разное время открытия или закрытия, расхождение ${delta / 1000}с`
	}
}

// Последовательность тестирования клапаном
function fnPipeline(bld, obj, el, demo) {
	demo.accVlv ??= {}
	demo.accVlv[el._id] ??= {}
	const acc = demo.accVlv[el._id]
	const v = obj?.value?.[el._id]
	// Шаг тестирования
	//
	if (v.close && !acc?.open) {
		acc.open = new Date()
		acc.type = 'open'
	}
	if (v.open && !acc?.close) {
		acc.close = new Date()
		acc.type = 'close'
	}
	if (v.close && acc?.open && acc?.close && !acc?.end) {
		acc.end = new Date()
		acc.type = 'stop'
	}
	// v = { open: false, close: true, crash: false, val: 0, state: 'cls' }
	// console.log(11, v, acc)
}

function finish(vlvs, demo) {
	const r = vlvs.every((el) => demo.accVlv?.[el._id]?.end)
	// Тест клапанов закончен, выходим
	if (r) {
		for (const key in demo.accVlv) {
			delete demo.accVlv?.[key]
		}
		demo.order++
		demo.timeT = new Date()
	}
}

module.exports = valve
