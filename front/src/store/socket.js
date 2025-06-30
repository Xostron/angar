import { create } from 'zustand'
/**
 * Пример Zustand
 * https://docs.pmnd.rs/zustand/getting-started/introduction
 * @param {*} set
 * @param {*} get
 * @returns
 */
const useSocketStore = create((set, get) => ({
	on: null,
	updateOn: (on) => set({ on }),
	info: 'asd',
	setInfo: (info) => set({ info }),
	fooEvents: [],
	setfooEvents: (value) => set({ fooEvents: [...fooEvents, value] }),
}))

export default useSocketStore

/*
Пример использования Zustand в компаненте
function ExampleComponent() {
	const { count, updateCount } = useExampleStore(({ count, updateCount }) => ({
		count,
		updateCount,
	}));

	updateCount(10);

	return <h1>Example Zustand store {count}</h1>;
}
*/
