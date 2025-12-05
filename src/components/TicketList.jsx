import { useState, useEffect } from 'react'
import './TicketList.css'

const TicketList = ({ language = 'ru', onTicketClick }) => {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadTickets()
    const interval = setInterval(loadTickets, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadTickets = () => {
    const stored = JSON.parse(localStorage.getItem('tickets') || '[]')
    setTickets(stored)
  }

  const getStatusBadge = (ticket) => {
    const statuses = {
      'new': { label: language === 'ru' ? 'Новая' : 'Жаңа', color: '#3b82f6' },
      'auto-resolved': { label: language === 'ru' ? 'Авторешение' : 'Автоматты шешім', color: '#10b981' },
      'in-progress': { label: language === 'ru' ? 'В работе' : 'Жұмыс істеп жатыр', color: '#f59e0b' },
      'escalated': { label: language === 'ru' ? 'Эскалировано' : 'Эскалацияланған', color: '#ef4444' },
      'resolved': { label: language === 'ru' ? 'Решено' : 'Шешілді', color: '#6b7280' }
    }
    return statuses[ticket.status] || statuses['new']
  }

  const getPriorityBadge = (priority) => {
    const priorities = {
      'low': { label: language === 'ru' ? 'Низкий' : 'Төмен', color: '#10b981' },
      'medium': { label: language === 'ru' ? 'Средний' : 'Орташа', color: '#f59e0b' },
      'high': { label: language === 'ru' ? 'Высокий' : 'Жоғары', color: '#ef4444' }
    }
    return priorities[priority] || priorities['medium']
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    if (filter === 'auto-resolved') return ticket.status === 'auto-resolved'
    if (filter === 'escalated') return ticket.escalated
    return ticket.status === filter
  })

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h2>{language === 'ru' ? 'Список заявок' : 'Өтініштер тізімі'}</h2>
        <div className="ticket-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            {language === 'ru' ? 'Все' : 'Барлығы'} ({tickets.length})
          </button>
          <button
            className={filter === 'auto-resolved' ? 'active' : ''}
            onClick={() => setFilter('auto-resolved')}
          >
            {language === 'ru' ? 'Авторешение' : 'Автоматты'} ({tickets.filter(t => t.status === 'auto-resolved').length})
          </button>
          <button
            className={filter === 'escalated' ? 'active' : ''}
            onClick={() => setFilter('escalated')}
          >
            {language === 'ru' ? 'Эскалировано' : 'Эскалация'} ({tickets.filter(t => t.escalated).length})
          </button>
        </div>
      </div>

      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>{language === 'ru' ? 'Нет заявок' : 'Өтініштер жоқ'}</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const status = getStatusBadge(ticket)
            const priority = getPriorityBadge(ticket.priority)

            return (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => {
                  if (onTicketClick) {
                    onTicketClick(ticket.id)
                  }
                }}
              >
                <div className="ticket-card-header">
                  <div className="ticket-id">#{ticket.id}</div>
                  <div className="ticket-badges">
                    <span className="status-badge" style={{ backgroundColor: status.color }}>
                      {status.label}
                    </span>
                    {ticket.priority && (
                      <span className="priority-badge" style={{ backgroundColor: priority.color }}>
                        {priority.label}
                      </span>
                    )}
                    {ticket.autoResolved && (
                      <span className="ai-badge">🤖 AI</span>
                    )}
                  </div>
                </div>

                <div className="ticket-content">
                  <h3>{ticket.subject || (language === 'ru' ? 'Без темы' : 'Тақырыпсыз')}</h3>
                  <p className="ticket-description">
                    {ticket.description.length > 100
                      ? ticket.description.substring(0, 100) + '...'
                      : ticket.description}
                  </p>
                </div>

                {ticket.classification && (
                  <div className="ticket-classification">
                    <div className="classification-item">
                      <span className="classification-label">{language === 'ru' ? 'Категория' : 'Категория'}:</span>
                      <span className="classification-value">{ticket.classification.category}</span>
                    </div>
                    {ticket.classification.department && (
                      <div className="classification-item">
                        <span className="classification-label">{language === 'ru' ? 'Отдел' : 'Бөлім'}:</span>
                        <span className="classification-value">{ticket.classification.department}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="ticket-footer">
                  <div className="ticket-meta">
                    <span>{ticket.name}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  {ticket.responseTime && (
                    <div className="ticket-time">
                      ⏱️ {ticket.responseTime}с
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TicketList

