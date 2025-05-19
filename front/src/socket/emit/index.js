import { socket } from '@socket/index'
// Сообщения клиент -> сервер

// Запрос оборудования
function sEquip(callback) {
	socket.emit('s_equip', {}, callback)
}

// Данные на сервер: команды управления
function sOutput(data, callback) {
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
	socket.emit('s_mode', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: автоматический режим работы склада
function sAutomode(data, callback) {
	socket.emit('s_auto_mode', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: вкл/выкл складов
function sStart(data, callback) {
	socket.emit('s_start', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: калибровка клапанов
function sTune(data, callback) {
	socket.emit('s_tune', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: настройки датчиков
function sSens(data, callback) {
	socket.emit('s_sens', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: вывести из работы вентилятор
function sFan(data, callback) {
	socket.emit('s_fan', data, (res) => {
		console.log(res)
	})
}
// Данные на сервер: настройки авто (сушка, охлаждение, лечение)
function sSettingAu(data, callback) {
	socket.emit('s_setting_au', data, (res) => {
		console.log(res)
	})
}
// Кнопка сброс аварии
function sReset(data, callback) {
	socket.emit('s_reset', data, (res) => {
		console.log(res)
	})
}
// Кнопка Пуск/Стоп прогрева секции
function sWarming(data, callback) {
	socket.emit('s_warming', data, (res) => {
		console.log(res)
	})
}
// Изменить продукт
function sProduct(data,callback){
	socket.emit('s_product', data, (res) => {
		console.log(res)
	})
}
// Обнулить счетчик сушки
function sZero(data,callback){
	socket.emit('s_zero', data, (res) => {
		console.log(res)
	})
}
export { sEquip, sOutput, sStart, sMode, sTune, sSens, sFan, sOutputT, sSettingAu, sAutomode, sReset, sWarming, sProduct, sZero }
