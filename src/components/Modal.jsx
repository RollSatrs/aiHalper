import { useState } from 'react'
import { translations } from '../utils/translations'
import './Modal.css'

const Modal = ({ isOpen, onClose, tariff, language = 'ru' }) => {
  const t = translations[language]?.modal || translations.ru.modal
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // Здесь можно добавить логику отправки формы
    console.log('Form submitted:', formData, tariff)
    const successMsg = language === 'ru' 
      ? 'Спасибо! Мы свяжемся с вами в ближайшее время.'
      : language === 'kz'
      ? 'Рақмет! Біз сізбен жақын арада байланысамыз.'
      : 'Thank you! We will contact you soon.'
    alert(successMsg)
    onClose()
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{t.title}</h2>
        {tariff && (
          <p className="modal-tariff">{t.tariff}: <strong>{tariff.name}</strong></p>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">{t.name}</label>
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
            <label htmlFor="phone">{t.phone}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">{t.address}</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder={t.address}
            />
          </div>
          <button type="submit" className="form-submit-btn">
            {t.submit}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Modal

