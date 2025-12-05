import { useState, useEffect } from 'react'
import Header from './components/Header'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/AdminPage'
import Login from './components/Login'
import './App.css'

function App() {
  const [language, setLanguage] = useState('ru')
  const [currentPage, setCurrentPage] = useState('client') // 'client' или 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        setIsAuthenticated(false)
        setCheckingAuth(false)
        return
      }

      // Проверяем, что пользователь - оператор
      try {
        const userData = JSON.parse(user)
        if (userData.role === 'operator') {
          // Проверяем валидность токена на сервере
          const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            setIsAuthenticated(true)
          } else {
            // Токен невалиден
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Проверяем URL для определения страницы
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/admin' || path === '/admin/') {
      setCurrentPage('admin')
    } else {
      setCurrentPage('client')
    }
  }, [])

  // Обновляем URL при смене страницы
  const navigateToPage = (page) => {
    setCurrentPage(page)
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin')
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  // Обработка навигации через кнопку "назад"
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('admin')
      } else {
        setCurrentPage('client')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
  }

  const handleLogin = (token, user) => {
    setIsAuthenticated(true)
    setCurrentPage('admin')
  }

  // Показываем загрузку пока проверяем авторизацию
  if (checkingAuth && currentPage === 'admin') {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#667eea'
        }}>
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {currentPage !== 'admin' && (
        <Header 
          language={language} 
          onLanguageChange={handleLanguageChange}
          currentPage={currentPage}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === 'admin' ? (
        isAuthenticated ? (
          <AdminPage 
            language={language} 
            onNavigate={navigateToPage}
          />
        ) : (
          <Login 
            language={language}
            onLogin={handleLogin}
          />
        )
      ) : (
        <ClientPage 
          language={language} 
          onLanguageChange={handleLanguageChange}
        />
      )}
    </div>
  )
}

export default App
