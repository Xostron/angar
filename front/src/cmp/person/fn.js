import useAuthStore from "@store/auth";

//Выход из системы
export default function out() {
	const logout = useAuthStore.getState().logout
	logout()
}