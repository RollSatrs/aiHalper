import { useState, useEffect } from 'react'
import Header from './components/Header'
import WelcomePage from './pages/WelcomePage'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/AdminPage'
import RoleSelection from './components/RoleSelection'
import './App.css'

function App() {
  const [language, setLanguage] = useState('ru')
  const [currentPage, setCurrentPage] = useState('welcome') // 'welcome', 'client' или 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null) // 'client' или 'operator'
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        setIsAuthenticated(false)
        setUserRole(null)
        setCurrentPage('welcome')
        setCheckingAuth(false)
        return
      }

      try {
        const userData = JSON.parse(user)
        const role = userData.role

        // Проверяем валидность токена на сервере
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
          setUserRole(role)
          
          // Автоматически перенаправляем на нужную страницу
          if (role === 'operator') {
            setCurrentPage('admin')
          } else if (role === 'client') {
            setCurrentPage('client')
          } else {
            setCurrentPage('welcome')
          }
        } else {
          // Токен невалиден
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          setUserRole(null)
          setCurrentPage('welcome')
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
        setIsAuthenticated(false)
        setUserRole(null)
        setCurrentPage('welcome')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Обработка выбора роли и перенаправления
  const handleRoleSelected = (role, user, token) => {
    setIsAuthenticated(true)
    setUserRole(role)
    
    if (role === 'operator') {
      setCurrentPage('admin')
      window.history.pushState({}, '', '/admin')
    } else if (role === 'client') {
      setCurrentPage('client')
      window.history.pushState({}, '', '/')
    }
  }

  // Обработка выхода
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUserRole(null)
    setCurrentPage('welcome')
    window.history.pushState({}, '', '/')
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
  }

  // Показываем загрузку пока проверяем авторизацию
  if (checkingAuth) {
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
      {currentPage === 'welcome' ? (
        <WelcomePage 
          language={language}
          onRoleSelected={handleRoleSelected}
        />
      ) : currentPage === 'admin' ? (
        isAuthenticated && userRole === 'operator' ? (
          <AdminPage 
            language={language}
            onLogout={handleLogout}
          />
        ) : (
          <RoleSelection
            language={language}
            onRoleSelected={handleRoleSelected}
          />
        )
      ) : currentPage === 'client' ? (
        <>
          {isAuthenticated && userRole === 'client' && (
            <Header 
              language={language} 
              onLanguageChange={handleLanguageChange}
              currentPage={currentPage}
              onLogout={handleLogout}
              onProfileClick={() => {
                window.dispatchEvent(new CustomEvent('openProfile'))
              }}
            />
          )}
          <ClientPage 
            language={language} 
            onLanguageChange={handleLanguageChange}
            isAuthenticated={isAuthenticated && userRole === 'client'}
          />
        </>
      ) : null}
    </div>
  )
}

export default App
