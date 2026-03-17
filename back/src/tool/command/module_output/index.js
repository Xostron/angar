const { setCmd, setCmdT } = require('@tool/command/set')
const { data: store } = require('@store')
const _MAX_SP = 100
const _MIN_SP = 20
const _HYST_VLV = 1

// Записть в аналоговый выход
function ctrlAO(o, bldId, value) {
	if (typeof value != 'number' || Number.isNaN(value)) return
	// console.log(999, o.name, `Аналоговый выходв ${value} %`)
	const mdlId = o?.ao?.id
	const ch = o?.ao?.channel - 1
	const r = { [bldId]: { [mdlId]: { [ch]: value || _MIN_SP } } }
	setCmd(r)
}

/**
 * Команда управления периферией (вкл/выкл)
 * @param {*} obj Вентилятор и т.д.
 * @param {*} buildingId Ссылка на склад
 * @param {*} type Тип команды включить/выключить (on, off)
 * @returns
 */
function ctrlDO(obj, buildingId, type) {
	if (!type) return null
	const bldId = obj?._build ?? buildingId
	const mdlId = obj?.module?.id
	const ch = obj?.module?.channel - 1
	const r = {}
	if (type === 'on') {
		r[bldId] = { [mdlId]: { [ch]: 1 } }
	}
	if (type === 'off') {
		r[bldId] = { [mdlId]: { [ch]: 0 } }
	}
	setCmd(r)
}

/**
 * Управление клапаном открыть/закрыть/стоп
 * @param {*} vlv Клапан
 * @param {*} type Тип команды (open,close,stop)
 * @returns
 */
function ctrlV(vlv, buildingId, type) {
	if (!type) return null
	const bldId = vlv?._build ?? buildingId
	const mdlOn = vlv?.module?.on?.id
	const mdlOff = vlv?.module?.off?.id
	const chOn = vlv?.module?.on?.channel - 1
	const chOff = vlv?.module?.off?.channel - 1
	// Защита от клапанов без привязки модулей в админпанели
	if (!mdlOn || !mdlOff || isNaN(chOn) || isNaN(chOff)) return null

	const r = {}
	// stop
	r[bldId] = { [mdlOn]: { [chOn]: 0 } }
	r[bldId] = { ...r[bldId], [mdlOff]: { ...r[bldId][mdlOff], [chOff]: 0 } }

	if (type === 'open') {
		r[bldId][mdlOn][chOn] = 1
		r[bldId][mdlOff][chOff] = 0
	}
	if (type === 'close') {
		r[bldId][mdlOn][chOn] = 0
		r[bldId][mdlOff][chOff] = 1
	}
	if (r) setCmd(r)
}

/**
 * Массовое вкл/выкл выходов
 * @param {object[]} arr Массив механизмов
 * @param {string} idB ИД склада
 * @param {string} type Тип команды: 'on'|'off'
 */
function arrCtrlDO(idB, arr, type) {
	arr?.forEach((el) => {
		ctrlDO(el, idB, type)
		if (el?.ao) ctrlAO(el, idB, type === 'off' ? _MIN_SP : _MAX_SP)
	})
}

function ctrlVsp(vlv, idB, sp) {
	const moduleOpn = vlv.module.on.id
	const moduleCls = vlv.module.off.id
	const chOpn = +vlv.module.on.channel - 1
	const chCls = +vlv.module.off.channel - 1
	// Текущая позиция клапана
	const curpos = +store.value.retain[idB].valvePosition[vlv._id]
	// Калибровочное время клапана
	const maxpos = +store.value.retain[idB].valve[vlv._id]
	// Уставка % -> время открытия
	const spp = (+sp * maxpos) / 100
	// Гистерезис 1%
	const hyst = (_HYST_VLV * maxpos) / 100

	if (
		(spp < curpos + hyst && spp > curpos - hyst) ||
		sp === null ||
		sp === undefined ||
		isNaN(spp)
	)
		return

	const s = {}
	const t = {}
	s[idB] ??= {}
	s[idB][moduleOpn] ??= {}
	s[idB][moduleCls] ??= {}
	t[idB] ??= {}
	t[idB][moduleOpn] ??= {}
	t[idB][moduleCls] ??= {}
	// Открыть клапан
	if (spp > curpos) {
		s[idB][moduleCls][chCls] = 0
		// уставка
		t[idB][moduleOpn][chOpn] = {
			value: 1,
			time: spp,
			type: 'on',
			_id: vlv._id,
		}
	}

	// Закрыть клапан
	if (spp < curpos) {
		s[idB][moduleOpn][chOpn] = 0
		// уставка
		t[idB][moduleCls][chCls] = {
			value: 1,
			time: spp,
			type: 'off',
			_id: vlv._id,
		}
	}
	// Задание
	setCmdT(t)
	// Команда управления
	setCmd(s)
}

module.exports = { ctrlAO, ctrlDO, ctrlV, arrCtrlDO, ctrlVsp }
