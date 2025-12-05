import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import AIAssistantButton from '../components/AIAssistantButton'
import AIAssistantChat from '../components/AIAssistantChat'
import MatrixAnimation from '../components/MatrixAnimation'
import Tariffs from '../components/Tariffs'
import Modal from '../components/Modal'
import './ClientPage.css'

const ClientPage = ({ language, onLanguageChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState(null)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [userTickets, setUserTickets] = useState([])

  useEffect(() => {
    loadUserTickets()
    const interval = setInterval(loadUserTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadUserTickets = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tickets')
      if (response.ok) {
        const tickets = await response.json()
        // Показываем только последние 5 заявок пользователя
        setUserTickets(tickets.slice(-5).reverse())
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
      <MatrixAnimation />
      
      {/* История обращений */}
      {userTickets.length > 0 && (
        <div className="client-tickets-section">
          <div className="container">
            <h2 className="section-title">
              {language === 'ru' ? '📋 История ваших обращений' : '📋 Сіздің өтініштер тарихы'}
            </h2>
            <div className="tickets-grid">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className={`ticket-status ${ticket.status}`}>
                      {getStatusLabel(ticket)}
                    </span>
                  </div>
                  <p className="ticket-message">
                    {ticket.message.length > 100 
                      ? ticket.message.substring(0, 100) + '...' 
                      : ticket.message}
                  </p>
                  <div className="ticket-meta">
                    <span className="ticket-category">{ticket.category}</span>
                    <span className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {ticket.autoSolved && ticket.autoSolution && (
                    <div className="ticket-solution">
                      <strong>
                        {language === 'ru' ? 'Решение:' : 'Шешім:'}
                      </strong>
                      <p>{ticket.autoSolution.substring(0, 150)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tariffs onConnectClick={handleConnectClick} language={language} />
      
      <AIAssistantButton onOpen={handleOpenAIChat} />
      <AIAssistantChat 
        isOpen={isAIChatOpen} 
        onClose={handleCloseAIChat} 
        language={language}
        onTicketCreated={loadUserTickets}
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

