import { create } from 'zustand'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const DEFAULT_STEP = 10

const useHistoryStore = create((set, get) => ({
	active: false,
	collapsed: false,
	playing: false,
	ts: new Date(),
	step: DEFAULT_STEP,
	loading: false,
	dataTimes: { input: null, equip: null, alarm: null },

	toggle: (val) => {
		const active = val ?? !get().active
		set({ active, playing: false })
		if (!active) set({ loading: false, dataTimes: { input: null, equip: null, alarm: null } })
	},

	toggleCollapsed: () => set({ collapsed: !get().collapsed }),

	setTs: (ts) => {
		const now = new Date()
		const min = new Date(now.getTime() - SEVEN_DAYS_MS)
		if (ts < min) ts = min
		if (ts > now) ts = now
		set({ ts: new Date(ts) })
	},

	setStep: (val) => {
		const n = Math.max(3, Math.min(1000, Number(val) || DEFAULT_STEP))
		set({ step: n })
	},

	play: () => set({ playing: true }),
	pause: () => set({ playing: false }),

	forward: () => {
		const { ts, step } = get()
		const next = new Date(ts.getTime() + step * 1000)
		get().setTs(next)
		set({ playing: false })
	},

	backward: () => {
		const { ts, step } = get()
		const prev = new Date(ts.getTime() - step * 1000)
		get().setTs(prev)
		set({ playing: false })
	},

	setLoading: (v) => set({ loading: v }),
	setDataTimes: (dt) => set({ dataTimes: dt }),
}))

export default useHistoryStore
