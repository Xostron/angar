const { isAlr } = require('@tool/message/auto')

/**
 * Если склад холодильник И режим хранения
 * И наличие аварий авторежима (означает что склад переходит в режим холода)
 * И настройка "Испаритель холодильного оборудования" - вкл => true
 * @param {*} bld
 * @param {*} am
 * @param {*} s
 * @returns {boolean} true - Комби склад в режиме холодильника,
 * 					false - Комби склад в режиме обычного
 */
function isCombiCold(bld, am, s) {
	if (!bld._id || !am || !s) return false
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, am)
	// Настройка "Испаритель холодильного оборудования" = true/false
	const on = s?.coolerCombi?.on === true
	if (bld.type === 'combi' && alrAuto && on && am === 'cooling') return true
	return false
}

module.exports = isCombiCold
