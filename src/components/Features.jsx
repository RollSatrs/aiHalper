import './Features.css'

const Features = ({ language = 'ru' }) => {
  const features = language === 'ru' ? [
    {
      icon: '⚡',
      title: 'Мгновенная поддержка',
      description: 'Получите ответ на свой вопрос за считанные секунды благодаря ИИ-ассистенту'
    },
    {
      icon: '🤖',
      title: 'Умная классификация',
      description: 'Ваши заявки автоматически распределяются по отделам и приоритетам'
    },
    {
      icon: '✅',
      title: 'Автоматическое решение',
      description: 'Типовые проблемы решаются автоматически без участия операторов'
    },
    {
      icon: '📊',
      title: 'Отслеживание статуса',
      description: 'Всегда знайте статус своей заявки и получайте уведомления об ответах'
    }
  ] : [
    {
      icon: '⚡',
      title: 'Леу қолдау',
      description: 'ЖИ-көмекшінің арқасында сәтте-ақ сұрағыңызға жауап алыңыз'
    },
    {
      icon: '🤖',
      title: 'Ақылды жіктеу',
      description: 'Сіздің өтініштеріңіз бөлімдер мен басымдықтар бойынша автоматты түрде бөлінеді'
    },
    {
      icon: '✅',
      title: 'Автоматты шешім',
      description: 'Типтік мәселелер операторлардың қатысуынсыз автоматты түрде шешіледі'
    },
    {
      icon: '📊',
      title: 'Статусты бақылау',
      description: 'Әрдайым өтінішіңіздің статусын біліңіз және жауаптар туралы хабарландырулар алыңыз'
    }
  ]

  return (
    <div className="features-section">
      <div className="features-container">
        <h2 className="features-title">
          {language === 'ru' ? '✨ Почему выбирают нас?' : '✨ Неге бізді таңдайды?'}
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Features

