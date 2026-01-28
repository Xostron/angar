const { data: store } = require('@store')
/**
 * 
 * @param {*} bld Склад
 * @param {*} retain Сохраненки
 * @returns {object[]} cooling: ['cooling', 'Охлаждение'],
						cure: ['cure', 'Лечение'],
						cooling2: ['cooling2', 'Доп. охлаждение'],
 */
function getSubmode(bld, retain) {
	// Авторежим подрежимы хранения
	const am = retain?.[bld._id]?.automode
	// Тип склада
	switch (bld?.type) {
		case 'cold':
		case 'normal':
			return store.acc?.[bld._id]?.[am]?.submode ?? ''
		case 'combi':
			return store.acc?.[bld._id]?.combi?.submode ?? ''
		default:
			return ''
	}
}

module.exports = getSubmode
