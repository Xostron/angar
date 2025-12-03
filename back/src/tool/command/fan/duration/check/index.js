const dict = {
	1: 'вентиляторы неисправны',
	2: 'режим вентиляции - Выкл',
	3: 'режим вентиляции - Выкл',
	4: 'авария низкой температуры',
	5: 'переключатель на щите',
	6: 'работает удаление СО2',
	7: 'не выбран авторежим и(или) продукт, нет настроек, тип склада',
	8: 'склад выключен',
	9: 'секция не в авто',
	10: 'настройки "Холодильник С" (Работа ВВ = 0)',
	11: 'комби-холодильник (задание продукта еще не достигнуто)',
	12: 'настройка "Вентиляция" (Работа ВВ = 0)',
}
/**
 * 
 * @param {*} prepare 
 * @return {boolean} true разрешение на работу 
 */
function check(prepare) {
	const { acc, cmd, isCN, isN, alrAuto, notDur, achieve, idsS, s } = prepare
	// if ()
}

function clear(prepare) {
const { acc, cmd, isCN, isN, alrAuto, notDur, achieve, idsS, s } = prepare
}

module.exports = { check, clear }

