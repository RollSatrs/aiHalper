import { useState, useEffect, useRef } from 'react'
import { translations } from '../utils/translations'
import './Header.css'

const Header = ({ language = 'ru', onLanguageChange, currentPage = 'client', onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const langMenuRef = useRef(null)
  const t = translations[language]?.header || translations.ru.header

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
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">{t.phoneLabel}</span>
              <a href={`tel:${t.phone.replace(/\s/g, '')}`} className="contact-phone">{t.phone}</a>
            </div>
            <button className="whatsapp-btn" disabled style={{ cursor: 'not-allowed', opacity: 0.6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {t.write}
            </button>
          </div>
          <div className="support-info">
            <span className="support-label">{t.supportLabel}</span>
            <a href="tel:160" className="support-phone">{t.support}</a>
          </div>
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
    </header>
  )
}

export default Header

