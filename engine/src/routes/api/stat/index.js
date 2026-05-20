const get = require('./get');
const del = require('./del');

function stat(router) {
    // Получить список фалйлов
    router.get('/stat', get());
    // Удаление файла
	router.delete('/stat/:name', del());
}

module.exports = stat;