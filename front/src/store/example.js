import { create } from 'zustand';

/**
 * Пример Zustand
 * https://docs.pmnd.rs/zustand/getting-started/introduction
 * @param {*} set
 * @returns
 */
const useExampleStore = create((set, get) => ({
	count: 0,
	updateCount: (count) => set({ count }),
}));

export default useExampleStore;

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
