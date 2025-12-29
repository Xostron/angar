import useInputStore from '@store/input'
import defImg from '@src/tool/icon'
import defUn from '@src/tool/unit'

export default function Other({ data = {}, buildId, sect, cls }) {
	const { valve, fan, heating, cooler } = data

	const [input] = useInputStore(({ input }) => [input])
	if (!valve) return
	const idxVin = valve.findIndex((v) => v.type === 'in')
	const idxVout = valve.findIndex((v) => v.type === 'out')
	// Состояние и позиции клапанов
	// posV(valve?.[idxVin]?._id, buildId)
	const spVin = input?.[valve?.[idxVin]?._id]?.val
	const spVout = input?.[valve?.[idxVout]?._id]?.val
	const stateVin = input?.[valve?.[idxVin]?._id]?.state
	const stateVout = input?.[valve?.[idxVout]?._id]?.state
	const imgVin = defImg.valve?.vin?.[stateVin]
	const imgVout = defImg.valve?.vout?.[stateVout]

	// Вентиляторы секции (включен ли хоть один вентилятор)
	const clrFan = cooler?.flatMap((el) => el?.fan ?? [])
	const allFan = [...(fan ?? []), ...(clrFan ?? [])]
	const sumAlr = allFan?.some((el) => input?.[el._id]?.state === 'alarm')
	const sumRun = allFan?.some((el) => input?.[el._id]?.state === 'run')
	const stateF = sumAlr === true ? 'alarm' : sumRun === true ? 'run' : 'stop'
	const imgF = defImg.fan?.[stateF]

	// Состояние клапанов и вентиляторов
	const stateH = input?.outputEq?.[heating?.[0]?._id] === true ? 'on' : ''
	const imgH = defImg.heating?.[stateH]

	let cl = ['section-vf']
	if (!valve) cl.push('vf-evenly')
	cl = cl.join(' ')

	let clFan = [cls]
	stateF === 'run' ? clFan.push('a-run') : null
	clFan = clFan.join(' ')

	return (
		<div className={cl}>
			{imgH && <img className={cls} src={imgH} alt='' />}
			{imgVin && (
				<>
					<img className={cls} src={imgVin} alt='' />
					<span>{spVin} %</span>
				</>
			)}
			{imgF && <img className={clFan} src={imgF} alt='' />}
			{imgVout && (
				<>
					<span>{spVout} %</span>
					<img className={cls} src={imgVout} alt='' />
				</>
			)}
		</div>
	)
}
