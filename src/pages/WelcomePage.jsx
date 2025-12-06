import { useState } from 'react'
import Hero from '../components/Hero'
import RoleSelection from '../components/RoleSelection'
import FAQ from '../components/FAQ'
import Features from '../components/Features'
import Tariffs from '../components/Tariffs'
import './WelcomePage.css'

const WelcomePage = ({ language = 'ru', onRoleSelected }) => {
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  const handleLoginClick = () => {
    setShowRoleSelection(true)
  }

  const handleConnectClick = () => {
    // Можно открыть модальное окно подключения или оставить пустым
  }

  return (
    <div className="welcome-page">
      <Hero 
        language={language}
        onAIClick={handleLoginClick}
        showLoginButton={true}
      />

      <Features language={language} />

      <FAQ language={language} />

      <Tariffs onConnectClick={handleConnectClick} language={language} />

      {showRoleSelection && (
        <RoleSelection
          language={language}
          onClose={() => setShowRoleSelection(false)}
          onRoleSelected={onRoleSelected}
        />
      )}
    </div>
  )
}

export default WelcomePage

