import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import AIAssistantButton from '../components/AIAssistantButton'
import AIAssistantChat from '../components/AIAssistantChat'
import UserProfile from '../components/UserProfile'
import Modal from '../components/Modal'
import './ClientPage.css'

const ClientPage = ({ language, onLanguageChange, isAuthenticated = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState(null)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userTickets, setUserTickets] = useState([])

  useEffect(() => {
    loadUserTickets()
    const interval = setInterval(loadUserTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  // Слушаем событие открытия профиля из Header
  useEffect(() => {
    const handleOpenProfile = () => {
      setIsProfileOpen(true)
    }
    window.addEventListener('openProfile', handleOpenProfile)
    return () => window.removeEventListener('openProfile', handleOpenProfile)
  }, [])

  const loadUserTickets = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setUserTickets([])
        return
      }

      // Загружаем тикеты авторизованного пользователя
      const response = await fetch('http://localhost:3000/api/tickets/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const tickets = await response.json()
        // Показываем только последние 5 заявок пользователя
        setUserTickets(tickets.slice(-5).reverse())
      } else if (response.status === 401) {
        // Не авторизован
        setUserTickets([])
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    }
  }

  const handleConnectClick = (tariff = null) => {
    setSelectedTariff(tariff)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTariff(null)
  }

  const handleOpenAIChat = () => {
    setIsAIChatOpen(true)
  }

  const handleCloseAIChat = () => {
    setIsAIChatOpen(false)
  }

  const getStatusLabel = (ticket) => {
    if (ticket.status === 'closed_auto') {
      return language === 'ru' ? '✅ Решено автоматически' : '✅ Автоматты шешілді'
    }
    if (ticket.status === 'in-progress') {
      return language === 'ru' ? '⚙️ В работе' : '⚙️ Жұмыс істеп жатыр'
    }
    if (ticket.status === 'resolved') {
      return language === 'ru' ? '✅ Решено' : '✅ Шешілді'
    }
    return language === 'ru' ? '🆕 Новая' : '🆕 Жаңа'
  }

  return (
    <div className="client-page">
      <Hero 
        language={language} 
        onConnectClick={() => handleConnectClick()} 
        onAIClick={handleOpenAIChat}
      />
      
      {/* Кнопка чата показывается только если пользователь авторизован */}
      {isAuthenticated && (
        <AIAssistantButton onOpen={handleOpenAIChat} language={language} />
      )}

      {/* Основной контент для авторизованных клиентов */}
      {isAuthenticated && (
        <div className="client-main-content">
          <div className="container">
            {/* Быстрые действия - блоки */}
            <div className="quick-actions-blocks">
              <div className="quick-action-block" onClick={() => setIsProfileOpen(true)}>
                <div className="block-content">
                  <div className="block-icon">📋</div>
                  <div className="block-info">
                    <h3>{language === 'ru' ? 'Мои заявки' : 'Менің өтініштерім'}</h3>
                    <p>{language === 'ru' ? 'Просмотр всех обращений' : 'Барлық өтініштерді қарау'}</p>
                  </div>
                  <div className="block-arrow">→</div>
                </div>
              </div>
              <div className="quick-action-block" onClick={handleOpenAIChat}>
                <div className="block-content">
                  <div className="block-icon">💬</div>
                  <div className="block-info">
                    <h3>{language === 'ru' ? 'Новая заявка' : 'Жаңа өтініш'}</h3>
                    <p>{language === 'ru' ? 'Создать обращение' : 'Өтініш құру'}</p>
                  </div>
                  <div className="block-arrow">→</div>
                </div>
              </div>
              <div className="quick-action-block" onClick={() => setIsProfileOpen(true)}>
                <div className="block-content">
                  <div className="block-icon">📊</div>
                  <div className="block-info">
                    <h3>{language === 'ru' ? 'Статистика' : 'Статистика'}</h3>
                    <p>
                      {userTickets.length > 0 
                        ? <>
                            <span style={{fontWeight: 'bold', color: '#667eea'}}>{userTickets.length}</span> {language === 'ru' ? 'заявок' : 'өтініш'}
                            {' • '}
                            <span style={{color: '#10b981'}}>{userTickets.filter(t => t.status === 'closed_auto' || t.status === 'resolved').length}</span> {language === 'ru' ? 'решено' : 'шешілді'}
                          </>
                        : language === 'ru' ? 'Нет заявок' : 'Өтініштер жоқ'
                      }
                    </p>
                  </div>
                  <div className="block-arrow">→</div>
                </div>
              </div>
            </div>

            {/* История обращений (если есть) */}
            {userTickets.length > 0 && (
              <div className="recent-tickets">
                <h2 className="section-title">
                  {language === 'ru' ? '📋 Последние заявки' : '📋 Соңғы өтініштер'}
                </h2>
                <div className="tickets-list-blocks">
                  {userTickets.slice(0, 3).map((ticket) => {
                    // Безопасное форматирование даты
                    const formatDate = (dateStr) => {
                      if (!dateStr) return language === 'ru' ? 'Только что' : 'Жаңа ғана'
                      try {
                        const date = new Date(dateStr)
                        if (isNaN(date.getTime())) return language === 'ru' ? 'Только что' : 'Жаңа ғана'
                        return date.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      } catch {
                        return language === 'ru' ? 'Только что' : 'Жаңа ғана'
                      }
                    }

                    return (
                      <div 
                        key={ticket.id} 
                        className="ticket-block"
                        onClick={() => setIsProfileOpen(true)}
                      >
                        <div className="ticket-block-header">
                          <div className="ticket-block-left">
                            <span className="ticket-id-block">#{ticket.id}</span>
                            <span className={`ticket-status-block ${ticket.status}`}>
                              {getStatusLabel(ticket)}
                            </span>
                          </div>
                          <span className="ticket-category-block">{ticket.category || (language === 'ru' ? 'Общая' : 'Жалпы')}</span>
                        </div>
                        <p className="ticket-message-block">
                          {ticket.message 
                            ? (ticket.message.length > 100 ? ticket.message.substring(0, 100) + '...' : ticket.message)
                            : (language === 'ru' ? 'Нет описания' : 'Сипаттама жоқ')
                          }
                        </p>
                        {ticket.operatorResponse && (
                          <div className="ticket-response-block">
                            <div className="response-label">👨‍💼 {language === 'ru' ? 'Ответ оператора:' : 'Оператордың жауабы:'}</div>
                            <div className="response-text">{ticket.operatorResponse}</div>
                          </div>
                        )}
                        {ticket.autoSolution && (
                          <div className="ticket-solution-block">
                            <div className="solution-label">✅ {language === 'ru' ? 'Решение:' : 'Шешім:'}</div>
                            <div className="solution-text">
                              {ticket.autoSolution.length > 150 
                                ? ticket.autoSolution.substring(0, 150) + '...' 
                                : ticket.autoSolution
                              }
                            </div>
                          </div>
                        )}
                        <div className="ticket-block-footer">
                          <span className="ticket-date-block">
                            {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.resolvedAt && (
                            <span className="ticket-resolved-date">
                              {language === 'ru' ? 'Решено: ' : 'Шешілген: '}
                              {formatDate(ticket.resolvedAt).split(',')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {userTickets.length > 3 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    {language === 'ru' ? 'Посмотреть все заявки →' : 'Барлық өтініштерді қарау →'}
                  </button>
                )}
              </div>
            )}

            {/* Пустое состояние */}
            {userTickets.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>{language === 'ru' ? 'У вас пока нет заявок' : 'Сізде әлі өтініштер жоқ'}</h3>
                <p>
                  {language === 'ru' 
                    ? 'Создайте первую заявку через чат с ИИ-ассистентом'
                    : 'ЖИ-көмекшімен чат арқылы алғашқы өтінішті құрыңыз'
                  }
                </p>
                <button className="create-ticket-btn" onClick={handleOpenAIChat}>
                  {language === 'ru' ? 'Создать заявку' : 'Өтініш құру'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <AIAssistantChat 
        isOpen={isAIChatOpen} 
        onClose={handleCloseAIChat} 
        language={language}
        onTicketCreated={loadUserTickets}
      />
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tariff={selectedTariff}
        language={language}
      />
    </div>
  )
}

export default ClientPage

