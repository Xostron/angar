import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Control from '../fn/control'
import Field from './field'
import Title from '../fn/title'
import '../style.css'
const _MIN_VALUE = 20
//Управление вентилятором+ПЧ
export default function Entry({ data = {}, entryCode }) {
	const { _id, name, module, buildingId, sectionId, active, ao } = data
	const clear = useWarn((s) => s.clear)
	const setO = useOutputStore((s) => s.setO)
	const setFan = useOutputStore((s) => s.setFan)
	// Состояние ВНО: Выведен ли из работы ВНО, Состояние вентилятора
	const { off = null, state = null, value = '--' } = useInputStore((s) => s.getFan({ _id }))
	// Состояние вентилятора
	// const state = getFan({ _id })?.state ?? null
	// Номер выхода (канала) вентилятора
	const ch = module?.channel - 1
	// Выбранное действие
	const [sel, setSel] = useState(state)
	// Задание spO: процент открытия
	const [spO, setSpO] = useState(value)
	// При обновлении
	useEffect(() => {
		setSel(state)
		setSpO(value)
	}, [_id])
	return (
		<div className='entry'>
			<Title name={name} />
			<Field
				sel={sel}
				off={off}
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
			setFan({ buildingId, sectionId, fanId: _id, action: sel, value: true, setpoint: _MIN_VALUE })
		// Включить
		else if (sel == 'run')
			setFan({
				buildingId,
				sectionId,
				fanId: _id,
				action: sel,
				value: false,
				setpoint: spO <= 0 ? _MIN_VALUE : spO,
			})
		// Выключить
		else setFan({ buildingId, sectionId, fanId: _id, action: sel, value: false, setpoint: _MIN_VALUE })

		const out = { idB: buildingId, idM: module.id, value: cmd, channel: ch }
		const outAO = {
			idB: buildingId,
			idM: ao.id,
			value: sel == 'run' ? spO : _MIN_VALUE,
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
