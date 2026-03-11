const { findAndModify } = require('@tool/db');
const { main } = require('./fn');

const def = {
	calculator: (r, year) => {
		return `${year}-${r.value}`;
	},
};

// Вернуть инкрементированное значение номера для документа
function inc(db, companyId, type, year = '') {
	return new Promise((resolve, reject) => {
		year = year ? +year : +new Date().getFullYear();
		const q = {
			type,
			year,
			companyId,
		};
		const doc = {
			$inc: { value: 1 },
			$set: { update: new Date(), year },
		};
		findAndModify(db, 'num', q, doc, true)
			.then((r) => {
				let result;
				result = def[type] ? def[type](r, year) : main(r, year);
				resolve(result);
			})
			.catch(reject);
	});
}
module.exports = inc;
