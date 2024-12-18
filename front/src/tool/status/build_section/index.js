import useInputStore from '@store/input'
import { useShallow } from 'zustand/react/shallow'

export default function running(build, sect) {
	const [retain] = useInputStore(useShallow(({ input }) => [input.retain?.[build]]))
	// Режим работы секции (авто - true, ручной - false, выкл - null || undefined)
	const mode = retain?.mode?.[sect]
	// Склад Вкл/Выкл
	const launch = retain?.start
	// Секция в ручном режиме
	const isMan = mode === false
	// Секция в Выкл режиме
	const isOff = mode === null
	// Секция в Авто режиме
	const isAuto = mode === true
	return { launch, mode, isMan, isOff, isAuto }
}
