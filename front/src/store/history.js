import { create } from 'zustand'
import { posNow } from '@store/time'

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
		// √раницы диапазона считаем по времени POS, а не клиента
		const now = posNow()
		const min = now - SEVEN_DAYS_MS
		let v = ts instanceof Date ? ts.getTime() : Number(ts)
		if (!Number.isFinite(v)) return
		if (v < min) v = min
		if (v > now) v = now
		set({ ts: new Date(v) })
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
