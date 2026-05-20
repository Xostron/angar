const fs = require('fs');
const path = require('path');

// Очистка файлов загрузки во временной директории
function clearTemp(tmpDir) {
	console.log('Очистка файлов во временной директории.', tmpDir);
	fs.readdir(tmpDir, { withFileTypes: true }, (err, files) => {
		if (err) {
			console.warn('Не удалось получить файлы во временной директории');
			return;
		}
		if (Array.isArray(files)) {
			const time = new Date().getTime();
			files.forEach((file) => {
				if (file.isFile()) {
					fs.stat(path.join(tmpDir, file.name), (err, stats) => {
						if (err) {
							console.warn(
								'Не удалось fs.stat() file %s',
								file.name
							);
							console.log(err);
							return;
						}
						//если время создания файла больше или равно 1 часу, удаляем его
						if (time - stats.birthtimeMs >= 3600000) {
							console.log('Удаление temp file %s', file.name);
							fs.unlink(path.join(tmpDir, file.name), (err) => {
								if (err) {
									console.warn(
										'Не удалось удалить temp file %s',
										file.name,
										err
									);
								} else {
									console.log(
										'Удален temp file %s',
										file.name
									);
								}
							});
						} else {
							console.log(
								'Дата Файла менее 1ч temp file %s',
								file.name
							);
						}
					});
				}
			});
		}
		console.log('Выполнено.');
	});
}

module.exports = clearTemp;
