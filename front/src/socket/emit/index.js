import { socket } from '@socket/index'
import useAuthStore from '@store/auth'
// Сообщения клиент -> сервер

// Запрос аналитики по прогнозу погоды
function sForecast(data, set) {
	fnName(data)
	socket.emit('s_forecast', data, (res) => {
		// Ответ по аналитике
		set(res)
		console.log('s_forecast', res)
	})
}
// Данные на сервер: команды управления
function sOutput(data, callback) {
	fnName(data)
	socket.emit('s_output', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: команды управления с таймером
function sOutputT(data, callback) {
	socket.emit('s_output_t', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: режимы работ секций
function sMode(data, callback) {
	fnName(data)
	socket.emit('s_mode', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: автоматический режим работы склада
function sAutomode(data, callback) {
	fnName(data)
	socket.emit('s_auto_mode', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: вкл/выкл складов
function sStart(data, callback) {
	fnName(data)
	socket.emit('s_start', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: калибровка клапанов
function sTune(data, callback) {
	for (const key in data) fnName(data[key])
	socket.emit('s_tune', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: настройки датчиков
function sSens(data, callback) {
	fnName(data)
	socket.emit('s_sens', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: вывести из работы вентилятор
function sFan(data, callback) {
	fnName(data)
	socket.emit('s_fan', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: настройки авто (сушка, охлаждение, лечение)
function sSettingAu(data, callback) {
	fnName(data)
	socket.emit('s_setting_au', data, (res) => {
		console.log(res)
	})
}
// Кнопка сброс аварии
function sReset(data, callback) {
	fnName(data)
	socket.emit('s_reset', data, (res) => {
		console.log(res)
	})
}
// Кнопка Пуск/Стоп прогрева секции
function sWarming(data, callback) {
	fnName(data)
	socket.emit('s_warming', data, (res) => {
		console.log(res)
	})
}
// Изменить продукт
function sProduct(data, callback) {
	fnName(data)
	socket.emit('s_product', data, (res) => {
		console.log(res)
	})
}
// Обнулить счетчик сушки
function sZero(data, callback) {
	fnName(data)
	socket.emit('s_zero', data, (res) => {
		console.log(res)
	})
}

// Запрос рамы на сервер
// function sEquip(data, callback) {
// 	socket.emit('s_equip', data, (res) => {
// 		console.log(111, res)
// 	})
// }
export {
	/*sEquip,*/ sForecast,
	sOutput,
	sStart,
	sMode,
	sTune,
	sSens,
	sFan,
	sOutputT,
	sSettingAu,
	sAutomode,
	sReset,
	sWarming,
	sProduct,
	sZero,
}

function fnName(data) {
	const name = useAuthStore.getState().name
	data.name = name
}
