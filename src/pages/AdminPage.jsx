import { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard'
import './AdminPage.css'

const AdminPage = ({ language, onNavigate, onLogout }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Загружаем данные пользователя из localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
  }

  const handleBackToSite = () => {
    if (onNavigate) {
      onNavigate('client')
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🔐 Админ-панель</h1>
          <p className="admin-subtitle">
            {language === 'ru' 
              ? 'Панель управления для операторов службы поддержки' 
              : 'Қолдау қызметі операторлары үшін басқару панелі'}
          </p>
        </div>
        <div className="admin-header-actions">
          {user && (
            <div className="admin-user-info">
              <span className="admin-user-name">{user.name || user.email}</span>
            </div>
          )}
          <button onClick={handleLogout} className="admin-logout-button">
            {language === 'ru' ? 'Выйти' : 'Шығу'}
          </button>
          <button onClick={handleBackToSite} className="admin-back-link">
            ← {language === 'ru' ? 'Назад к сайту' : 'Сайтқа оралу'}
          </button>
        </div>
      </div>
      <Dashboard />
    </div>
  )
}

export default AdminPage

