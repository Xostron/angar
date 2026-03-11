import Btn from '@cmp/fields/btn'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Soft() {
	return (
		<>
			<div className='page-service-row'>Первоначальная настройка. Обновить - Пересобрать - Сохранить (! Не забудь настроить сначала ip) </div>
			<div className='page-service-row'>
				<Btn title='1. Обновить ПО' onClick={() => onUptSoft()} />
				<Btn title='2. npm install && build' onClick={() => onNpm()} />
				<Btn title='3. pm2 save (Сохранить)' onClick={() => onPm2('save')} />
			</div>
			<div className='page-service-row'>Дополнительное управление PM2 (Внутренний сервер).</div>
			<div className='page-service-row'>
				{/* <Btn title='Запуск' onClick={() => onPm2('start')} /> */}
				{/* <Btn title='Остновка' onClick={() => onPm2('stop')} /> */}
				<Btn title='Перезапуск' onClick={() => onPm2('restart')} />
				<Btn title='Очистка логов' onClick={() => onPm2('flush')} />
			</div>
		</>
	)
}

function onNpm() {
	get('build')
		.then((result) => {
			notification.success('Сборка проекта запущена подождите 10-20 секунд')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка сборки проекта', {
				errorId: e.id,
			})
		})
}

function onPm2(cmd='restart') {
	get('pm2/'+cmd)
		.then((result) => {
			notification.success('Команда pm2 запущена подождите 10-20 секунд')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка выполнения команды pm2'+cmd, {
				errorId: e.id,
			})
		})
}

function onUptSoft() {
	get('upt_soft')
		.then((result) => {
			notification.success('Обновление ПО запущено')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка обновления ПО', {
				errorId: e.id,
			})
		})
}
