import useView from '@cmp/view/use_view'
import useViewStore from '@store/view'

export default function View() {
	const view = useViewStore((s) => s.view)
	useView()
	console.log(111, view)
	return <></>
}
