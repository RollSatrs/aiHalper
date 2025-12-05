import { translations } from '../utils/translations'
import './TariffCard.css'

const TariffCard = ({ tariff, onConnectClick, language = 'ru' }) => {
  const t = translations[language]?.tariffs || translations.ru.tariffs
  
  return (
    <div className="tariff-card">
      <div className="tariff-header">
        <h3 className="tariff-name">{tariff.name}</h3>
        {tariff.badge && (
          <div className="tariff-badge">
            {tariff.badge.icon && <span>{tariff.badge.icon}</span>}
            <span>{tariff.badge.text}</span>
          </div>
        )}
      </div>
      <div className="tariff-content">
        {tariff.features.map((feature, index) => (
          <div key={index} className="tariff-feature">
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-info">
              <div className="feature-title">{feature.title}</div>
              {feature.description && (
                <div className="feature-description">{feature.description}</div>
              )}
              {feature.logo && (
                <div className="feature-logo">{feature.logo}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="tariff-connect-btn" onClick={() => onConnectClick(tariff)}>
        {t.connect}
      </button>
    </div>
  )
}

export default TariffCard

