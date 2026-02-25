const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { data: store } = require('@store')
const { out, ao, outV, fn } = require('./index')

// Блокировки разгонных вентиляторов (обычный склад и холодильник)
function fanAccel(obj, s) {
	const { value, data, retain, output } = obj
	for (const el of data.fan) {
		if (el.type !== 'accel') continue
		if (el.owner.type === 'cooler') continue
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// Блокировки
		// местный режим
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Игнор блокировки: включено окуривание или озонатор
		const ignore = s[idB]?.smoking?.on || s[idB]?.ozon?.on
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') //&& !store.aCmd?.[el.owner.id]?.fan?.end
		// Таймер запрета
		const ban = store.alarm.timer?.[idB]?.accel && !ignore
		// Состояние вентилятора: авария / выведен из работы
		const isAlrState = value?.[el._id]?.state === 'alarm' ? true : false
		// Авария питания
		const battery = isExtralrm(idB, null, 'battery')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, !!ban, alrStop, isAlrState, battery, bldOff)
	}
}

// Блокировки всех обогревов и оттаек
function heating(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.heating) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, bldOff)
	}
}

// Блокировка устройств (СО2, увлажнитель, озонатор)
function device(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.device) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// const localB = isExtralrm(idB, null, 'local')
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, bldOff)
	}
}

// Соленоиды подогрева
function fnSolHeat(obj) {
	const { value, data, retain, output } = obj
	const arr = data.heating.filter((el) => el.type === 'channel')
	// По соленоидам подогрева -> owner испаритель -> owner секция
	for (const el of arr) {
		const idS = data.cooler?.find(({ _id }) => _id === el.owner.id)?.sectionId
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		// const local = isExtralrm(idB, idS, 'local')
		// const localB = isExtralrm(idB, null, 'local')
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Состояние испарителя
		const stateC = value[el?.owner?.id]
		// Состояние агрегата испарителя
		const alrAgg = stateC.aggregate.state === 'alarm'
		// Состояние ВНО испарителя
		const alr_offVNO = stateC.fan.state === 'alarm'
		// Склад выключен
		const offB = retain?.[idB]?.start == false
		// Секция выключена
		let offS = (retain?.[idB]?.mode?.[idS] ?? null) === null
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, alrAgg, alr_offVNO, offB, offS, bldOff)
	}
}

module.exports = { fanAccel, heating, device, fnSolHeat }
