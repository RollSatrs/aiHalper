// Временная версия без роутера - используйте пока не установите react-router-dom
import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Tariffs from './components/Tariffs'
import AIAssistantButton from './components/AIAssistantButton'
import AIAssistantChat from './components/AIAssistantChat'
import Dashboard from './components/Dashboard'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import TicketDetail from './components/TicketDetail'
import Modal from './components/Modal'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState(null)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [language, setLanguage] = useState('ru')
  const [currentPage, setCurrentPage] = useState('home') // home, dashboard, tickets, create-ticket, ticket-detail
  const [selectedTicketId, setSelectedTicketId] = useState(null)

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

  const handleTicketSubmit = async (ticket) => {
    setTimeout(() => {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
      const updated = tickets.map(t => {
        if (t.id === ticket.id) {
          const description = t.description.toLowerCase()
          let category = 'Общая поддержка'
          let department = 'Общий отдел'
          let priority = 'medium'
          let confidence = 85
          let autoResolved = false

          if (description.includes('интернет') || description.includes('скорость') || description.includes('медленно')) {
            category = 'Проблемы с интернетом'
            department = 'Техническая поддержка'
            priority = 'high'
            confidence = 92
            if (description.includes('медленно') && description.length < 150) {
              autoResolved = true
            }
          } else if (description.includes('тариф') || description.includes('подключить') || description.includes('услуга')) {
            category = 'Подключение услуг'
            department = 'Отдел продаж'
            priority = 'medium'
            confidence = 88
          } else if (description.includes('счет') || description.includes('оплата') || description.includes('платеж')) {
            category = 'Вопросы оплаты'
            department = 'Финансовый отдел'
            priority = 'medium'
            confidence = 90
          } else if (description.includes('тв') || description.includes('телевидение') || description.includes('канал')) {
            category = 'Телевидение'
            department = 'Техническая поддержка'
            priority = 'medium'
            confidence = 87
          }

          return {
            ...t,
            classification: {
              category,
              department,
              type: 'Запрос пользователя',
              confidence
            },
            priority,
            autoResolved,
            status: autoResolved ? 'auto-resolved' : 'new',
            responseTime: autoResolved ? Math.floor(Math.random() * 5) + 1 : null,
            resolvedAt: autoResolved ? new Date().toISOString() : null
          }
        }
        return t
      })
      localStorage.setItem('tickets', JSON.stringify(updated))
      setCurrentPage('tickets')
    }, 1000)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'tickets':
        return <TicketList language={language} onTicketClick={(id) => {
          setSelectedTicketId(id)
          setCurrentPage('ticket-detail')
        }} />
      case 'ticket-detail':
        return selectedTicketId ? (
          <TicketDetail ticketId={selectedTicketId} language={language} onBack={() => setCurrentPage('tickets')} />
        ) : null
      case 'create-ticket':
        return <TicketForm onSubmit={handleTicketSubmit} language={language} />
      default:
        return (
          <>
            <Hero onConnectClick={() => handleConnectClick()} />
            <Tariffs onConnectClick={handleConnectClick} />
          </>
        )
    }
  }

  return (
    <div className="app">
      <Header 
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
      />
      {renderPage()}
      {currentPage === 'home' && (
        <>
          <AIAssistantButton onOpen={handleOpenAIChat} />
          <AIAssistantChat isOpen={isAIChatOpen} onClose={handleCloseAIChat} language={language} />
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tariff={selectedTariff}
      />
    </div>
  )
}

export default App

