import { useState } from 'react'
import './ClientLogin.css'

const ClientLogin = ({ onClose, onSuccess, language = 'ru' }) => {
  const [isLogin, setIsLogin] = useState(true) // true = login, false = register
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Логин
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка входа')
        }

        // Сохраняем токен и данные пользователя
        localStorage.setItem('authToken', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (onSuccess) {
          onSuccess(data.user, data.access_token)
        }
      } else {
        // Регистрация
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка регистрации')
        }

        // Сохраняем токен и данные пользователя
        localStorage.setItem('authToken', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (onSuccess) {
          onSuccess(data.user, data.access_token)
        }
      }

      // Закрываем модальное окно
      if (onClose) {
        onClose()
      }
    } catch (error) {
      setError(error.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="client-login-overlay" onClick={onClose}>
      <div className="client-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="client-login-close" onClick={onClose}>×</button>
        
        <div className="client-login-header">
          <h2>
            {isLogin 
              ? (language === 'ru' ? '🔐 Вход' : '🔐 Кіру')
              : (language === 'ru' ? '✨ Регистрация' : '✨ Тіркелу')
            }
          </h2>
          <p className="client-login-subtitle">
            {isLogin 
              ? (language === 'ru' ? 'Войдите, чтобы отслеживать свои заявки' : 'Өтініштерді бақылау үшін кіріңіз')
              : (language === 'ru' ? 'Создайте аккаунт для отслеживания заявок' : 'Өтініштерді бақылау үшін аккаунт құрыңыз')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="client-login-form">
          {!isLogin && (
            <div className="form-group">
              <label>
                {language === 'ru' ? 'Имя' : 'Аты'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              {language === 'ru' ? 'Email' : 'Электрондық пошта'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>
              {language === 'ru' ? 'Пароль' : 'Құпия сөз'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="client-login-error">
              {error}
            </div>
          )}

          <button type="submit" className="client-login-button" disabled={loading}>
            {loading 
              ? (language === 'ru' ? 'Загрузка...' : 'Жүктелуде...')
              : (isLogin 
                  ? (language === 'ru' ? 'Войти' : 'Кіру')
                  : (language === 'ru' ? 'Зарегистрироваться' : 'Тіркелу')
                )
            }
          </button>

          <div className="client-login-footer">
            <button
              type="button"
              className="client-login-toggle"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setName('')
                setEmail('')
                setPassword('')
              }}
            >
              {isLogin
                ? (language === 'ru' ? 'Нет аккаунта? Зарегистрироваться' : 'Аккаунт жоқ па? Тіркелу')
                : (language === 'ru' ? 'Уже есть аккаунт? Войти' : 'Аккаунт бар ма? Кіру')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientLogin

