import { useState, useRef, useEffect } from 'react'
import Dashboard from './Dashboard'
import TicketList from './TicketList'
import TicketForm from './TicketForm'
import TicketDetail from './TicketDetail'
import './AIAssistantChat.css'

const AIAssistantChat = ({ isOpen, onClose, language = 'ru', onNavigate }) => {
  const [view, setView] = useState('chat') // chat, dashboard, tickets, create-ticket, ticket-detail
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  
  const getInitialMessage = (lang) => {
    return lang === 'ru' 
      ? 'Здравствуйте! Я ИИ-ассистент службы поддержки Казахтелеком. Чем могу помочь?\n\nВыберите режим:\n💬 Задать вопрос - просто спросить у ИИ (без создания заявки)\n📝 Создать заявку - для решения проблемы (простая решается автоматически, сложная отправляется специалистам)'
      : 'Сәлеметсіз бе! Мен Қазақтелеком қолдау қызметінің ЖИ көмекшісімін. Қалай көмектесе аламын?\n\nРежимді таңдаңыз:\n💬 Сұрақ қою - ЖИ-дан сұрақ (өтінішсіз)\n📝 Өтініш құру - мәселені шешу үшін (қарапайым автошешіледі, күрделі мамандарға жіберіледі)'
  }
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: getInitialMessage(language),
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState(null) // 'question' или 'ticket' или null (автоопределение)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && view === 'chat') {
      inputRef.current?.focus()
    }
  }, [isOpen, view])

  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, view])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = inputValue
    setInputValue('')
    setIsTyping(true)

    const lowerInput = userInput.toLowerCase()

    // Определение действия на основе запроса (специальные команды)
    if (lowerInput.includes('dashboard') || lowerInput.includes('панель') || lowerInput.includes('мониторинг') || lowerInput.includes('метрики') || lowerInput.includes('статистика')) {
      const aiResponse = language === 'ru'
        ? 'Открываю панель мониторинга с метриками и аналитикой...'
        : 'Мониторинг панелін ашуда...'
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }])
        setIsTyping(false)
        setTimeout(() => setView('dashboard'), 500)
      }, 1000)
      return
    } else if (lowerInput.includes('заявк') || lowerInput.includes('тикет') || lowerInput.includes('список') || lowerInput.includes('өтініш')) {
      const aiResponse = language === 'ru'
        ? 'Открываю список заявок...'
        : 'Өтініштер тізімін ашуда...'
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }])
        setIsTyping(false)
        setTimeout(() => setView('tickets'), 500)
      }, 1000)
      return
    } else if (lowerInput.includes('создать') || lowerInput.includes('новая') || lowerInput.includes('новая заявка') || lowerInput.includes('құру')) {
      const aiResponse = language === 'ru'
        ? 'Открываю форму создания заявки...'
        : 'Өтініш құру формасын ашуда...'
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }])
        setIsTyping(false)
        setTimeout(() => setView('create-ticket'), 500)
      }, 1000)
      return
    }

    // Определяем режим работы
    let currentMode = mode

    // Автоопределение режима, если не выбран явно
    if (!currentMode) {
      const questionKeywords = ['как', 'что', 'почему', 'где', 'когда', 'расскажи', 'объясни', 'вопрос', 'спрашиваю', 'қалай', 'негіз', 'анықта']
      const ticketKeywords = ['проблема', 'не работает', 'ошибка', 'помогите', 'решить', 'исправить', 'заявка', 'мәселе', 'жұмыс істемейді', 'қате', 'көмектесіңіз']

      const isQuestion = questionKeywords.some(keyword => lowerInput.includes(keyword))
      const isTicket = ticketKeywords.some(keyword => lowerInput.includes(keyword))

      if (isTicket && !isQuestion) {
        currentMode = 'ticket'
      } else {
        currentMode = 'question' // По умолчанию простой вопрос
      }
    }

    // Для обычных сообщений - отправка в зависимости от режима
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      let response
      let data

      if (currentMode === 'ticket') {
        // Режим создания заявки
        response = await fetch('http://localhost:3000/api/tickets/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        data = await response.json()
        const aiResponse = data.reply || generateAIResponse(userInput)

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }])
      } else {
        // Режим простого вопроса (без создания тикета)
        response = await fetch('http://localhost:3000/ai/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        data = await response.json()
        const aiResponse = data.reply || generateAIResponse(userInput)

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }])
      }

      setIsTyping(false)
      setMode(null) // Сбрасываем режим после использования
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error)
      
      setIsTyping(false)
      
      // Определяем тип ошибки
      let errorMessage = ''
      if (error.name === 'AbortError') {
        errorMessage = language === 'ru'
          ? 'Запрос занял слишком много времени. Попробуйте еще раз или упростите вопрос.'
          : 'Сұрау тым ұзаққа созылды. Қайталап көріңіз немесе сұрақты жеңілдетіңіз.'
      } else {
        errorMessage = language === 'ru'
          ? 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.'
          : 'Кешіріңіз, сұрауыңызды өңдеу кезінде қате орын алды. Қайталап көріңіз.'
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date()
      }])
    }
  }

  const generateAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('интернет') || lowerInput.includes('скорость') || lowerInput.includes('медленно')) {
      return language === 'ru'
        ? 'Понимаю, что у вас проблема с интернетом. Я могу помочь:\n\n1. Проверить статус вашего подключения\n2. Предложить решение типовых проблем\n3. Создать заявку для технической поддержки\n\nОпишите подробнее вашу проблему, и я постараюсь помочь автоматически.'
        : 'Интернетпен мәселеңіз бар екенін түсінемін. Мен көмектесе аламын:\n\n1. Қосылу статусыңызды тексеру\n2. Типтік мәселелерді шешу\n3. Техникалық қолдауға өтініш құру\n\nМәселеңізді егжей-тегжейлі сипаттаңыз, мен автоматты түрде көмектесуге тырысамын.'
    }
    
    if (lowerInput.includes('тариф') || lowerInput.includes('подключить') || lowerInput.includes('услуга')) {
      return language === 'ru'
        ? 'Отлично! Я помогу вам с выбором тарифа. У нас доступны:\n\n• Keremet TV 300 - до 300 Мбит/с + ТВ\n• Bereket - до 500 Мбит/с + ТВ + 2 SIM\n• Интернет 500 - до 500 Мбит/с\n\nКакой тариф вас интересует? Могу создать заявку на подключение.'
        : 'Жақсы! Мен тариф таңдауға көмектесе аламын. Бізде қолжетімді:\n\n• Keremet TV 300 - 300 Мбит/с дейін + ТВ\n• Bereket - 500 Мбит/с дейін + ТВ + 2 SIM\n• Интернет 500 - 500 Мбит/с дейін\n\nҚандай тариф сізді қызықтырады? Қосылуға өтініш құра аламын.'
    }
    
    if (lowerInput.includes('счет') || lowerInput.includes('оплата') || lowerInput.includes('платеж')) {
      return language === 'ru'
        ? 'По вопросам оплаты могу помочь:\n\n1. Проверить баланс вашего лицевого счета\n2. Предоставить информацию о способах оплаты\n3. Помочь с настройкой автоплатежа\n\nНужна ли вам помощь с чем-то конкретным?'
        : 'Төлем мәселелері бойынша көмектесе аламын:\n\n1. Жеке шот балансыңызды тексеру\n2. Төлем әдістері туралы ақпарат беру\n3. Автотөлемді баптауға көмектесу\n\nСізге нақты көмек керек пе?'
    }
    
    if (lowerInput.includes('тв') || lowerInput.includes('телевидение') || lowerInput.includes('канал')) {
      return language === 'ru'
        ? 'По вопросам телевидения могу помочь:\n\n1. Проверить статус услуги\n2. Помочь с настройкой каналов\n3. Предоставить список доступных пакетов\n4. Создать заявку для технической поддержки\n\nЧто именно вас интересует?'
        : 'Теледидар мәселелері бойынша көмектесе аламын:\n\n1. Қызмет статусын тексеру\n2. Арналарды баптауға көмектесу\n3. Қолжетімді пакеттер тізімін беру\n4. Техникалық қолдауға өтініш құру\n\nСізді нақты не қызықтырады?'
    }
    
    return language === 'ru'
      ? 'Спасибо за ваш вопрос! Я проанализировал ваше обращение. Могу:\n\n1. Предложить автоматическое решение\n2. Создать заявку и направить её в соответствующий отдел\n3. Показать панель мониторинга или список заявок\n\nОпишите проблему подробнее, и я постараюсь помочь максимально быстро.'
      : 'Сұрағыңызға рахмет! Мен сіздің хабарламаңызды талдадым. Мен:\n\n1. Автоматты шешім ұсына аламын\n2. Өтініш құрып, оны тиісті бөлімге жібере аламын\n3. Мониторинг панелін немесе өтініштер тізімін көрсете аламын\n\nМәселеңізді егжей-тегжейлі сипаттаңыз, мен мүмкіндігінше жылдам көмектесуге тырысамын.'
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTicketSubmit = async (ticket) => {
    if (onNavigate) {
      onNavigate('handleTicketSubmit', ticket)
    }
    setView('tickets')
  }

  const handleTicketClick = (id) => {
    setSelectedTicketId(id)
    setView('ticket-detail')
  }

  if (!isOpen) return null

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="ai-view-content">
            <button className="ai-back-btn" onClick={() => setView('chat')}>
              ← {language === 'ru' ? 'Назад к чату' : 'Чатқа оралу'}
            </button>
            <Dashboard />
          </div>
        )
      case 'tickets':
        return (
          <div className="ai-view-content">
            <button className="ai-back-btn" onClick={() => setView('chat')}>
              ← {language === 'ru' ? 'Назад к чату' : 'Чатқа оралу'}
            </button>
            <TicketList 
              language={language} 
              onTicketClick={handleTicketClick}
            />
          </div>
        )
      case 'ticket-detail':
        return (
          <div className="ai-view-content">
            <button className="ai-back-btn" onClick={() => setView('tickets')}>
              ← {language === 'ru' ? 'Назад к списку' : 'Тізімге оралу'}
            </button>
            <TicketDetail 
              ticketId={selectedTicketId} 
              language={language} 
              onBack={() => setView('tickets')} 
            />
          </div>
        )
      case 'create-ticket':
        return (
          <div className="ai-view-content">
            <button className="ai-back-btn" onClick={() => setView('chat')}>
              ← {language === 'ru' ? 'Назад к чату' : 'Чатқа оралу'}
            </button>
            <TicketForm 
              onSubmit={handleTicketSubmit} 
              language={language} 
            />
          </div>
        )
      default:
        return (
          <>
            <div className="ai-chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`ai-message ${message.sender === 'user' ? 'user-message' : 'ai-message-item'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="ai-avatar-small">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11C11 9.75 14 10 14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.5 13 10.75 13 13Z" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                  <div className="ai-message-content">
                    <div className="ai-message-text">{message.text}</div>
                    <div className="ai-message-time">
                      {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="ai-message ai-message-item">
                  <div className="ai-avatar-small">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11C11 9.75 14 10 14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.5 13 10.75 13 13Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="ai-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              {!showQuickActions ? (
                <button 
                  className="quick-actions-toggle"
                  onClick={() => setShowQuickActions(true)}
                  title={language === 'ru' ? 'Показать быстрые действия' : 'Жылдам әрекеттерді көрсету'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11C11 9.75 14 10 14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.5 13 10.75 13 13Z" fill="currentColor"/>
                  </svg>
                </button>
              ) : (
                <div className="quick-actions-wrapper">
                  <div className="quick-actions-header">
                    <div className="quick-actions-greeting">
                      <p>{language === 'ru' 
                        ? '💡 Выберите один из вариантов ниже, и я предоставлю вам информацию:'
                        : '💡 Төмендегі нұсқалардың бірін таңдаңыз, мен сізге ақпарат беремін:'}
                      </p>
                    </div>
                    <button 
                      className="quick-actions-close"
                      onClick={() => setShowQuickActions(false)}
                      title={language === 'ru' ? 'Скрыть' : 'Жасыру'}
                    >
                      ×
                    </button>
                  </div>
                  <div className="quick-actions">
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowQuickActions(false)
                      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
                      const autoResolved = tickets.filter(t => t.status === 'auto-resolved').length
                      const total = tickets.length
                      const autoRate = total > 0 ? Math.round((autoResolved / total) * 100) : 0
                      const avgTime = tickets.length > 0
                        ? Math.round(tickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.length)
                        : 0
                      
                      const response = language === 'ru'
                        ? `📊 **Панель мониторинга ИИ Help Desk**\n\n📈 **Метрики:**\n• Всего заявок: ${total}\n• Авторешение: ${autoResolved} (${autoRate}%)\n• В работе: ${tickets.filter(t => t.status === 'in-progress').length}\n• Эскалировано: ${tickets.filter(t => t.escalated).length}\n\n⏱️ **Производительность:**\n• Среднее время ответа: ${avgTime}с\n• Точность классификации: ${total > 0 ? Math.round((tickets.filter(t => t.classificationCorrect !== false).length / tickets.length) * 100) : 100}%\n• Ошибки маршрутизации: ${tickets.filter(t => t.routingError).length}\n\n🎯 **Цель:** 50% авторешение\n📊 **Текущий показатель:** ${autoRate}%\n\n✅ **Статус:** Первая линия полностью автоматизирована (0 FTE)`
                        : `📊 **ЖИ Help Desk мониторинг панелі**\n\n📈 **Метрикалар:**\n• Барлығы өтініштер: ${total}\n• Автоматты шешім: ${autoResolved} (${autoRate}%)\n• Жұмыс істеп жатыр: ${tickets.filter(t => t.status === 'in-progress').length}\n• Эскалацияланған: ${tickets.filter(t => t.escalated).length}\n\n⏱️ **Өнімділік:**\n• Орташа жауап уақыты: ${avgTime}с\n• Классификация дәлдігі: ${total > 0 ? Math.round((tickets.filter(t => t.classificationCorrect !== false).length / tickets.length) * 100) : 100}%\n• Маршрутизация қателері: ${tickets.filter(t => t.routingError).length}\n\n🎯 **Мақсат:** 50% автоматты шешім\n📊 **Ағымдағы көрсеткіш:** ${autoRate}%\n\n✅ **Статус:** Бірінші желі толығымен автоматтандырылған (0 FTE)`
                      
                      setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: language === 'ru' ? 'Показать панель мониторинга' : 'Мониторинг панелін көрсету',
                        sender: 'user',
                        timestamp: new Date()
                      }, {
                        id: Date.now() + 1,
                        text: response,
                        sender: 'ai',
                        timestamp: new Date()
                      }])
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                    </svg>
                    <span>{language === 'ru' ? 'Показать панель мониторинга' : 'Мониторинг панелін көрсету'}</span>
                  </button>
                  
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowQuickActions(false)
                      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
                      const recentTickets = tickets.slice(0, 5)
                      
                      let ticketsList = ''
                      if (recentTickets.length === 0) {
                        ticketsList = language === 'ru' ? 'Нет заявок' : 'Өтініштер жоқ'
                      } else {
                        ticketsList = recentTickets.map(t => {
                          const status = t.status === 'auto-resolved' 
                            ? (language === 'ru' ? '✅ Авторешение' : '✅ Автоматты')
                            : t.status === 'in-progress'
                            ? (language === 'ru' ? '⚙️ В работе' : '⚙️ Жұмыс істеп жатыр')
                            : t.status === 'escalated'
                            ? (language === 'ru' ? '⬆️ Эскалировано' : '⬆️ Эскалацияланған')
                            : (language === 'ru' ? '🆕 Новая' : '🆕 Жаңа')
                          return `#${t.id} - ${t.subject || (language === 'ru' ? 'Без темы' : 'Тақырыпсыз')} ${status}`
                        }).join('\n')
                      }
                      
                      const response = language === 'ru'
                        ? `📋 **Список заявок**\n\n**Всего заявок:** ${tickets.length}\n• Авторешение: ${tickets.filter(t => t.status === 'auto-resolved').length}\n• В работе: ${tickets.filter(t => t.status === 'in-progress').length}\n• Эскалировано: ${tickets.filter(t => t.escalated).length}\n\n**Последние заявки:**\n${ticketsList}\n\n💡 Хотите создать новую заявку? Просто опишите проблему!`
                        : `📋 **Өтініштер тізімі**\n\n**Барлығы өтініштер:** ${tickets.length}\n• Автоматты шешім: ${tickets.filter(t => t.status === 'auto-resolved').length}\n• Жұмыс істеп жатыр: ${tickets.filter(t => t.status === 'in-progress').length}\n• Эскалацияланған: ${tickets.filter(t => t.escalated).length}\n\n**Соңғы өтініштер:**\n${ticketsList}\n\n💡 Жаңа өтініш құрғыңыз келе ме? Мәселені сипаттаңыз!`
                      
                      setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: language === 'ru' ? 'Показать список заявок' : 'Өтініштер тізімін көрсету',
                        sender: 'user',
                        timestamp: new Date()
                      }, {
                        id: Date.now() + 1,
                        text: response,
                        sender: 'ai',
                        timestamp: new Date()
                      }])
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                    <span>{language === 'ru' ? 'Список заявок' : 'Өтініштер тізімі'}</span>
                  </button>
                  
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowQuickActions(false)
                      const response = language === 'ru'
                        ? `📝 **Создание заявки**\n\nДля создания заявки опишите вашу проблему в чате. Я автоматически:\n\n✅ Определю категорию проблемы\n✅ Назначу приоритет\n✅ Направлю в нужный отдел\n✅ Попытаюсь решить автоматически (если возможно)\n\n**Примеры запросов:**\n• "Интернет работает медленно"\n• "Хочу подключить тариф Bereket"\n• "Не работает телевидение"\n• "Вопрос по оплате"\n\nПросто опишите проблему, и я помогу!`
                        : `📝 **Өтініш құру**\n\nӨтініш құру үшін мәселеңізді чатта сипаттаңыз. Мен автоматты түрде:\n\n✅ Мәселе категориясын анықтаймын\n✅ Басымдықты тағайындаймын\n✅ Тиісті бөлімге жіберемін\n✅ Автоматты түрде шешуге тырысамын (мүмкін болса)\n\n**Сұрау мысалдары:**\n• "Интернет баяу жұмыс істейді"\n• "Bereket тарифін қосуға келедім"\n• "Теледидар жұмыс істемейді"\n• "Төлем бойынша сұрақ"\n\nМәселені сипаттаңыз, мен көмектесемін!`
                      
                      setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: language === 'ru' ? 'Как создать заявку?' : 'Өтініш қалай құруға болады?',
                        sender: 'user',
                        timestamp: new Date()
                      }, {
                        id: Date.now() + 1,
                        text: response,
                        sender: 'ai',
                        timestamp: new Date()
                      }])
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                    </svg>
                    <span>{language === 'ru' ? 'Как создать заявку?' : 'Өтініш қалай құруға болады?'}</span>
                  </button>
                </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-container">
              {mode && (
                <div className="mode-indicator">
                  {mode === 'question' 
                    ? (language === 'ru' ? '💬 Режим: Простой вопрос' : '💬 Режим: Қарапайым сұрақ')
                    : (language === 'ru' ? '📝 Режим: Создание заявки' : '📝 Режим: Өтініш құру')
                  }
                  <button 
                    className="mode-clear"
                    onClick={() => setMode(null)}
                    title={language === 'ru' ? 'Сбросить режим' : 'Режимді тазалау'}
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="mode-selector">
                <button
                  className={`mode-btn ${mode === 'question' ? 'active' : ''}`}
                  onClick={() => setMode('question')}
                  title={language === 'ru' ? 'Просто спросить у ИИ (без создания заявки)' : 'ЖИ-дан сұрау (өтінішсіз)'}
                >
                  💬 {language === 'ru' ? 'Задать вопрос' : 'Сұрақ қою'}
                </button>
                <button
                  className={`mode-btn ${mode === 'ticket' ? 'active' : ''}`}
                  onClick={() => setMode('ticket')}
                  title={language === 'ru' ? 'Создать заявку (простая решается автоматически)' : 'Өтініш құру (қарапайым автошешіледі)'}
                >
                  📝 {language === 'ru' ? 'Создать заявку' : 'Өтініш құру'}
                </button>
              </div>

              <div className="ai-chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  className="ai-chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    mode === 'question' 
                      ? (language === 'ru' ? 'Задайте вопрос ИИ...' : 'ЖИ-ға сұрақ қойыңыз...')
                      : mode === 'ticket'
                      ? (language === 'ru' ? 'Опишите проблему для создания заявки...' : 'Өтініш құру үшін мәселені сипаттаңыз...')
                      : (language === 'ru' ? 'Напишите ваш вопрос...' : 'Сұрағыңызды жазыңыз...')
                  }
                  rows={1}
                />
                <button
                  className="ai-chat-send"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="ai-chat-overlay" onClick={onClose}>
      <div className="ai-chat-container" onClick={(e) => e.stopPropagation()}>
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11C11 9.75 14 10 14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.5 13 10.75 13 13Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3>ИИ-ассистент поддержки</h3>
              <span className="ai-status">
                {view === 'chat' ? 'В сети' : 
                 view === 'dashboard' ? 'Панель мониторинга' :
                 view === 'tickets' ? 'Список заявок' :
                 view === 'create-ticket' ? 'Создание заявки' :
                 'Просмотр заявки'}
              </span>
            </div>
          </div>
          <button className="ai-chat-close" onClick={onClose}>×</button>
        </div>

        {renderView()}
      </div>
    </div>
  )
}

export default AIAssistantChat
