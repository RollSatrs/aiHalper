import { translations } from '../utils/translations'
import './Hero.css'

const Hero = ({ onConnectClick, language = 'ru', onAIClick, showLoginButton = false }) => {
  const t = translations[language]?.hero || translations.ru.hero
  
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            {language === 'ru' 
              ? 'Общайтесь с ИИ-агентом, дабы ответить на все ваши вопросы и помочь с решением ваших проблем!'
              : 'Барлық сұрақтарыңызға жауап беру және мәселелеріңізді шешуге көмектесу үшін ЖИ-агентпен байланысыңыз!'
            }
          </h1>
          {showLoginButton ? (
            <button className="hero-connect-btn" onClick={onAIClick || onConnectClick}>
              {language === 'ru' ? 'Войти' : 'Кіру'}
            </button>
          ) : (
            <button className="hero-connect-btn" onClick={onAIClick || onConnectClick}>
              {language === 'ru' ? 'ИИ-ассистент' : 'ЖИ-ассистент'}
            </button>
          )}
        </div>
        <div className="hero-visual">
          <img 
            src="/Familykazaktelecom.png" 
            alt="Семья с интернетом Казахтелеком" 
            className="hero-family-image"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero

