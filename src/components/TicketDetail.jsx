import { useState, useEffect } from 'react'
import './TicketDetail.css'

const TicketDetail = ({ ticketId, language = 'ru', onBack }) => {
  const [ticket, setTicket] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = () => {
    if (!ticketId) return
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
    const found = tickets.find(t => t.id === parseInt(ticketId))
    if (found) {
      setTicket(found)
      generateAISuggestions(found)
    }
  }

  const generateAISuggestions = (ticket) => {
    // Имитация генерации подсказок ИИ
    const suggestions = {
      summary: language === 'ru' 
        ? `Проблема: ${ticket.description.substring(0, 100)}...\n\nИИ определил категорию: ${ticket.classification?.category || 'Техническая поддержка'}\nПриоритет: ${ticket.priority || 'Средний'}\nОтдел: ${ticket.classification?.department || 'Общий отдел'}`
        : `Мәселе: ${ticket.description.substring(0, 100)}...\n\nЖИ категорияны анықтады: ${ticket.classification?.category || 'Техникалық қолдау'}\nБасымдық: ${ticket.priority || 'Орташа'}\nБөлім: ${ticket.classification?.department || 'Жалпы бөлім'}`,
      
      draftResponse: language === 'ru'
        ? `Здравствуйте, ${ticket.name}!\n\nСпасибо за обращение. Мы рассмотрели вашу заявку и готовы помочь.\n\n${ticket.autoResolved ? 'Ваша проблема была автоматически решена нашей системой ИИ.' : 'Ваша заявка была направлена в соответствующий отдел для решения.'}\n\nЕсли у вас возникнут дополнительные вопросы, пожалуйста, свяжитесь с нами.\n\nС уважением,\nСлужба поддержки Казахтелеком`
        : `Сәлеметсіз бе, ${ticket.name}!\n\nХабарламаңызға рахмет. Біз сіздің өтінішіңізді қарастырдық және көмектесуге дайынбыз.\n\n${ticket.autoResolved ? 'Сіздің мәселеңіз біздің ЖИ жүйесі арқылы автоматты түрде шешілді.' : 'Сіздің өтінішіңіз шешу үшін тиісті бөлімге жіберілді.'}\n\nҚосымша сұрақтарыңыз болса, бізбен хабарласыңыз.\n\nҚұрметпен,\nҚазақтелеком қолдау қызметі`,
      
      confidence: ticket.classification?.confidence || 85,
      canAutoResolve: ticket.description.length < 200 && !ticket.escalated
    }

    setAiSuggestions(suggestions)
  }

  const handleAutoResolve = () => {
    if (!ticket) return

    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
    const updated = tickets.map(t => 
      t.id === ticket.id 
        ? { ...t, status: 'auto-resolved', autoResolved: true, resolvedAt: new Date().toISOString() }
        : t
    )
    localStorage.setItem('tickets', JSON.stringify(updated))
    loadTicket()
    alert(language === 'ru' ? 'Заявка автоматически решена!' : 'Өтініш автоматты түрде шешілді!')
  }

  const handleEscalate = () => {
    if (!ticket) return

    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
    const updated = tickets.map(t => 
      t.id === ticket.id 
        ? { ...t, escalated: true, status: 'escalated', escalatedAt: new Date().toISOString() }
        : t
    )
    localStorage.setItem('tickets', JSON.stringify(updated))
    loadTicket()
    alert(language === 'ru' ? 'Заявка эскалирована!' : 'Өтініш эскалацияланды!')
  }

  const translateText = (text, targetLang) => {
    // Имитация перевода
    return language === 'ru' 
      ? `[Переведено на казахский] ${text}`
      : `[Қазақ тіліне аударылған] ${text}`
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-container">
        <button className="back-button" onClick={onBack || (() => {})}>
          ← {language === 'ru' ? 'Назад к списку' : 'Тізімге оралу'}
        </button>
        <div className="error-state">
          <h2>{language === 'ru' ? 'Заявка не найдена' : 'Өтініш табылмады'}</h2>
          <p>{language === 'ru' ? 'Заявка с таким ID не существует' : 'Осындай ID бар өтініш жоқ'}</p>
          <button className="action-btn" onClick={onBack || (() => {})}>
            {language === 'ru' ? 'Вернуться к списку' : 'Тізімге оралу'}
          </button>
        </div>
      </div>
    )
  }

  const statusColors = {
    'new': '#3b82f6',
    'auto-resolved': '#10b981',
    'in-progress': '#f59e0b',
    'escalated': '#ef4444',
    'resolved': '#6b7280'
  }

  return (
    <div className="ticket-detail-container">
      <button className="back-button" onClick={onBack || (() => {})}>
        ← {language === 'ru' ? 'Назад к списку' : 'Тізімге оралу'}
      </button>

      <div className="ticket-detail">
        <div className="ticket-main">
          <div className="ticket-header-detail">
            <div>
              <h1>#{ticket.id} - {ticket.subject || (language === 'ru' ? 'Без темы' : 'Тақырыпсыз')}</h1>
              <div className="ticket-meta-detail">
                <span>{ticket.name}</span>
                <span>•</span>
                <span>{new Date(ticket.createdAt).toLocaleString('ru-RU')}</span>
                {ticket.source && <span>•</span>}
                {ticket.source && <span>{ticket.source}</span>}
              </div>
            </div>
            <div className="ticket-status-large" style={{ backgroundColor: statusColors[ticket.status] }}>
              {ticket.status === 'auto-resolved' 
                ? (language === 'ru' ? 'Авторешение' : 'Автоматты шешім')
                : ticket.status === 'escalated'
                ? (language === 'ru' ? 'Эскалировано' : 'Эскалацияланған')
                : ticket.status}
            </div>
          </div>

          <div className="ticket-description-detail">
            <h3>{language === 'ru' ? 'Описание проблемы' : 'Мәселенің сипаттамасы'}</h3>
            <p>{ticket.description}</p>
          </div>

          {ticket.classification && (
            <div className="ticket-classification-detail">
              <h3>🤖 {language === 'ru' ? 'Автоматическая классификация ИИ' : 'ЖИ автоматты классификациясы'}</h3>
              <div className="classification-grid">
                <div className="classification-item-detail">
                  <span className="label">{language === 'ru' ? 'Категория' : 'Категория'}:</span>
                  <span className="value">{ticket.classification.category}</span>
                </div>
                <div className="classification-item-detail">
                  <span className="label">{language === 'ru' ? 'Тип проблемы' : 'Мәселе түрі'}:</span>
                  <span className="value">{ticket.classification.type || 'Общий'}</span>
                </div>
                <div className="classification-item-detail">
                  <span className="label">{language === 'ru' ? 'Отдел' : 'Бөлім'}:</span>
                  <span className="value">{ticket.classification.department}</span>
                </div>
                <div className="classification-item-detail">
                  <span className="label">{language === 'ru' ? 'Приоритет' : 'Басымдық'}:</span>
                  <span className="value">{ticket.priority || 'Средний'}</span>
                </div>
                {ticket.classification.confidence && (
                  <div className="classification-item-detail">
                    <span className="label">{language === 'ru' ? 'Уверенность ИИ' : 'ЖИ сенімділігі'}:</span>
                    <span className="value">{ticket.classification.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {ticket.autoResolved && (
            <div className="auto-resolve-banner">
              <span>✅</span>
              <div>
                <strong>{language === 'ru' ? 'Заявка автоматически решена ИИ' : 'Өтініш ЖИ арқылы автоматты түрде шешілді'}</strong>
                <p>{language === 'ru' ? 'Проблема была решена без участия оператора' : 'Мәселе оператор қатысуынсыз шешілді'}</p>
              </div>
            </div>
          )}

          {ticket.escalated && (
            <div className="escalation-banner">
              <span>⬆️</span>
              <div>
                <strong>{language === 'ru' ? 'Заявка эскалирована' : 'Өтініш эскалацияланды'}</strong>
                <p>{language === 'ru' ? 'Направлена в профильный отдел' : 'Профильді бөлімге жіберілді'}</p>
              </div>
            </div>
          )}
        </div>

        {aiSuggestions && (
          <div className="ai-suggestions-panel">
            <h3>💡 {language === 'ru' ? 'Подсказки ИИ для оператора' : 'Оператор үшін ЖИ кеңестері'}</h3>

            <div className="suggestion-section">
              <h4>{language === 'ru' ? 'Краткое резюме' : 'Қысқаша мазмұны'}</h4>
              <div className="suggestion-content">
                <pre>{aiSuggestions.summary}</pre>
                <button 
                  className="translate-btn"
                  onClick={() => {
                    const translated = translateText(aiSuggestions.summary, language === 'ru' ? 'kz' : 'ru')
                    alert(translated)
                  }}
                >
                  {language === 'ru' ? 'Перевести на казахский' : 'Орыс тіліне аудару'}
                </button>
              </div>
            </div>

            <div className="suggestion-section">
              <h4>{language === 'ru' ? 'Черновик ответа' : 'Жауап жобасы'}</h4>
              <div className="suggestion-content">
                <textarea 
                  readOnly 
                  value={aiSuggestions.draftResponse}
                  rows={8}
                  className="draft-textarea"
                />
                <div className="suggestion-actions">
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestions.draftResponse)
                      alert(language === 'ru' ? 'Скопировано!' : 'Көшірілді!')
                    }}
                  >
                    {language === 'ru' ? 'Копировать' : 'Көшіру'}
                  </button>
                  <button 
                    className="translate-btn"
                    onClick={() => {
                      const translated = translateText(aiSuggestions.draftResponse, language === 'ru' ? 'kz' : 'ru')
                      alert(translated)
                    }}
                  >
                    {language === 'ru' ? 'Перевести' : 'Аудару'}
                  </button>
                </div>
              </div>
            </div>

            <div className="suggestion-section">
              <h4>{language === 'ru' ? 'Рекомендации' : 'Ұсыныстар'}</h4>
              <div className="recommendations">
                {aiSuggestions.confidence < 70 && (
                  <div className="recommendation warning">
                    ⚠️ {language === 'ru' 
                      ? 'Низкая уверенность классификации. Рекомендуется эскалация.'
                      : 'Классификацияның төмен сенімділігі. Эскалация ұсынылады.'}
                  </div>
                )}
                {aiSuggestions.canAutoResolve && !ticket.autoResolved && (
                  <div className="recommendation success">
                    ✅ {language === 'ru' 
                      ? 'Можно автоматически решить'
                      : 'Автоматты түрде шешуге болады'}
                  </div>
                )}
                {ticket.priority === 'high' && (
                  <div className="recommendation error">
                    🔴 {language === 'ru' 
                      ? 'Высокий приоритет. Требуется быстрое решение.'
                      : 'Жоғары басымдық. Жылдам шешім қажет.'}
                  </div>
                )}
              </div>
            </div>

            <div className="suggestion-actions-main">
              {aiSuggestions.canAutoResolve && !ticket.autoResolved && (
                <button className="action-btn auto-resolve-btn" onClick={handleAutoResolve}>
                  ✅ {language === 'ru' ? 'Автоматически решить' : 'Автоматты түрде шешу'}
                </button>
              )}
              {!ticket.escalated && (
                <button className="action-btn escalate-btn" onClick={handleEscalate}>
                  ⬆️ {language === 'ru' ? 'Эскалировать' : 'Эскалациялау'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketDetail

