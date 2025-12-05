import { translations } from '../utils/translations'
import './Hero.css'

const Hero = ({ onConnectClick, language = 'ru', onAIClick }) => {
  const t = translations[language]?.hero || translations.ru.hero
  
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            {t.title}
          </h1>
          <button className="hero-connect-btn" onClick={onAIClick || onConnectClick}>
            {t.connectBtn}
          </button>
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

