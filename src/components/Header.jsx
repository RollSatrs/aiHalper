import { useState, useEffect, useRef } from 'react'
import { translations } from '../utils/translations'
import ClientLogin from './ClientLogin'
import './Header.css'

const Header = ({ language = 'ru', onLanguageChange, currentPage = 'client', onNavigate, onLoginClick, onProfileClick, user: userProp }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const langMenuRef = useRef(null)
  const t = translations[language]?.header || translations.ru.header

  // Проверяем авторизацию при загрузке и при изменении
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setIsLoggedIn(true)
          // Используем user из пропсов, если передан, иначе из localStorage
          setUser(userProp || parsedUser)
        } catch (e) {
          setIsLoggedIn(false)
          setUser(null)
        }
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    checkAuth()
    // Слушаем изменения в localStorage (при логине/логауте)
    window.addEventListener('storage', checkAuth)
    // Проверяем каждую секунду (для синхронизации между вкладками)
    const interval = setInterval(checkAuth, 1000)

    return () => {
      window.removeEventListener('storage', checkAuth)
      clearInterval(interval)
    }
  }, [userProp])

  const handleLanguageSelect = (lang) => {
    if (onLanguageChange) {
      onLanguageChange(lang)
    }
    setShowLangMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false)
      }
    }

    if (showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLangMenu])

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.svg" alt="Kazakhtelecom" className="logo-image" />
          </div>
          <div className="city-selector">
            <select className="city-dropdown">
              <option>Алматы</option>
              <option>Астана</option>
              <option>Шымкент</option>
            </select>
          </div>
        </div>

        <div className="header-right">
          <div className="language-selector" ref={langMenuRef}>
            <button 
              className="language-btn" 
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M12 2C15.31 2 18.23 3.29 20.35 5.29M12 22C8.69 22 5.77 20.71 3.65 18.71M3.65 18.71C4.55 15.63 7.78 13.5 11.5 13.5C15.22 13.5 18.45 15.63 19.35 18.71M3.65 5.29C4.55 8.37 7.78 10.5 11.5 10.5C15.22 10.5 18.45 8.37 19.35 5.29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>{t.lang}</span>
            </button>
            {showLangMenu && (
              <div className="language-menu">
                <button 
                  className={`lang-option ${language === 'ru' ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect('ru')}
                >
                  Рус
                </button>
                <button 
                  className={`lang-option ${language === 'kz' ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect('kz')}
                >
                  Қаз
                </button>
                <button 
                  className={`lang-option ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect('en')}
                >
                  Eng
                </button>
              </div>
            )}
          </div>
          {!isLoggedIn ? (
            <button 
              className="login-btn"
              onClick={() => {
                if (onLoginClick) {
                  onLoginClick()
                } else {
                  setShowLoginModal(true)
                }
              }}
              title={language === 'ru' ? 'Войти в систему' : 'Жүйеге кіру'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10 17 15 12 10 7" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="12" x2="3" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {language === 'ru' ? 'Войти' : 'Кіру'}
            </button>
          ) : (
            <div className="user-menu">
              <button 
                className="profile-btn"
                onClick={() => {
                  if (onProfileClick) {
                    onProfileClick()
                  }
                }}
                title={language === 'ru' ? 'Профиль и заявки' : 'Профиль және өтініштер'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="user-name">{user?.name || user?.email}</span>
              </button>
              <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem('authToken')
                  localStorage.removeItem('user')
                  setIsLoggedIn(false)
                  setUser(null)
                  window.location.reload()
                }}
                title={language === 'ru' ? 'Выйти' : 'Шығу'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          {currentPage === 'client' && onNavigate && (
            <button 
              className="admin-btn"
              onClick={() => onNavigate('admin')}
              title={language === 'ru' ? 'Перейти в админ-панель' : 'Админ-панельге өту'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              {language === 'ru' ? 'Админка' : 'Админ'}
            </button>
          )}
          <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {showLoginModal && (
        <ClientLogin
          onClose={() => setShowLoginModal(false)}
          onSuccess={(user, token) => {
            setIsLoggedIn(true)
            setUser(user)
            setShowLoginModal(false)
            // Обновляем страницу чтобы применить изменения
            window.location.reload()
          }}
          language={language}
        />
      )}
    </header>
  )
}

export default Header

