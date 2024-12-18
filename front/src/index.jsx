import Warn from '@cmp/warn'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './style.css'
import './style_large.css'
import Socket from '@cmp/socket'
import Keyboard from '@cmp/keyboard'
import Version from './cmp/version'

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
