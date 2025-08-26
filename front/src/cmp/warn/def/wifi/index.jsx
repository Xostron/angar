import { useState, useEffect } from 'react'
import useWarn from '@store/warn'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import './style.css'

export default function Wifi({ data }) {
	const {modalRef, onSave} = data
	const [inputMode, setInputMode] = useState('list') // 'list' или 'manual'
	const [availableNetworks, setAvailableNetworks] = useState([])
	const [selectedNetwork, setSelectedNetwork] = useState('')
	const [ssid, setSsid] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const clear = useWarn((s) => s.clear)
	
	const handleSave = () => {
		const finalSsid = inputMode === 'list' ? selectedNetwork : ssid
		
		if (!finalSsid.trim()) {
			alert('Выберите или укажите название WiFi сети')
			return
		}

		const wifiConfig = {
			ssid: finalSsid,
			password
		}
		onSave(wifiConfig)
		clear()
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

	const scanWifiNetworks = async () => {
		setIsLoading(true)
		try {
			// Здесь будет вызов API для сканирования WiFi сетей
			// const response = await get('scan_wifi')
			// setAvailableNetworks(response.networks || [])
			
			// Пока используем заглушку
			setAvailableNetworks([
				{ ssid: 'MyWiFi', signal: -45, security: 'WPA2' },
				{ ssid: 'Office_Network', signal: -60, security: 'WPA2' },
				{ ssid: 'Guest_WiFi', signal: -75, security: 'Open' }
			])
		} catch (error) {
			alert('Ошибка сканирования WiFi сетей: ' + error.message)
		} finally {
			setIsLoading(false)
		}
	}

	// Сканирование при открытии модального окна
	useEffect(() => {
		// if (modalRef.current) {
		// 	const dialog = modalRef.current
			const handleOpen = () => {
				scanWifiNetworks()
			// }
			
			dialog.addEventListener('open', handleOpen)
			return () => dialog.removeEventListener('open', handleOpen)
		}
	}, [])

	return (
		// <Dialog href={modalRef} cls="network-modal wifi-modal">
			<div className="network-modal-content">
				<h3 className="network-modal-title">Подключение к WiFi (!!! Не доступно !!!)</h3>
				
				<div className="wifi-input-mode-section">
					<span className="network-section-title">Выбор сети:</span>
					<div className="network-radio-group">
						<Radio
							value="list"
							selected={inputMode}
							change={handleInputModeChange}
							title="Выбрать из списка"
							name="wifiInputMode"
						/>
						<Radio
							value="manual"
							selected={inputMode}
							change={handleInputModeChange}
							title="Указать вручную"
							name="wifiInputMode"
						/>
					</div>
				</div>

				{inputMode === 'list' && (
					<div className="wifi-networks-section">
						<div className="wifi-scan-header">
							<span className="network-section-title">Доступные сети:</span>
							<Btn 
								title={isLoading ? "Поиск..." : "Обновить"} 
								onClick={scanWifiNetworks}
								disabled={isLoading}
							/>
						</div>
						
						{availableNetworks.length > 0 ? (
							<div className="wifi-networks-list">
								{availableNetworks.map((network, index) => (
									<div 
										key={index} 
										className={`wifi-network-item ${selectedNetwork === network.ssid ? 'selected' : ''}`}
										onClick={() => setSelectedNetwork(network.ssid)}
									>
										<div className="wifi-network-info">
											<span className="wifi-network-ssid">{network.ssid}</span>
											<span className="wifi-network-security">{network.security}</span>
										</div>
										<span className="wifi-network-signal">{network.signal} dBm</span>
									</div>
								))}
							</div>
						) : (
							<div className="wifi-no-networks">
								{isLoading ? "Поиск сетей..." : "Сети не найдены. Нажмите 'Обновить' для поиска."}
							</div>
						)}
					</div>
				)}

				{inputMode === 'manual' && (
					<div className="wifi-manual-section">
						<div className="network-field">
							<span className="network-field-label">Название сети (SSID):</span>
							<Input
								value={ssid}
								setValue={setSsid}
								placeholder="MyWiFiNetwork"
								disabled={false}
							/>
						</div>
					</div>
				)}

				{((inputMode === 'list' && selectedNetwork) || (inputMode === 'manual' && ssid)) && (
					<div className="wifi-credentials-section">
						<div className="network-field">
							<span className="network-field-label">Пароль:</span>
							<Input
								type="password"
								value={password}
								setValue={setPassword}
								placeholder="Пароль WiFi сети"
								disabled={false}
							/>
						</div>
					</div>
				)}



				<div className="network-modal-buttons">
					<Btn title="Отмена" onClick={closeModal} />
					{/* <Btn title="Подключиться" onClick={handleSave} /> */}
				</div>
			</div>
		// </Dialog>
	)
}
