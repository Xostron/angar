/**
 * Выборки документов из коллекции
 * @param {Object} db БД
 * @param {String} code Код колекции
 * @param {Object} q Параметры Фильтрация
 * @returns
 */
function find(db, code, q, sort, projection = {}) {
	return new Promise((resolve, reject) => {
		if (sort)
			return db[code]
				.find(q, projection)
				.sort(sort, (err, docs) => (err ? reject(err) : resolve(docs)));

		db[code].find(q, (err, docs) => (err ? reject(err) : resolve(docs)));
	});
}

/**
 * Кол-во документов из коллекции
 * @param {Object} db БД
 * @param {String} code Код колекции
 * @param {Object} q Параметры Фильтрация
 * @returns
 */
function count(db, code, q) {
	return new Promise((resolve, reject) => {
		db[code].count(q, (err, val) => (err ? reject(err) : resolve(val)));
	});
}

/**
 * Поиск одиночного документа
 * @param {Object} db БД
 * @param {String} name Коллекция
 * @param {Object} q Параметры поиска
 * @param {Object} s Параметры Сортировки
 * @returns
 */
function findOne(db, code, q, s) {
	return new Promise((resolve, reject) => {
		if (!code) return reject('Не определена коллекция');
		if (!s)
			return db[code].findOne(q, (err, doc) => {
				err ? reject(err) : resolve(doc);
			});

		db[code]
			.find(q)
			.sort(s)
			.limit(1, (err, doc) => (err ? reject(err) : resolve(doc.at(0))));
	});
}

/**
 * Вставки данных в коллекцию
 * @param {Object} db БД
 * @param {String} name Наименование коллекции
 * @param {Object|Array} data Данные для вставки
 * @returns {Object} Результат выполнения
 */
function insert(db, name, data) {
	return new Promise((resolve, reject) => {
		db[name].insert(data, (err, doc) => {
			if (err) return reject(err);
			resolve(doc);
		});
	});
}

/**
 * Удаление документов в коллекции
 * @param {Object} db БД
 * @param {String} name Наименование коллекции
 * @param {Object} query Параметры выборки
 * @returns
 */
function remove(db, name, query) {
	return new Promise((resolve, reject) => {
		db[name].remove(query, (error, doc) => {
			if (error) return reject(error);
			resolve(doc);
		});
	});
}

/**
 * Частичное обновление документа
 * @param {Object} db БД
 * @param {String} name Наименование коллекции
 * @param {Object} query Параметры выборки
 * @param {Object} obj Данные для обновления
 * @param {Object} opt Доп опции Опции (upsert, multy)
 * @returns
 */
function update(db, name, query, obj = {}, opt = {}) {
	return new Promise((resolve, reject) => {
		db[name].update(query, obj, opt, (err, doc) =>
			err ? reject(err) : resolve(doc),
		);
	});
}

/**
 * Проверка на уникальность поля
 * @param {Object} db БД
 * @param {String} name Наименование коллекции
 * @param {Object} q Параметры выборки
 * @param {ObjectId} _id ссылка на документ
 * @returns
 */
function unique(db, name, q, _id) {
	return new Promise((resolve, reject) => {
		findOne(db, name, q)
			.then((doc) => {
				if (!doc) return resolve(true);
				if (doc._id.toString() === _id) return resolve(true);
				resolve(false);
			})
			.catch(reject);
	});
}

/**
 * Поиск курсором
 * @param {Object} db БД
 * @param {String} name Наименование коллекции
 * @param {Object} q Параметры выборки
 * @param {Function} cb Функция для обработки докумнта в data получает в параметрах итоговый массив и документ
 * @param {Object} s Параметры сортировки
 * @param {Object} l Параметр ограничения кол-ва записей
 */
function cursor(db, name, q = {}, cb, s, l) {
	return new Promise((resolve, reject) => {
		const arr = [];
		let count = 0;
		let end = false;
		const cur = db[name].find(q);
		if (s) cur.sort(s);
		if (l) cur.limit(l);

		cur.on('error', reject);
		cur.on('end', (_) => {
			end = true;
			if (count) return;
			resolve(arr);
		});
		cur.on('data', (doc) => {
			++count;
			/**
			 * Запускаем переданную функцию как Promise
			 * Если есть ответ то добавляем в массив
			 */
			Promise.resolve(cb(doc, arr, db))
				.then((r) => {
					if (r) arr.push(r);
					if (--count) return;
					if (!end) return;
					resolve(arr);
				})
				.catch((err) => {
					cur.destroy();
					reject(err);
				});
		});
	});
}

/**
 * Обновляет и возвращает один документ
 * @param {Object} db БД
 * @param {String} code Наименование коллекции
 * @param {Object} query Параметры выборки
 * @param {Object||Array} upd Данные для обновления
 * @param {Object} upsert (поумолчанию false). Если true, создает новыйдокумент если не найдено согласно выбоки query
 * @param {Boolean} n (поумолчанию true). Если true, возвращается измененный документ, а не исходный. По умолчанию — ложь.
 * @param {Object} sort Необязательный. Определяет, какой документ модифицируется операцией, если запрос выбирает несколько документов.
 * @param {Boolean} remove Удаление документа согласно выбоки query (поумолчанию false)
 * @returns {Object||Array}
 */
function findAndModify(
	db,
	code,
	query,
	upd = {},
	upsert = false,
	n = true,
	sort = {},
	remove = false,
) {
	return new Promise((resolve, reject) => {
		db[code].findAndModify(
			{
				query,
				update: upd,
				sort,
				remove,
				new: n,
				upsert,
			},
			(err, doc) => (err ? reject(err) : resolve(doc)),
		);
	});
}

/**
 * Список уникальных значений поля
 * @param {Object} db БД
 * @param {String} name Коллекция
 * @param {String} field Поле
 * @param {Object} query Параметры выборки
 */
function distinct(db, name, field, query) {
	return new Promise((resolve, reject) => {
		db[name].distinct(field, query, (err, list) =>
			err ? reject(err) : resolve(list),
		);
	});
}

/**
 * Агрегация
 * @param {Object} db БД
 * @param {String} name Коллекция
 * @param {Array} pipeline  выполняет пайплайн
 */
function aggregate(db, name, pipeline, options = {}) {
	return new Promise((resolve, reject) => {
		const cursor = db[name].aggregate(pipeline, options);

		// Используем toArray для получения результатов (стандартный подход для mongojs)
		cursor.toArray((err, docs) => {
			// console.log("docs", docs.length);
			if (err) {
				console.error(err);
				// Если ошибка связана с размером буфера (результат слишком большой для BSON)
				if (
					err.code === 'ERR_OUT_OF_RANGE' ||
					(err.message &&
						(err.message.includes('offset') ||
							err.message.includes('range') ||
							err.message.includes('out of range')))
				) {
					console.error(
						'Ошибка: Результат агрегации слишком большой для сериализации в BSON.',
					);
					console.error(
						'Рекомендация: Добавьте $limit в pipeline для ограничения количества возвращаемых документов.',
					);
					console.error(`Ошибка: ${err.message}`);
					// Возвращаем ошибку с понятным сообщением
					return reject(
						new Error(
							'Результат агрегации слишком большой. Уменьшите период выборки.',
						),
					);
				}
				console.error(err);
				return reject(err);
			}
			resolve(docs);
		});
	});
}
module.exports = {
	count,
	find,
	findOne,
	insert,
	remove,
	update,
	findAndModify,
	unique,
	cursor,
	distinct,
	aggregate,
};
