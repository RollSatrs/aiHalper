import { useState, useEffect } from 'react'
import './UserProfile.css'

const UserProfile = ({ isOpen, onClose, language = 'ru' }) => {
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUserData()
      loadUserTickets()
    }
  }, [isOpen])

  const loadUserData = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }

  const loadUserTickets = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setTickets([])
        return
      }

      const response = await fetch('http://localhost:3000/api/tickets/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data.reverse()) // Новые сверху
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'new': language === 'ru' ? '🆕 Новая' : '🆕 Жаңа',
      'in-progress': language === 'ru' ? '⚙️ В работе' : '⚙️ Жұмыс істеп жатыр',
      'resolved': language === 'ru' ? '✅ Решено' : '✅ Шешілді',
      'closed_auto': language === 'ru' ? '✅ Решено автоматически' : '✅ Автоматты шешілді',
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      'new': 'status-new',
      'in-progress': 'status-in-progress',
      'resolved': 'status-resolved',
      'closed_auto': 'status-closed-auto',
    }
    return classes[status] || ''
  }

  if (!isOpen) return null

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-profile-close" onClick={onClose}>×</button>

        <div className="user-profile-header">
          <h2>👤 {language === 'ru' ? 'Профиль и заявки' : 'Профиль және өтініштер'}</h2>
        </div>

        <div className="user-profile-content">
          {/* Информация о пользователе */}
          <div className="user-info-section">
            <h3>{language === 'ru' ? 'Информация о пользователе' : 'Пайдаланушы ақпараты'}</h3>
            {user && (
              <div className="user-info-card">
                <div className="user-info-item">
                  <span className="user-info-label">{language === 'ru' ? 'Имя:' : 'Аты:'}</span>
                  <span className="user-info-value">{user.name || '-'}</span>
                </div>
                <div className="user-info-item">
                  <span className="user-info-label">Email:</span>
                  <span className="user-info-value">{user.email || '-'}</span>
                </div>
                <div className="user-info-item">
                  <span className="user-info-label">{language === 'ru' ? 'Роль:' : 'Рөл:'}</span>
                  <span className="user-info-value">
                    {user.role === 'client' 
                      ? (language === 'ru' ? 'Клиент' : 'Клиент')
                      : (language === 'ru' ? 'Оператор' : 'Оператор')
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Список заявок */}
          <div className="user-tickets-section">
            <h3>
              {language === 'ru' ? 'Мои заявки' : 'Менің өтініштерім'} 
              {tickets.length > 0 && <span className="tickets-count">({tickets.length})</span>}
            </h3>

            {loading ? (
              <div className="loading-message">
                {language === 'ru' ? 'Загрузка...' : 'Жүктелуде...'}
              </div>
            ) : tickets.length === 0 ? (
              <div className="empty-message">
                {language === 'ru' 
                  ? 'У вас пока нет заявок. Создайте заявку через чат!'
                  : 'Сізде әлі өтініштер жоқ. Чат арқылы өтініш құрыңыз!'
                }
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`ticket-item ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="ticket-item-header">
                      <span className="ticket-number">#{ticket.id}</span>
                      <span className={`ticket-status-badge ${getStatusClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <div className="ticket-item-message">
                      {ticket.message.length > 100 
                        ? ticket.message.substring(0, 100) + '...'
                        : ticket.message}
                    </div>
                    <div className="ticket-item-meta">
                      <span className="ticket-category">{ticket.category}</span>
                      <span className="ticket-date">
                        {new Date(ticket.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {ticket.operatorResponse && (
                      <div className="ticket-has-response">
                        💬 {language === 'ru' ? 'Есть ответ от оператора' : 'Оператордан жауап бар'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Детали выбранной заявки */}
          {selectedTicket && (
            <div className="ticket-details-modal">
              <div className="ticket-details-content">
                <button 
                  className="ticket-details-close"
                  onClick={() => setSelectedTicket(null)}
                >
                  ×
                </button>
                <h3>{language === 'ru' ? 'Детали заявки' : 'Өтініш мәліметтері'} #{selectedTicket.id}</h3>
                
                <div className="ticket-detail-section">
                  <h4>{language === 'ru' ? 'Ваше сообщение:' : 'Сіздің хабарламаңыз:'}</h4>
                  <p className="ticket-detail-message">{selectedTicket.message}</p>
                </div>

                <div className="ticket-detail-info">
                  <div className="ticket-detail-item">
                    <span className="detail-label">{language === 'ru' ? 'Категория:' : 'Категория:'}</span>
                    <span className="detail-value">{selectedTicket.category}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">{language === 'ru' ? 'Отдел:' : 'Бөлім:'}</span>
                    <span className="detail-value">{selectedTicket.department}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">{language === 'ru' ? 'Приоритет:' : 'Басымдық:'}</span>
                    <span className="detail-value">{selectedTicket.priority}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">{language === 'ru' ? 'Статус:' : 'Мәртебе:'}</span>
                    <span className={`detail-value ${getStatusClass(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                  </div>
                </div>

                {selectedTicket.autoSolution && (
                  <div className="ticket-detail-section">
                    <h4>✅ {language === 'ru' ? 'Автоматическое решение:' : 'Автоматты шешім:'}</h4>
                    <div className="auto-solution-content">
                      {selectedTicket.autoSolution.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.operatorResponse && (
                  <div className="ticket-detail-section operator-response">
                    <h4>👨‍💼 {language === 'ru' ? 'Ответ оператора:' : 'Оператордың жауабы:'}</h4>
                    <div className="operator-response-content">
                      {selectedTicket.operatorResponse}
                    </div>
                  </div>
                )}

                {!selectedTicket.operatorResponse && selectedTicket.status === 'in-progress' && (
                  <div className="ticket-detail-section">
                    <p className="waiting-message">
                      ⏳ {language === 'ru' 
                        ? 'Ваша заявка обрабатывается оператором. Ответ будет здесь.'
                        : 'Сіздің өтінішіңіз оператормен өңделуде. Жауап осында болады.'
                      }
                    </p>
                  </div>
                )}

                <div className="ticket-detail-dates">
                  <div className="ticket-detail-item">
                    <span className="detail-label">{language === 'ru' ? 'Создано:' : 'Құрылған:'}</span>
                    <span className="detail-value">
                      {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {selectedTicket.resolvedAt && (
                    <div className="ticket-detail-item">
                      <span className="detail-label">{language === 'ru' ? 'Решено:' : 'Шешілген:'}</span>
                      <span className="detail-value">
                        {new Date(selectedTicket.resolvedAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile

