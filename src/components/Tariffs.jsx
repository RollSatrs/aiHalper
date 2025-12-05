import TariffCard from './TariffCard'
import { translations } from '../utils/translations'
import './Tariffs.css'

const Tariffs = ({ onConnectClick, language = 'ru' }) => {
  const t = translations[language]?.tariffs || translations.ru.tariffs
  
  const tariffs = [
    {
      name: t.keremet.name,
      features: [
        {
          icon: '📶',
          title: t.keremet.internet,
          description: t.keremet.speed300
        },
        {
          icon: '📺',
          title: t.keremet.tv,
          logo: 'TV+'
        }
      ]
    },
    {
      name: t.bereket.name,
      badge: {
        icon: '🔥',
        text: t.bereket.badge
      },
      features: [
        {
          icon: '📶',
          title: t.bereket.internet,
          description: t.bereket.speed500
        },
        {
          icon: '📺',
          title: t.bereket.tv,
          logo: 'TV+'
        }
      ]
    },
    {
      name: t.internet500.name,
      features: [
        {
          icon: '📶',
          title: t.internet500.internet,
          description: t.internet500.speed500
        }
      ]
    }
  ]

  return (
    <section className="tariffs">
      <div className="tariffs-container">
        <div className="tariffs-grid">
          {tariffs.map((tariff, index) => (
            <TariffCard
              key={index}
              tariff={tariff}
              onConnectClick={onConnectClick}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Tariffs

