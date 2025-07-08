const { data: store, setToAuto, setToMan, setToOffSection } = require('@store')
const { ctrlV, ctrlDO } = require('@tool/command/module_output')
const { stateEq} = require('@tool/command/fan/fn')
const { stateV } = require('@tool/command/valve')

/**
 * При переходе в авто, выкл, останов склада:
 * Отключение вентиляторов секции, закрытие клапанов
 * @param {*} buildId
 * @param {*} sectionId
 * @param {*} data
 * @param {*} value
 * @param {*} type
 */
function controlAO(buildId, sectionId, data, value, type = 'to_auto') {
	const { fan, valve } = data
	const fanS = fan.filter((el) => el.owner.id === sectionId && el.type === 'fan')
	const vlvS = valve.filter((el) => el.sectionId.includes(sectionId))
	// Закрытие всех клапанов
	const v = clsValves(vlvS, value, buildId)
	// Отключение вентиляторов секции
	const f = offEq(fanS, value, buildId)
	// Подготовка выполнена, все клапаны закрыты (Авто)
	if (type === 'to_auto' && v && f) setToAuto({ _build: buildId, _section: sectionId, value: true })
	// Подготовка выполнена, все клапаны закрыты (Секция выключена)
	if (type === 'to_off' && v && f) setToOffSection({ _build: buildId, _section: sectionId, value: true })
}

//****************************************************************
/**
 * При переходе в ручной режим:
 * Вентиляторы секции продолжают работать, клапаны останавливаются
 * @param {*} buildId
 * @param {*} sectionId
 * @param {*} data
 * @param {*} value
 */
function controlM(buildId, sectionId, data, value) {
	const { fan, valve } = data
	const vlvS = valve.filter((v) => v.sectionId.includes(sectionId))
	// Останов клапанов
	const v = stopValves(vlvS, value, buildId)
	// Подготовка выполнена, все клапаны закрыты
	if (v) setToMan({ _build: buildId, _section: sectionId, value: true })
}

function stopValves(vlvS, value, buildingId) {
	let count = vlvS.length
	for (const vlv of vlvS) {
		const state = stateV(vlv._id, value, buildingId, vlv.sectionId[0])
		ctrlV(vlv, buildingId, 'stop')
		if (state !== 'iopn' && state !== 'icls') --count
	}
	return count > 0 ? false : true
}

//****************************************************************
/**
 * При выключении склада:
 * Выключить всю периферию секции, закрыть клапана
 * @param {*} buildId
 * @param {*} sectionId
 * @param {*} data файлы json - оборудование
 * @param {*} value Опрос модулей + анализ
 */
function controlB(buildId, sectionId, data, value) {
	const { fan, valve, heating } = data
	const fanS = fan.filter((f) => f.owner.id === sectionId)
	const vlvS = valve.filter((v) => v.sectionId.includes(sectionId))
	// const heatS = heating.filter((h) => h.sectionId === sectionId)
	// Закрытие всех клапанов
	const v = clsValves(vlvS, value, buildId)
	// Отключение вентиляторов секции
	const f = offEq(fanS, value, buildId)
	// Отключение обогревателей клапанов
	// const h = offEq(heatS, value, buildId)
	return v && f
}

// Закрыть группу клапанов
function clsValves(vlvS, value, buildingId) {
	let count = vlvS.length
	for (const vlv of vlvS) {
		const state = stateV(vlv._id, value, buildingId, vlv.sectionId[0])
		if (state === 'icls') continue
		if (state !== 'cls') {
			ctrlV(vlv, buildingId, 'close')
			continue
		}
		ctrlV(vlv, buildingId, 'stop')
		--count
	}
	// Все клапаны закрыты - true
	return count > 0 ? false : true
}

// Выключить группу вентиляторов или других устройств
function offEq(eqS, value, buildId) {
	let count = eqS.length
	for (const o of eqS) {
		const running = stateEq(o._id, value)
		if (running) ctrlDO(o, buildId, 'off')
		else --count
	}
	// Группа выключена - true
	return count > 0 ? false : true
}

module.exports = { controlAO, controlM, controlB, offEq }
