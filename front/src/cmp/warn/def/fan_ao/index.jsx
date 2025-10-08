import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Control from '../fn/control'
import Field from './field'
import Title from '../fn/title'
import '../style.css'

//Управление вентилятором+ПЧ
export default function Entry({ data = {}, entryCode }) {
	const { _id, name, module, buildingId, sectionId, active, ao, sp } = data
	const { clear } = useWarn()
	const { setO, setFan } = useOutputStore()
	const { getFan } = useInputStore()

	// Состояние вентилятора
	const state = getFan({ _id })?.state ?? null
	// Номер выхода (канала) вентилятора
	const ch = module?.channel - 1
	// Выбранное действие
	const [sel, setSel] = useState(state)
	// Задание spO: процент открытия
	const [spO, setSpO] = useState(sp)
	// При обновлении
	useEffect(() => {
		setSel(state)
		setSpO(sp)
	}, [_id])
	return (
		<div className='entry'>
			<Title name={name} />
			<Field
				sel={sel}
				change={change}
				active={active}
				state={state}
				spO={spO}
				setSpO={setSpO}
			/>
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ок
	function set() {
		const cmd = sel === 'run' ? 1 : 0
		// Вывести из работы
		if (sel === 'off' && state !== 'off')
			setFan({ buildingId, sectionId, fanId: _id, action: sel, value: true, setpoint: 20 })
		// Включить
		else if (sel == 'run')
			setFan({
				buildingId,
				sectionId,
				fanId: _id,
				action: sel,
				value: false,
				setpoint: spO <= 0 ? 20 : spO,
			})
		// Выключить
		else setFan({ buildingId, sectionId, fanId: _id, action: sel, value: false, setpoint: 20 })

		const out = { idB: buildingId, idM: module.id, value: cmd, channel: ch }
		const outAO = {
			idB: buildingId,
			idM: ao.id,
			value: sel == 'run' ? spO : 20,
			channel: ao.channel - 1,
		}
		// Блокировка включения при 0%
		if (sel == 'run' && spO <= 0) {
			console.log('Блокировка включения при 0%')
			return
		}
		setO(out, outAO)
		clear()
	}
	// Отмена
	function cancel() {
		clear()
	}
	// Переключение радиокнопок
	function change(e) {
		setSel(e.target.value)
	}
}
