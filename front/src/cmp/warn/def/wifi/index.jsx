import { useState, useEffect } from 'react'
import useWarn from '@store/warn'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import './style.css'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

import { post } from '@tool/api/service'

export default function Wifi({data}) {
	const [inputMode, setInputMode] = useState('list') // 'list' или 'manual'
	const [availableNetworks, setAvailableNetworks] = useState()
	const [selectedNetwork, setSelectedNetwork] = useState()
	const [ssid, setSsid] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const clear = useWarn((s) => s.clear)

	const status = data?.info?.find(el => el.interface.startsWith('wlan'))?.state === 'UP' ? true : false

	useEffect(() => {
		scanWifiNetworks()
	}, [])


	// Сканирование WiFi сетей
	const scanWifiNetworks = () => {
		setIsLoading(true)
		get('wifi', data.req_ip).then((o) => {
			setAvailableNetworks(o?.result || [])
		}).catch((e) => {
			notification.error('Ошибка сканирования WiFi сетей: ' + e.message)
		})
		.finally(() => {
			setIsLoading(false)
		})
	}

	const switchWifi = () => {
		post('switching', { type: 'wifi', state: status ? 'off' : 'on' }, data.req_ip)
		.then((o) => {
			notification.success(o.message)
		}).catch((e) => {
			notification.error('Ошибка переключения WiFi: ' + e.message)
		})
	}

	const connectWifi = (doc) => {

		setIsLoading(true)
		post('wifi', doc, data.req_ip).then((o) => {
			if (o.success !== false) {
				notification.success('Успешно подключено к WiFi сети: ' + doc.ssid)
				scanWifiNetworks()
			} else {
				notification.error('Ошибка подключения: ' + (o.message || 'Неизвестная ошибка'))
			}
		}).catch((e) => {
			notification.error('Ошибка подключения к WiFi сети: ' + e.message)
		}).finally(() => {
			scanWifiNetworks()
			setIsLoading(false)
			clear()
		})
	}

	const handleSave = () => {
		console.log('handleSave', inputMode, selectedNetwork, ssid)
		const finalSsid = inputMode === 'list' ? selectedNetwork : ssid

		if (!finalSsid.trim()) {
			notification.warning('Выберите или укажите название WiFi сети')
			return
		}
		const bssid = availableNetworks.find(el => el.ssid === finalSsid)?.bssid
		const wifiConfig = {
			ssid: finalSsid,
			password,
		}
		if (bssid) wifiConfig.bssid = bssid
		console.log('wifiConfig', wifiConfig)
		connectWifi(wifiConfig)
	}

	const closeModal = () => {
		clear()
		// Сброс значений при закрытии
		setInputMode('list')
		setSelectedNetwork('')
		setSsid('')
		setPassword('')
	}

	const handleInputModeChange = (e) => {
		setInputMode(e.target.value)
		// Очищаем поля при смене режима
		setSelectedNetwork('')
		setSsid('')
		setPassword('')
	}


	return (
		<div className='network-modal-content'>
			<h3 className='network-modal-title'>Подключение к WiFi</h3>

			{status && <div className='wifi-input-mode-section'>
				<span className='network-section-title'>Выбор сети:</span>
				<div className='network-radio-group'>
					<Radio
						value='list'
						selected={inputMode}
						change={handleInputModeChange}
						title='Выбрать из списка'
						name='wifiInputMode'
					/>
					<Radio
						value='manual'
						selected={inputMode}
						change={handleInputModeChange}
						title='Указать вручную'
						name='wifiInputMode'
					/>
				</div>
			</div>}

			{inputMode === 'list' && status && (
				<div className='wifi-networks-section'>
					<div className='wifi-scan-header'>
						<span className='network-section-title'>Доступные сети:</span>
						<Btn
							title={isLoading ? 'Поиск...' : 'Обновить'}
							onClick={scanWifiNetworks}
							disabled={isLoading}
						/>
					</div>

					{availableNetworks?.length > 0 ? (
						<div className='wifi-networks-list'>
							{[...availableNetworks]
								.sort((a, b) => {
									// Текущая сеть всегда первая
									if (a.current && !b.current) return -1;
									if (!a.current && b.current) return 1;
									return 0;
								})
								.map((el, index) => (
								<div
									key={index}
									className={`wifi-network-item ${
										selectedNetwork === el.ssid ? 'selected' : ''
									} ${el.current ? 'current' : ''}`}
									onClick={el.current ? undefined : () => setSelectedNetwork(el.ssid)}
								>
									<div className='wifi-network-info'>
										<div style={{display: 'flex', alignItems: 'center'}}>
											<span className='wifi-network-ssid'>{el.ssid}</span>
											{el.current && (
												<span className='wifi-network-current-indicator'>Подключено</span>
											)}
										</div>
									</div>
									<span className='wifi-network-signal'>
										{el.signal} dBm
									</span>
								</div>
							))}
						</div>
					) : (
						<div className='wifi-no-networks'>
							{isLoading
								? 'Поиск сетей...'
								: "Сети не найдены. Нажмите 'Обновить' для поиска."}
						</div>
					)}
				</div>
			)}

			{inputMode === 'manual' && status && (
				<div className='wifi-manual-section'>
					<div className='network-field'>
						<span className='network-field-label'>Название сети (SSID):</span>
						<Input
							name={'ssid'}
							value={ssid}
							setValue={setSsid}
							placeholder='MyWiFiNetwork'
							disabled={false}
							auth={false}
						/>
					</div>
				</div>
			)}

			{((inputMode === 'list' && selectedNetwork) || (inputMode === 'manual' && ssid)) && status && (
				<div className='wifi-credentials-section'>
					<div className='network-field'>
						<span className='network-field-label'>Пароль:</span>
						<Input
							name='password'
							// type='password'
							value={password}
							setValue={setPassword}
							placeholder='Пароль WiFi сети'
							disabled={false}
							max='9999999999999999999999999999999999999999'
							auth={false}
						/>
					</div>
				</div>
			)}

			<div className='network-modal-buttons'>
				{/* <Btn title={`${status ? 'Выключить' : 'Включить'}`} onClick={switchWifi} /> */}
				{status && <Btn title='Отмена' onClick={closeModal} />}
				{status && (
					<Btn
						title={isLoading ? "Подключение..." : "Подключиться"}
						onClick={handleSave}
						disabled={isLoading || !((inputMode === 'list' && selectedNetwork) || (inputMode === 'manual' && ssid.trim()))}
					/>
				)}
			</div>
		</div>
	)
}
