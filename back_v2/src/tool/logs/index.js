// const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

function logs() {
	return new Promise((resolve, reject) => {
		// Удаление пустых файлов в директории PATH_LOG
		fs.readdir(process.env.PATH_LOG, (err, files) => {
			console.log(
				'Удаление пустых файлов в директории PATH_LOG: ',
				process.env.PATH_LOG
			);
			if (err) return reject(err);
			// const oldFiles = [];
			let count = 0;
			// Проверяем файлы в директории PATH_LOG
			files.forEach((file) => {
				const filePath = path.join(process.env.PATH_LOG, file);
				try {
					const stats = fs.statSync(filePath);
					// Файл пустой
					const isEmpty = stats.size === 0;
					// Файлы старше 2 часов удаляем
					const isOlder =
						Date.now() - stats.birthtimeMs > 2 * 60 * 60 * 1000;
					if (isEmpty && isOlder) {
						// Удаляем пустой файл старше 2 часов
						console.log(
							'Удаление пустого файла: ',
							new Date(stats.birthtimeMs).toLocaleString(),
							stats.size,
							filePath
						);
						fs.unlinkSync(filePath);
						count++;
					}
				} catch (error) {
					console.error(
						'Ошибка удаления пустого файла в директории PATH_LOG: ',
						filePath,
						error
					);
				}
			});
			console.log('Удалено пустых файлов: ', count);
			resolve();
		});
	});
}

module.exports = logs;

// // Архивация файлов старше 7 дней
// function archiveLogs(oldFiles) {
// 	return new Promise((resolve, reject) => {
// 		if (!oldFiles || !oldFiles.length) {
// 			console.log('Нет файлов logs для архивации');
// 			return resolve();
// 		}
// 		console.log('Архивация файлов logs старше 7 дней: ', oldFiles);

// 		// Формируем имя архива: YYYY-MM-DD_7days.zip
// 		const now = new Date();
// 		now.setDate(now.getDate() - 7);
// 		const archiveName = `${now.toJSON().split('T')[0]}.zip`;
// 		const archivePath = path.join(process.env.PATH_LOG, archiveName);

// 		const output = fs.createWriteStream(archivePath);
// 		const archive = archiver('zip', { zlib: { level: 9 } });

// 		output.on('close', () => {
// 			console.log(
// 				`Архив создан: ${archivePath} (${archive.pointer()} bytes)`
// 			);
// 			// После успешного архивирования удаляем исходные файлы
// 			let count = 0;
// 			oldFiles.forEach((file) => {
// 				fs.unlink(file, (err) => {
// 					if (err) {
// 						console.error(
// 							'Ошибка удаления файла после архивации:',
// 							file,
// 							err
// 						);
// 					} else {
// 						console.log('Удалён архивированный файл:', file);
// 						count++;
// 					}
// 				});
// 			});
// 			console.log('Удалено файлов после архивации: ', count);
// 			resolve();
// 		});

// 		archive.on('error', (err) => {
// 			console.error('Ошибка архивации файлов:', err);
// 			reject(err);
// 		});

// 		archive.pipe(output);

// 		oldFiles.forEach((file) => {
// 			archive.file(file, { name: path.basename(file) });
// 		});

// 		archive.finalize();
// 	});
// }
