import def from './def'

export default function DefSection({ type }) {
	const Component = def[type]
	if (!Component) return null
	return <Component />
}
