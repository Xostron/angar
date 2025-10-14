import { useState } from 'react'
import Btn from '@cmp/fields/btn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import useEquipStore from '@store/equipment'

export default function Equip({ props }) {
	const { req_ip } = props
	const [file, setFile] = useState()
	const apiInfo = useEquipStore((s) => s.apiInfo)

	// Стили для таблицы
	const tableStyles = {
		borderCollapse: 'collapse',
		minWidth: '350px'
	}

	const cellStyles = {
		padding: '4px 8px',
		border: '1px solid #ccc'
	}

	const headerCellStyles = {
		...cellStyles,
		fontWeight: 'bold'
	}

	const titleStyles = {
		fontSize: '20px',
		fontWeight: 'bold'
	}

	return (
		<>
			<span style={titleStyles}>
				Управление проектом и оборудованием:
			</span>
			<div className='page-service-row'>
				<Btn
					title='Обновить конфигурацию оборудования по сети'
					onClick={() => onEquip(req_ip)}
				/>
			</div>
			<div className='page-service-row'>
				<input
					className='cell input auth-input'
					type='file'
					onChange={(e) => setFile(e.target.files[0])}
				/>
				<Btn title='Обновить конфигурацию из файла' onClick={() => onEquipFile(file)} />
			</div>
			<br />
			<hr />
			<br />
			<span style={titleStyles}>
				Информация о сервере:
			</span>
			<table className='page-service-info' style={tableStyles}>
				<tbody>
					<tr>
						<td style={headerCellStyles}>Версия API</td>
						<td style={cellStyles}>{apiInfo?.back || '??'}</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Версия WEB</td>
						<td style={cellStyles}>{apiInfo?.front || '??'}</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>IP</td>
						<td style={cellStyles}>{apiInfo?.ip || '??'}</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>API URI</td>
						<td style={cellStyles}>{apiInfo?.apiUri || '??'}</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Порт</td>
						<td style={cellStyles}>{apiInfo?.port || '??'}</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Период запроса рамы</td>
						<td style={cellStyles}>{apiInfo?.period || '??'} c</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Период обновления данных ЦС</td>
						<td style={cellStyles}>{apiInfo?.periodState || '??'} c</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Батарея</td>
						<td style={cellStyles}>{apiInfo?.battery || '??'} %</td>
					</tr>
					<tr>
						<td style={headerCellStyles}>Дата</td>
						<td style={cellStyles}>{apiInfo?.date ? new Date(apiInfo?.date).toLocaleString('ru-RU') : '??'}</td>
					</tr>
				</tbody>
			</table>
		</>
	)
}

// Выполнить обновление конфигурации оборудования через файл
function onEquipFile(file) {
	if(!file) {
		notification.error('Файл не выбран')
		return
	}
	const formData = new FormData()
	formData.append('file', file)
	post('file', formData)
		.then((o) => {
			notification.success('Конфигурация оборудования установлена: ' + o.message)
		})
		.catch((e) => {
			notification.error(
				e.message || 'Ошибка установки конфигурации оборудования: ' + e.error || e.message,
				{
					errorId: e.id,
				}
			)
		})
}
// Выполнить обновление конфигурации оборудования по сети
function onEquip(req_ip) {
	get('equipment', req_ip)
		.then((o) => {
			if(o.result) {
				const date = new Date(o.result)
				notification.success('Конфигурация оборудования обновлена: ' + date.toLocaleString('ru-RU'))
			} else {
				notification.success('Конфигурация оборудования обновлена: ' + JSON.stringify(o))
			}
		})
		.catch((e) => {
			notification.error(
				e.message || 'Ошибка обновления конфигурации оборудования: ' + e.error || e.message,
				{
					errorId: e.id,
				}
			)
		})
}
