import defUn from '@src/tool/unit'
import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'

/**
 *
 * @param {object} data Рама испарителя
 * @returns
 */
export default function ItemCooler({ data, onClick, isAuth, cls }) {
	const { build } = useParams()
	// [Состояния и показания испарителя], [склад вкл/выкл]
	const [cooler, start] = useInputStore(({ input }) => [
		input?.[data.el?._id],
		input?.retain?.[build]?.start,
	])
	// Состояние испарителя
	const state = cooler?.state
	// Стадия испарителя - режим
	const utxt = start ? cooler.name : ''
	// Задание ПЧ
	let ltxt = Object.values(cooler?.fan ?? {})?.[0]?.value
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
	// Иконка состояния испарителя с ПЧ
	const img = `/img/cold/cooler/cooler-${state}.svg` ?? ''
	// Доступ разрешен
	if (isAuth) cl.push('auth-sir')

	cl = cl.join(' ')

	return (
		<BtnCooler
			onClick={() => onClick(data)}
			icon={img}
			ltxt={ltxt}
			rtxt={rtxt}
			utxt={utxt}
			solHeat={solHeat}
			cls={cl}
		/>
	)
}

// Кнопка Испаритель
function BtnCooler({ icon, onClick, ltxt = '', rtxt = '', utxt = '', solHeat, cls, style }) {
	let cl = ['btn', cls]
	cl = cl.join(' ')
	// Соленоид подогрева
	const Sh = solHeat ? (
		<img src={'/img/periphery/heater/on.svg'} />
	) : (
		<img src={'/img/periphery/heater/off.svg'} />
	)
	return (
		<button onClick={onClick} className={cl} style={style}>
			{solHeat !== undefined && Sh}
			<span>{ltxt}</span>
			<div>
				<span className='up'>{utxt}</span>
				<img src={icon} />
			</div>
			<span>{rtxt}</span>
		</button>
	)
}
