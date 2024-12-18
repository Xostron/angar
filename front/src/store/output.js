import { create } from 'zustand'
import { sOutput, sStart, sMode, sTune, sSens, sFan, sOutputT, sSettingAu, sAutomode, sWarming } from '@socket/emit'

// Данные на сервер
const useOutputStore = create((set, get) => ({
	// Команды управления выходами
	output: {},
	// Команды управления: по времени отключения
	outputT: {},
	// Команда на калибровку
	tune: {},
	// Режим работы секции
	mode: {},
	// Автоматический режим склада (сушка, охлаждение и т.д.)
	automode: {},
	// Вкл/выкл склада
	start: {},
	// Настройки датчиков склада
	sens: {},
	// Настройки вентилятора: Вывести из работы
	fan: {},
	// Настройки Авто
	settingAu: {},
	// Прогрев секции
	warming: {},
	// Выбранный продукт
	prd: '',
	setPrd(prd) {
		set({ prd })
	},
	// Установить: команды управления (пуск-стоп)
	setO(out1, out2) {
		const output = {}
		output[out1.idB] = {
			...output[out1.idB],
			[out1.idM]: { ...output?.[out1.idB]?.[out1.idM], [out1.channel]: out1.value },
		}
		if (out2)
			output[out2.idB] = {
				...output[out2.idB],
				[out2.idM]: { ...output?.[out2.idB]?.[out2.idM], [out2.channel]: out2.value },
			}
		set({ output })
		console.log('@@@ setO', output)
		// отправить на сервер
		sOutput(output)
	},
	// Команды управления: с таймером
	setT(out1) {
		const outputT = {}
		outputT[out1.idB] = {
			...outputT[out1.idB],
			[out1.idM]: {
				...outputT?.[out1.idB]?.[out1.idM],
				[out1.channel]: { value: out1.value, time: out1.time ?? null, _id: out1._id, type: out1.type },
			},
		}
		set({ outputT })
		console.log('@@@ setT', outputT)
		// отправить на сервер
		sOutputT(outputT)
	},
	// Установить: режим работы секции
	setMode(obj) {
		const mode = {}
		mode[obj.buildId] = { [obj._id]: obj.val }
		set({ mode })
		// отправить на сервер
		sMode(mode)
	},
	// Установить: автоматический режим склада
	setAutomode(obj) {
		const automode = obj
		set({ automode })
		// отправить на сервер
		sAutomode(automode)
	},
	// Установить: вкл/выкл склада
	setStart(obj) {
		const start = obj
		set({ start })
		// отправить на сервер
		sStart(start)
	},
	// Отправить на сервер: вывести из работы вентилятор
	setFan(obj) {
		const fan = obj
		set({ fan })
		// Отправить на сервер
		sFan(fan)
	},
	// Установить: калибровка клапанов
	setTune(vlv) {
		const tune = get().tune
		tune[vlv._id] = { ...vlv }
		set({ tune })
		console.log('111', vlv)
	},
	//Отправить на сервер: Команды на калибровку
	sendTune() {
		// отправить на сервер
		const tune = get().tune
		sTune(tune)
		console.log('333', tune)
	},
	// Установить: настройки датчиков
	setSens(obj) {
		if (!obj) {
			set({ sens: {} })
			return
		}
		const sens = get().sens
		let key
		if (obj?.on !== undefined) key = 'on'
		if (obj?.corr !== undefined) key = 'corr'
		sens[obj.build] = { ...sens[obj.build], [obj._id]: { ...sens?.[obj.build]?.[obj._id], [key]: obj[key] } }
		set({ sens })
	},
	// Отправить на сервер: настройки датчиков
	sendSens() {
		// Отправить на сервер
		const sens = get().sens
		sSens(sens)
		// очистить стейт
		set({ sens: {} })
	},
	// Есть ли изменения в настройках датчиков
	hasChangedSens(build) {
		return get().sens?.[build] ? true : false
	},
	// Настройки
	setSettingAu(obj) {
		if (!obj) {
			set({ settingAu: {} })
			return
		}
		const settingAu = get().settingAu

		settingAu.buildingId = obj?.build ?? null
		settingAu.code = obj?.type ?? null
		if (!['antibliz', 'heating', 'overVlv', 'accel', 'idle', 'co2', 'ozon', 'heater', 'smoking'].includes(obj?.type))
			settingAu.prdCode = get().prd?.code ?? null
		settingAu.value ??= {}
		const name = obj.name.split('.')
		if (name.length === 1) {
			settingAu.value[obj.name] = obj.value
		} else {
			settingAu.value[name[0]] ??= {}
			settingAu.value[name[0]][name[1]] = obj.value
		}
		console.log(111, settingAu)
		set({ settingAu })
	},
	sendSettingAu() {
		// Отправить на сервер
		const settingAu = get().settingAu
		console.log(999, settingAu)
		sSettingAu(settingAu)
		// очистить стейт
		set({ settingAu: {} })
	},
	hasChangedSettingAu(build, type) {
		if (type === 'menu') return false
		return get().settingAu?.value ? true : false
	},
	// Прогрев секции - установить задание
	setWarming(obj) {
		const { buildingId, sectionId, cmd } = obj
		const warming = get().warming
		warming[buildingId] ??= {}
		warming[buildingId][sectionId] = cmd ?? false
		set({ warming })
		sWarming(obj)
	},
	// Удалить задание
	delWarming(obj) {
		const { buildingId, sectionId } = obj
		const warming = get().warming
		delete warming?.[buildingId]?.[sectionId]
		set({ warming })
	},
}))

export default useOutputStore
