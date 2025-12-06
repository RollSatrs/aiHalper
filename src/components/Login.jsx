import { useState } from 'react'
import './Login.css'

const Login = ({ onLogin, language = 'ru' }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
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

      // Проверяем, что пользователь - оператор
      if (data.user && data.user.role !== 'operator') {
        throw new Error('Доступ разрешен только операторам')
      }

      // Сохраняем токен и данные пользователя
      localStorage.setItem('authToken', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Вызываем callback для обновления состояния и перенаправления
      if (onLogin) {
        onLogin(data.access_token, data.user)
      }
    } catch (err) {
      setError(err.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🔐 {language === 'ru' ? 'Вход в админ-панель' : 'Админ-панельге кіру'}</h1>
          <p className="login-subtitle">
            {language === 'ru' 
              ? 'Войдите для доступа к панели управления' 
              : 'Басқару панеліне қол жеткізу үшін кіріңіз'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              {language === 'ru' ? 'Email' : 'Электрондық пошта'}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {language === 'ru' ? 'Пароль' : 'Құпия сөз'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading 
              ? (language === 'ru' ? 'Вход...' : 'Кіру...') 
              : (language === 'ru' ? 'Войти' : 'Кіру')
            }
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">
            {language === 'ru' 
              ? '💡 Для демонстрации используйте учетные данные оператора' 
              : '💡 Демонстрация үшін оператордың тіркелгі деректерін пайдаланыңыз'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

