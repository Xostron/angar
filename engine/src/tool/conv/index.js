const def = require('./def');

// Дешифрование значений из справочника
function conv(code, val, i = 0, j) {
	// code - код справочника
	// val  - что декодировать
	// i    - позиция значения в справочнике
	// j    - с какой позиция брать значения в справочнике

	const el = def[code].find((el) => el.list[i] === val);
	if (!el) return val ?? null;
	j = j ?? (i ? 0 : 1);
	return el.list[j];
}

// Вернуть список отфильтрованных статусов
function map(data, flt, i = 0) {
	data = data.filter((el) => el.flt.includes(flt));
	data = data.map((el) => el.list[i]);
	return data;
}

module.exports = {
	conv,
	map,
};
