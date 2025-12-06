import { useState } from 'react'
import ClientLogin from './ClientLogin'
import Login from './Login'
import './RoleSelection.css'

const RoleSelection = ({ language = 'ru', onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(null) // 'client' или 'operator'

  // Если роль выбрана, показываем соответствующую форму логина
  if (selectedRole === 'client') {
    return (
      <ClientLogin
        language={language}
        onClose={() => {
          setSelectedRole(null)
          if (onClose) onClose()
        }}
        onSuccess={(user, token) => {
          if (onRoleSelected) {
            onRoleSelected('client', user, token)
          }
        }}
      />
    )
  }

  if (selectedRole === 'operator') {
    return (
      <div className="role-selection-overlay" onClick={() => {
        setSelectedRole(null)
        if (onClose) onClose()
      }}>
        <div className="role-selection-modal login-modal-wrapper" onClick={(e) => e.stopPropagation()}>
          <button 
            className="role-selection-close" 
            onClick={() => {
              setSelectedRole(null)
              if (onClose) onClose()
            }}
          >
            ×
          </button>
          <Login
            language={language}
            onLogin={(token, user) => {
              // Закрываем модальное окно выбора роли
              setSelectedRole(null)
              if (onClose) onClose()
              // Вызываем колбэк для перенаправления
              if (onRoleSelected) {
                onRoleSelected('operator', user, token)
              }
            }}
          />
        </div>
      </div>
    )
  }

  // Если onClose не передан, это означает что мы на странице логина оператора
  // Показываем выбор роли как модальное окно

  return (
    <div className="role-selection-overlay" onClick={onClose}>
      <div className="role-selection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="role-selection-close" onClick={onClose}>×</button>
        
        <div className="role-selection-header">
          <h2>
            {language === 'ru' ? '👋 Выберите роль' : '👋 Рөлді таңдаңыз'}
          </h2>
          <p className="role-selection-subtitle">
            {language === 'ru' 
              ? 'Выберите, как вы хотите войти в систему'
              : 'Жүйеге қалай кіруді таңдаңыз'
            }
          </p>
        </div>

        <div className="role-selection-cards">
          <button
            className="role-card client-card"
            onClick={() => setSelectedRole('client')}
          >
            <div className="role-card-icon">👤</div>
            <h3>{language === 'ru' ? 'Обычный клиент' : 'Қарапайым клиент'}</h3>
            <p>
              {language === 'ru' 
                ? 'Войдите как клиент для создания заявок и отслеживания статуса'
                : 'Өтініштер құру және статусты бақылау үшін клиент ретінде кіріңіз'
              }
            </p>
            <div className="role-card-arrow">→</div>
          </button>

          <button
            className="role-card operator-card"
            onClick={() => setSelectedRole('operator')}
          >
            <div className="role-card-icon">👨‍💼</div>
            <h3>{language === 'ru' ? 'Оператор' : 'Оператор'}</h3>
            <p>
              {language === 'ru' 
                ? 'Войдите как оператор для обработки заявок в админ-панели'
                : 'Админ-панельде өтініштерді өңдеу үшін оператор ретінде кіріңіз'
              }
            </p>
            <div className="role-card-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection

