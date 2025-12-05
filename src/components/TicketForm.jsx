import { useState } from 'react'
import './TicketForm.css'

const TicketForm = ({ onSubmit, language = 'ru' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
    source: 'web'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const texts = {
    ru: {
      title: 'Создать заявку',
      subtitle: 'Единая точка входа для всех обращений',
      name: 'Ваше имя',
      email: 'Email',
      phone: 'Телефон',
      subject: 'Тема обращения',
      description: 'Опишите проблему',
      submit: 'Отправить заявку',
      submitting: 'Отправка...',
      required: 'Обязательное поле',
      success: 'Заявка успешно создана!'
    },
    kz: {
      title: 'Өтініш құру',
      subtitle: 'Барлық сұраулар үшін біртұтас кіру нүктесі',
      name: 'Атыңыз',
      email: 'Email',
      phone: 'Телефон',
      subject: 'Сұрау тақырыбы',
      description: 'Мәселені сипаттаңыз',
      submit: 'Өтініш жіберу',
      submitting: 'Жіберілуде...',
      required: 'Міндетті өріс',
      success: 'Өтініш сәтті құрылды!'
    }
  }

  const t = texts[language]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Валидация
    if (!formData.name.trim() || !formData.description.trim()) {
      setError(t.required)
      return
    }

    setIsSubmitting(true)

    try {
      // Имитация отправки заявки
      const ticket = {
        id: Date.now(),
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString(),
        language: language,
        // ИИ автоматически классифицирует
        classification: null,
        priority: null,
        department: null,
        autoResolved: false,
        escalated: false
      }

      // Сохраняем в localStorage (в реальном приложении - API)
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
      tickets.unshift(ticket)
      localStorage.setItem('tickets', JSON.stringify(tickets))

      // Вызываем callback для автоматической классификации
      if (onSubmit) {
        await onSubmit(ticket)
      }

      // Очистка формы
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        description: '',
        source: 'web'
      })

      alert(t.success)
    } catch (err) {
      setError('Ошибка при создании заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ticket-form-container">
      <div className="ticket-form">
        <div className="form-header">
          <h2>{t.title}</h2>
          <p className="form-subtitle">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t.name} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t.name}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.email}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">{t.phone}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t.subject}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t.subject}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t.description} *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder={language === 'ru' 
                ? 'Опишите вашу проблему подробно. ИИ автоматически определит категорию и направит заявку в нужный отдел.'
                : 'Мәселеңізді егжей-тегжейлі сипаттаңыз. ЖИ автоматты түрде категорияны анықтап, өтінішті қажетті бөлімге жібереді.'
              }
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="form-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TicketForm

