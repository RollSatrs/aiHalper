import { useState, useEffect } from 'react'
import Header from './components/Header'
import ClientPage from './pages/ClientPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  const [language, setLanguage] = useState('ru')
  const [currentPage, setCurrentPage] = useState('client') // 'client' или 'admin'

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
        <AdminPage 
          language={language} 
          onNavigate={navigateToPage}
        />
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
