import { useState, useEffect } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    autoSolved: 0,
    autoSolvedPercent: 0,
    avgResponseTime: '0 сек',
    classificationAccuracy: 0,
    routingErrors: 0
  })

  const [slaMetrics, setSlaMetrics] = useState({
    slaTarget: 80,
    slaAchieved: 0,
    slaStatus: 'meeting',
    averageResponseTime: '0 сек',
    autoResolutionRate: 0,
    classificationAccuracy: '0%',
    totalProcessed: 0
  })

  const [complexTickets, setComplexTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTicketId, setEditingTicketId] = useState(null)
  const [editedDraft, setEditedDraft] = useState('')
  
  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date') // 'date', 'priority', 'department'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000) // Обновление каждые 5 секунд
    return () => clearInterval(interval)
  }, [])

  // Фильтрация и сортировка тикетов
  useEffect(() => {
    let filtered = [...complexTickets]

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.message.toLowerCase().includes(query) ||
        ticket.summary?.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query) ||
        ticket.department.toLowerCase().includes(query) ||
        ticket.user?.name?.toLowerCase().includes(query) ||
        ticket.user?.email?.toLowerCase().includes(query) ||
        ticket.id.toString().includes(query)
      )
    }

    // Фильтр по приоритету
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority)
    }

    // Фильтр по отделу
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(ticket => ticket.department === filterDepartment)
    }

    // Фильтр по категории
    if (filterCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filterCategory)
    }

    // Сортировка
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'Высокий': 3, 'Средний': 2, 'Низкий': 1 }
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          break
        case 'department':
          comparison = a.department.localeCompare(b.department)
          break
        case 'date':
        default:
          comparison = new Date(b.createdAt) - new Date(a.createdAt)
          break
      }
      
      return sortOrder === 'asc' ? -comparison : comparison
    })

    setFilteredTickets(filtered)
  }, [complexTickets, searchQuery, filterPriority, filterDepartment, filterCategory, sortBy, sortOrder])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  const loadData = async () => {
    try {
      const headers = getAuthHeaders()

      // Загружаем метрики
      const metricsResponse = await fetch('http://localhost:3000/api/dashboard', {
        headers,
      })
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      } else if (metricsResponse.status === 401) {
        // Неавторизован - перенаправляем на логин
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/admin'
      }

      // Загружаем сложные тикеты
      const ticketsResponse = await fetch('http://localhost:3000/api/tickets/complex', {
        headers,
      })
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setComplexTickets(ticketsData)
      } else if (ticketsResponse.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/admin'
      }

      // Загружаем SLA метрики
      const slaResponse = await fetch('http://localhost:3000/api/monitoring/sla', {
        headers,
      })
      if (slaResponse.ok) {
        const slaData = await slaResponse.json()
        setSlaMetrics(slaData)
      } else if (slaResponse.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/admin'
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditDraft = (ticket) => {
    setEditingTicketId(ticket.id)
    setEditedDraft(ticket.draftResponse || '')
  }

  const handleCancelEdit = () => {
    setEditingTicketId(null)
    setEditedDraft('')
  }

  const handleSaveDraft = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/draft`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ draftResponse: editedDraft }),
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setComplexTickets(prev => 
          prev.map(t => t.id === ticketId ? { ...t, draftResponse: editedDraft } : t)
        )
        setEditingTicketId(null)
        setEditedDraft('')
        alert('Черновик сохранен!')
      } else {
        alert('Ошибка при сохранении черновика')
      }
    } catch (error) {
      console.error('Ошибка сохранения черновика:', error)
      alert('Ошибка при сохранении черновика')
    }
  }

  const handleSendResponse = async (ticket) => {
    if (!confirm('Отправить ответ пользователю и закрыть задачу?')) {
      return
    }

    try {
      // Закрываем тикет (отправляем ответ)
      const response = await fetch(`http://localhost:3000/api/tickets/${ticket.id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        // Удаляем из списка сложных задач
        setComplexTickets(prev => prev.filter(t => t.id !== ticket.id))
        alert('Ответ отправлен, задача закрыта!')
        // Перезагружаем данные
        loadData()
      } else {
        alert('Ошибка при отправке ответа')
      }
    } catch (error) {
      console.error('Ошибка отправки ответа:', error)
      alert('Ошибка при отправке ответа')
    }
  }

  const handleCloseTicket = async (ticketId) => {
    if (!confirm('Закрыть задачу без отправки ответа?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setComplexTickets(prev => prev.filter(t => t.id !== ticketId))
        alert('Задача закрыта!')
        loadData()
      } else {
        alert('Ошибка при закрытии задачи')
      }
    } catch (error) {
      console.error('Ошибка закрытия задачи:', error)
      alert('Ошибка при закрытии задачи')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Высокий':
        return '#ef4444'
      case 'Средний':
        return '#f59e0b'
      case 'Низкий':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📋 Панель оператора</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Удобная обработка сложных заявок с фильтрами и поиском
          </p>
        </div>
        <div className="dashboard-status">
          <span className="status-indicator active"></span>
          <span>Система работает</span>
        </div>
      </div>

      {/* Метрики */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Всего заявок</div>
            <div className="metric-value">{metrics.totalTickets}</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-label">Авторешение</div>
            <div className="metric-value">{metrics.autoSolved}</div>
            <div className="metric-percentage">{metrics.autoSolvedPercent}%</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <div className="metric-label">Сложных задач</div>
            <div className="metric-value">{complexTickets.length}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-label">Среднее время ответа</div>
            <div className="metric-value">{metrics.avgResponseTime}</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">Точность классификации</div>
            <div className="metric-value">{(metrics.classificationAccuracy * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="metric-card error">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-label">Ошибки маршрутизации</div>
            <div className="metric-value">{metrics.routingErrors}</div>
          </div>
        </div>

        <div className={`metric-card ${slaMetrics.slaStatus === 'meeting' ? 'success' : 'warning'}`}>
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">SLA: Цель {slaMetrics.slaTarget}%</div>
            <div className="metric-value">{slaMetrics.slaAchieved}%</div>
            <div className="metric-percentage">
              {slaMetrics.slaStatus === 'meeting' ? '✅ Выполняется' : '⚠️ Ниже цели'}
            </div>
          </div>
        </div>
      </div>

      {/* Панель фильтров и поиска */}
      <div className="dashboard-filters">
        <div className="filters-header">
          <h2>📋 Заявки для обработки</h2>
          <span className="tickets-count">
            Показано: <strong>{filteredTickets.length}</strong> из <strong>{complexTickets.length}</strong>
          </span>
        </div>

        <div className="filters-toolbar">
          {/* Поиск */}
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Поиск по тексту, пользователю, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Фильтры */}
          <div className="filters-group">
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все приоритеты</option>
              <option value="Высокий">Высокий</option>
              <option value="Средний">Средний</option>
              <option value="Низкий">Низкий</option>
            </select>

            <select 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все отделы</option>
              {[...new Set(complexTickets.map(t => t.department))].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все категории</option>
              {[...new Set(complexTickets.map(t => t.category))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={`${sortBy}-${sortOrder}`} 
              onChange={(e) => {
                const [by, order] = e.target.value.split('-')
                setSortBy(by)
                setSortOrder(order)
              }}
              className="filter-select"
            >
              <option value="date-desc">📅 Новые сначала</option>
              <option value="date-asc">📅 Старые сначала</option>
              <option value="priority-desc">🔥 Приоритет: высокий → низкий</option>
              <option value="priority-asc">🔥 Приоритет: низкий → высокий</option>
              <option value="department-asc">🏢 Отдел: А-Я</option>
              <option value="department-desc">🏢 Отдел: Я-А</option>
            </select>

            {(searchQuery || filterPriority !== 'all' || filterDepartment !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterPriority('all')
                  setFilterDepartment('all')
                  setFilterCategory('all')
                }}
                className="btn-clear-filters"
              >
                ✖ Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Список заявок */}
      <div className="dashboard-todos">

        {complexTickets.length === 0 ? (
          <div className="todos-empty">
            <div className="empty-icon">🎉</div>
            <p>Все задачи решены! Нет сложных заявок, требующих участия специалиста.</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="todos-empty">
            <div className="empty-icon">🔍</div>
            <p>По вашим фильтрам ничего не найдено. Попробуйте изменить параметры поиска.</p>
          </div>
        ) : (
          <div className="todos-list">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="todo-card" data-priority={ticket.priority}>
                <div className="todo-header">
                  <div className="todo-id">#{ticket.id}</div>
                  <div className="todo-meta">
                    {ticket.user && (
                      <span className="todo-user">
                        👤 {ticket.user.name || ticket.user.email || 'Пользователь'}
                      </span>
                    )}
                    <span className="todo-category">{ticket.category}</span>
                    <span className="todo-department">{ticket.department}</span>
                    <span
                      className="todo-priority"
                      style={{ color: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="todo-date">
                    {new Date(ticket.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>

                <div className="todo-content">
                  <div className="todo-section">
                    <h4>📄 Текст заявки:</h4>
                    <p className="todo-message">{ticket.message}</p>
                  </div>

                  <div className="todo-section">
                    <h4>📝 Резюме (Summary):</h4>
                    <p className="todo-summary">{ticket.summary || 'Резюме готовится...'}</p>
                  </div>

                  <div className="todo-section">
                    <h4>✍️ Черновик ответа (от ИИ):</h4>
                    {editingTicketId === ticket.id ? (
                      <div className="todo-draft-edit">
                        <textarea
                          value={editedDraft}
                          onChange={(e) => setEditedDraft(e.target.value)}
                          className="draft-textarea"
                          rows="5"
                        />
                        <div className="draft-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSaveDraft(ticket.id)}
                          >
                            Сохранить
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="todo-draft">
                        <p>{ticket.draftResponse || 'Черновик готовится...'}</p>
                        <button
                          className="btn btn-link"
                          onClick={() => handleEditDraft(ticket)}
                        >
                          Редактировать
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="todo-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleSendResponse(ticket)}
                    disabled={!ticket.draftResponse}
                  >
                    ✅ Отправить ответ
                  </button>
                  {editingTicketId !== ticket.id && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditDraft(ticket)}
                    >
                      ✏️ Редактировать
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCloseTicket(ticket.id)}
                  >
                    ❌ Закрыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
