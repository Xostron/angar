import { useState } from 'react'
import Btn from '@cmp/fields/btn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import useEquipStore from '@store/equipment'

export default function Equip({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	const [file, setFile] = useState()
	const apiInfo = useEquipStore((s) => s.apiInfo)

	return (
		<>
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>
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
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>
				Информация о сервере:
			</span>
			<table className='page-service-info' style={{ borderCollapse: 'collapse', minWidth: '350px' }}>
				<tbody>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Версия</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.version || '??'}</td>
					</tr>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>IP</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.ip || '??'}</td>
					</tr>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>API URI</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.apiUri || '??'}</td>
					</tr>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Порт</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.port || '??'}</td>
					</tr>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Период запроса рамы</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.period || '??'} c</td>
					</tr>
					<tr>
						<td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Период обновления данных ЦС</td>
						<td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{apiInfo?.periodState || '??'} c</td>
					</tr>
				</tbody>
			</table>
		</>
	)
}

// Выполнить обновление конфигурации оборудования через файл
function onEquipFile(file) {
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
			notification.success('Конфигурация оборудования обновлена: ' + o.message)
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
