import useViewStore from '@src/store/view'
import AlarmBarM from './mobile'
import AlarmBarW from './web'

export default function AlarmBar() {
	const mb = useViewStore((s) => s.mb())
	return mb ? <AlarmBarM /> : <AlarmBarW />
}
