import useWarn from '@store/warn'
import { useState } from 'react'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import './style.css'

export default function Ethernet({ modalRef, onSave }) {
	const [networkMode, setNetworkMode] = useState('dhcp') // 'dhcp' или 'manual'
	const [ip, setIp] = useState('')
	const [mask, setMask] = useState('')
	const [gateway, setGateway] = useState('')
	const [dns, setDns] = useState('')
	const { clear } = useWarn(({ clear }) => ({ clear }))

	const handleSave = () => {
		const networkConfig = {
			mode: networkMode,
			...(networkMode === 'manual' && {
				ip,
				mask,
				gateway,
				dns,
			}),
		}
		onSave(networkConfig)
		clear()
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
				<h3 className='network-modal-title'>Настройки сети (!!! Не доступно !!!)</h3>

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

				{networkMode === 'manual' && (
					<div className='network-manual-section'>
						<div className='network-field'>
							<span className='network-field-label'>IP-адрес:</span>
							<Input
								value={ip}
								setValue={setIp}
								placeholder='192.168.1.100'
								disabled={false}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>Маска подсети:</span>
							<Input
								value={mask}
								setValue={setMask}
								placeholder='255.255.255.0'
								disabled={false}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>Основной шлюз:</span>
							<Input
								value={gateway}
								setValue={setGateway}
								placeholder='192.168.1.1'
								disabled={false}
							/>
						</div>

						<div className='network-field'>
							<span className='network-field-label'>DNS сервер:</span>
							<Input
								value={dns}
								setValue={setDns}
								placeholder='8.8.8.8'
								disabled={false}
							/>
						</div>
					</div>
				)}

				<div className='network-modal-buttons'>
					<Btn title='Отмена' onClick={closeModal} />
					{/* <Btn title="Сохранить" onClick={handleSave} /> */}
				</div>
			</div>
		</div>
	)
}
