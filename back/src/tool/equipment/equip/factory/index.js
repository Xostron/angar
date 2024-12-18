function factory(data) {
	const obj = {};

	for (const [key, doc] of Object.entries(data)) {
		obj[key] = {
			_name: doc._name,
			_order: doc._order,
			_prd: doc._prd,
		};
		// Если есть продукты
		if (doc._prd) {
			// по коду продуктов
			for (const [prdKey, prdValue] of Object.entries(doc)) {
				if (prdKey.startsWith('_')) continue; // Пропускаем служебные ключи
				obj[key][prdKey] = [];
				mark(obj[key][prdKey], prdValue);
				// Сортировка по _order
				obj[key][prdKey].sort((a, b) => a._order - b._order);
			}
		} else {
			// Если продуктов нет, создаем пустой список
			obj[key].list = [];
			mark(obj[key].list, doc);
			// Сортировка по _order
			obj[key].list.sort((a, b) => a._order - b._order);
		}
	}
	return obj;
}

function mark(arr, data) {
	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('_')) continue; // Пропускаем служебные ключи
		const obj = {
			_code: key,
			_name: value._name,
			_order: value._order,
			_icon: value._icon,
			_type: value?._type,
			list: [],
		};
		// Обработка вложенных объектов markList
		for (const [mlKey, mlValue] of Object.entries(value)) {
			if (mlKey.startsWith('_')) continue; // Пропускаем служебные ключи
			obj.list.push({ ...mlValue, _code: mlKey });
		}
		// Сортировка по _order
		obj.list.sort((a, b) => a._order - b._order);
		arr.push(obj);
	}
}
module.exports = factory;
