import Dashboard from '../components/Dashboard'
import './AdminPage.css'

const AdminPage = ({ language, onNavigate }) => {
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
        <button onClick={handleBackToSite} className="admin-back-link">
          ← {language === 'ru' ? 'Назад к сайту' : 'Сайтқа оралу'}
        </button>
      </div>
      <Dashboard />
    </div>
  )
}

export default AdminPage

