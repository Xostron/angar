import defImg from '@tool/icon'
import defUn from '@src/tool/unit'
import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'

export default function ItemCooler({ data, action, locked, cls }) {
	const { build } = useParams()
	const [input] = useInputStore(({ input }) => [input])
	const start = input?.retain?.[build]?.start
	let cl = ['cmp-sec-row-item', 'btn-cooler', cls]

	// Состояние ВНО испарителя (вкл Run/выкл Stop/выведен из работы Off)
	const cooler = input?.[data._id]
	let state = cooler?.state?.split('-')?.[0] ?? 'off'
	// Вкл
	if (state == 'on') cl.push('sir-item-run')
	// Выкл
	if (state == 'off') state = 'stop'
	// Выведен из работы
	if (state == 'off2') cl.push('off')
	// Иконка испарителя с ПЧ
	// const img = `/img/cold/cooler/cooler-${cooler.state}.svg` ?? ''
	// const img = `/img/cold/cooler/cooler-on-off-off.svg` ?? ''
	const img = `/img/cold/cooler/cooler-on-on-off.svg` ?? ''
	// Разблокирован доступ
	if (!locked) cl.push('auth-sir')
	cl = cl.join(' ')

	// Стадия испарителя - режим
	const utxt = start ? cooler.name : ''
	// Задание ПЧ
	const ltxt = '100%'
	// Температура всасывания
	let t = Object.values(cooler?.sensor ?? {})
	t = t?.[0]?.value ?? '-'
	const unit = defUn?.temp
	const rtxt = t != '-' ? t + ' ' + unit : t

	return <BtnCooler onClick={action} icon={img} ltxt={ltxt} rtxt={rtxt} utxt={utxt} cls={cl} />
}

// Кнопка Испаритель
function BtnCooler({ icon, onClick, ltxt = '', rtxt = '', utxt = '', cls, style }) {
	let cl = ['btn', cls]
	cl = cl.join(' ')

	return (
		<button onClick={onClick} className={cl} style={style}>
			<span>{ltxt}</span>
			<div>
				<span className='up'>{utxt}</span>
				<img src={icon} />
			</div>
			<span>{rtxt}</span>
		</button>
	)
}
