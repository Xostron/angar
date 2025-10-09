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
	// [Состояния и показания испарителя], [склад вкл/выкл]
	const [cooler, start] = useInputStore(({ input }) => [
		input?.[data.el?._id],
		input?.retain?.[build]?.start,
	])
	// Стадия испарителя - режим
	const uptxt = start ? cooler.name : ''
	// Задание ПЧ
	let ltxt = data.sp
	if (ltxt !== undefined) ltxt = isNaN(ltxt) ? '-- %' : ltxt + '%'
	else ltxt = '-- %'
	// Температура всасывания
	const idT = data.el.sensor?.find((el) => el.type === 'cooler')?._id
	let t = cooler?.sensor?.[idT]?.value ?? '-'
	const rtxt = t != '-' ? t + ' ' + defUn?.temp : t
	// Соленоид подогрева
	const idSolHeat = data.el?.solHeat?.[0]?._id
	const solHeat = cooler?.solHeat?.[idSolHeat]
	let cl = ['cmp-sec-row-item', 'btn-cooler', cls]
	// Иконка состояния испарителя
	const state = cooler?.state
	let icon = `/img/cold/cooler/cooler-${state}.svg` ?? ''
	if (data.state == 'alarm') icon = '/img/cold/cooler/fan-alarm.svg'
	
	// Доступ разрешен
	if (isAuth) cl.push('auth-sir')
	// Вывод из работы ВНО
	if (data.state == 'off') cl.push('off')

	cl = cl.join(' ')
	return (
		<BtnCooler
			onClick={() => onClick(data)}
			icon={icon}
			ltxt={ltxt}
			rtxt={rtxt}
			uptxt={uptxt}
			solHeat={solHeat}
			level={cooler?.level}
			cls={cl}
		/>
	)
}

// Кнопка Испаритель
function BtnCooler({
	icon,
	onClick,
	ltxt = '',
	rtxt = '',
	uptxt = '',
	solHeat,
	level,
	cls,
	style,
}) {
	let cl = ['btn', cls]
	cl = cl.join(' ')
	// Соленоид подогрева
	const Sh = solHeat ? (
		<img className='sol-heat' src={'/img/periphery/heater/on.svg'} />
	) : (
		<span className='sol-heat'></span>
		// <img className='sol-heat' src={'/img/periphery/heater/on.svg'} />
	)

	return (
		<button onClick={onClick} className={cl} style={style}>
			<div className='state-extra'>
				{solHeat !== undefined && Sh}
				<span>{level}</span>
			</div>
			<div className='state-cooler'>
				<span>{ltxt}</span>
				<img src={icon} />
				<span>{rtxt}</span>
			</div>
			<span className='up'>{uptxt}</span>
		</button>
	)
}
