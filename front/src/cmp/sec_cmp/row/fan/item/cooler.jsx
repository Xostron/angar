import defUn from '@src/tool/unit'
import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import defImg from '@tool/icon'

/**
 *
 * @param {object} data Рамаи мясо по ВНО испарителя
 * @returns
 */
export default function ItemCooler({ data, onClick, isAuth, cls }) {
	const { build } = useParams()
	// [Состояния и показания испарителя]
	const cooler = useInputStore((s) => s?.input?.[data.el?._id])
	// [склад вкл/выкл]
	const start = useInputStore((s) => s?.input?.retain?.[build]?.start)

	// Режим испарителя
	const uptxt = start ? cooler.name : ''

	// Задание ПЧ
	const ltxt = isNaN(data.value) || data.value === null ? '-- %' : data.value + '%'

	// Температура всасывания
	const idT = data.el.sensor?.find((el) => el.type === 'cooler')?._id
	let t = cooler?.sensor?.[idT]?.value ?? '--'
	const rtxt = t != '-' ? t + ' ' + defUn?.temp : t

	// Соленоид подогрева
	// const idSolHeat = data.el?.solHeat?.[0]?._id
	const solHeat = cooler?.solHeat?.state

	// Заслонка
	const flap = cooler?.flap?.state
	// console.log(1, cooler, flap)

	// Иконка состояния испарителя
	const state = cooler?.state
	const icon = `/img/cold/cooler/cooler-${state}.svg` ?? ''

	let cl = ['cmp-sec-row-item', 'btn-cooler', cls]
	// Доступ разрешен
	if (isAuth) cl.push('auth-sir')
	// Вывод из работы ВНО
	if (data.state == 'off') cl.push('off')
	if (data.state === 'alarm') cl.push('alarm')

	cl = cl.join(' ')
	return (
		<BtnCooler
			title={data.el?._id}
			onClick={() => onClick(data)}
			icon={icon}
			ltxt={ltxt}
			rtxt={rtxt}
			uptxt={uptxt}
			solHeat={solHeat}
			flap={flap}
			level={cooler?.level}
			cls={cl}
		/>
	)
}

// Кнопка Испаритель
function BtnCooler({
	title = '',
	icon = '',
	onClick,
	ltxt = '',
	rtxt = '',
	uptxt = '',
	solHeat,
	flap,
	level,
	cls,
	style,
}) {
	let cl = ['btn', cls]
	cl = cl.join(' ')

	// Соленоид подогрева
	const Sh = solHeat ? (
		<img className='sh' src={'/img/periphery/heater/on.svg'} />
	) : (
		<span className='sh'></span>
	)

	// Заслонка
	const fl = flap ? (
		<img className='fl' src={'/img/periphery/flap.svg'} />
	) : (
		// <img className='fl' src={'/img/periphery/flap.svg'} />
		<span className='fl'></span>
	)

	return (
		<button onClick={onClick} className={cl} style={style} title={title}>
			{/* Слева: Соленоид подогрева, кол-во включенных соленоидов холода */}
			<div className='left'>
				{Sh}
				<span>{level}</span>
			</div>
			{/* Центр: Задание ПЧ, Испаритель, Темпе. испарителя */}
			<div className='center'>
				<span>{ltxt}</span>
				<img src={icon} />
				<span>{rtxt}</span>
			</div>
			{/* Верх: Состояние испарителя */}
			<span className='up'>{uptxt}</span>
			{/* Справа: Заслонка */}
			<div className='right'>{fl}</div>
		</button>
	)
}
