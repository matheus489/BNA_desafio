import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App } from './pages/App'
import { Login } from './pages/Login'
import { Analyze } from './pages/Analyze'
import { Chat } from './pages/Chat'
import { Compare } from './pages/Compare'
import { Admin } from './pages/Admin'
import { History } from './pages/History'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<Navigate to="/analyze" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={localStorage.getItem('role') === 'admin' ? <Admin /> : <Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)


