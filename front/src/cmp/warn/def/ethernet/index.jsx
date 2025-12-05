import { useState } from 'react'
import useWarn from '@store/warn'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import './style.css'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import { useEffect } from 'react'

export default function Ethernet({ data, refDialog }) {
	console.log('Ethernet', data)
	const [networkMode, setNetworkMode] = useState() // 'dhcp' или 'manual'
	const [ip, setIp] = useState('')
	const [mask, setMask] = useState('')
	const [gateway, setGateway] = useState('')
	const [dns, setDns] = useState('')
	const [info, setInfo] = useState(data.info)
	const clear = useWarn((s) => s.clear)

	useEffect(() => {
		get('eth', data.req_ip).then((o) => {
			console.log('eth', o)
			setInfo(o)
		}).catch((e) => {
			console.log('eth', e)
			notification.error(e.message || 'Ошибка получения информации о сети', {
				errorId: e.id,
			})
		})
	
	}, [data.req_ip])

	const handleSave = () => {
		post('eth', { mode: networkMode, ip, mask, gateway, dns }, data.req_ip).then((o) => {
			notification.success('Настройки сети сохранены')
			data.resload()

		}).catch((e) => {
			notification.error(e.message || 'Ошибка сохранения настроек сети', {
				errorId: e.id,
			})
		})

	}

	const closeModal = () => {
		clear()
		// Сброс значений при закрытии
		setNetworkMode('dhcp')
		setIp('')
		setMask('')
		setGateway('')
		setDns('')
	}

	const handleModeChange = (e) => {
		setNetworkMode(e.target.value)
	}

	return (
		<div className='entry '>
			<div className='network-modal-content'>
				<h3 className='network-modal-title'>Настройки сети</h3>

				<div className='network-mode-section'>
					<span className='network-section-title'>Режим настройки:</span>
					<div className='network-radio-group'>
						<Radio
							value='dhcp'
							selected={networkMode}
							change={handleModeChange}
							title='DHCP (автоматически)'
							name='networkMode'
						/>
						<Radio
							value='manual'
							selected={networkMode}
							change={handleModeChange}
							title='Ручная настройка'
							name='networkMode'
						/>
					</div>
				</div>
				{info?.mode && !networkMode && (
				<div className='network-info-section' style={{ marginBottom: 16 }}>
					<span className='network-section-title'>Текущее состояние:</span>
					<table className='network-info-table' style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Интерфейс</td>
								<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>
									{info?.iface}
								</td>
							</tr>
							<tr>
								<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Режим</td>
								<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>
									{info?.mode === 'manual'
										? 'Ручной (Static IP)'
										: info?.mode === 'auto'
										? 'DHCP (автоматически)'
										: 'Неизвестно'}
								</td>
							</tr>
							{info?.ip && (
								<tr>
									<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>IP-адрес</td>
									<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{info?.ip}</td>
								</tr>
							)}
							{info?.mask && (
								<tr>
									<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Маска</td>
									<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{info?.mask}</td>
								</tr>
							)}
							{info?.gateway && (
								<tr>
									<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>Шлюз</td>
									<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{info?.gateway}</td>
								</tr>
							)}
							{info?.dns && (
								<tr>
									<td className='network-info-label' style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>DNS</td>
									<td className='network-info-value' style={{ padding: '4px 8px', border: '1px solid #ccc' }}>
										{Array.isArray(info?.dns) ? info?.dns.join(', ') : info?.dns}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>)}
				{networkMode === 'manual' && (
					<div className='network-manual-section'>
						<div className='network-field'>
							<span className='network-field-label'>IP-адрес:</span>
							<Input
								value={ip}
								setValue={setIp}
								placeholder='192.168.1.100'
								disabled={false}
								auth={false}
								keyboard="numeric"
								keyboardContainer={refDialog?.current}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>Маска подсети:</span>
							<Input
								value={mask}
								setValue={setMask}
								placeholder='255.255.255.0'
								disabled={false}
								auth={false}
								keyboard="numeric"
								keyboardContainer={refDialog?.current}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>Основной шлюз:</span>
							<Input
								value={gateway}
								setValue={setGateway}
								placeholder='192.168.1.1'
								disabled={false}
								auth={false}
								keyboard="numeric"
								keyboardContainer={refDialog?.current}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>DNS сервер:</span>
							<Input
								value={dns}
								setValue={setDns}
								placeholder='8.8.8.8'
								disabled={false}
								auth={false}
								keyboard="numeric"
								keyboardContainer={refDialog?.current}
							/>
						</div>
					</div>
				)}

				<div className='network-modal-buttons'>
					<Btn title='Отмена' onClick={closeModal} />
					{networkMode && <Btn title="Сохранить" onClick={handleSave} />}
				</div>
			</div>
		</div>
	)
}
