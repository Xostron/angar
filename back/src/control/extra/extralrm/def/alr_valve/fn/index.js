const { msgV } = require('@tool/message')
const { wrExtralrm } = require('@tool/message/extralrm')

// Авария долгое открытие/закрытие клапанов
function longOpn(building, section, val, v, hyst, hystPos, typeV, curTime, acc) {
	// Расчет: Время ожидания - после того как положение клапана стало 100% - hystPos,
	// а концевик открыто не сработал, через данное "время ожидания" будет отключен двигатель клапана
	if (val >= 100 - hystPos && !acc[v._id].wait) acc[v._id].wait = curTime + hyst

	// Время ожидания прошло - отключение двигателя
	if (acc[v._id].wait && curTime > acc[v._id].wait) {
		acc[v._id].finish = true
		delete acc[v._id].wait
		fnMsg(building, section, typeV, 30)
	}
}

function longCls(building, section, val, v, hyst, hystPos, typeV, curTime, acc) {
	// Расчет: Время ожидания
	if (val <= 0 + hystPos && !acc[v._id].wait) acc[v._id].wait = curTime + hyst

	// Время ожидания прошло
	if (acc[v._id].wait && curTime > acc[v._id].wait) {
		acc[v._id].finish = true
		delete acc[v._id].wait
		fnMsg(building, section, typeV, 31)
	}
}

function fnMsg(building, section, typeV, code) {
	wrExtralrm(building._id, section._id, 'alrValve', msgV(building, section, typeV, code))
}

module.exports = { longOpn, longCls }
