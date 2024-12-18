function checkS(state1, state2) {
	if ([state1, state2].includes('off')) return 'off'
	if ([state1, state2].includes('alarm')) return 'alarm'
	return 'on'
}

export { checkS }
