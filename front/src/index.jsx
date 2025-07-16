import Warn from '@cmp/warn'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Keyboard from '@cmp/keyboard'
import Version from '@cmp/version'
import Socket from '@cmp/socket'
import router from './router'
import './style.css'
import './style_large.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<>
	{/*<React.StrictMode> */}
		<Warn />
		<Socket />
		<Keyboard/>
		<Version/>
		<RouterProvider router={router} />
	{/*</React.StrictMode> */}
	</>
)
