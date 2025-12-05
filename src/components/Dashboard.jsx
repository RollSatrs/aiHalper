import { useState, useEffect } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    autoResolved: 0,
    inProgress: 0,
    escalated: 0,
    avgResponseTime: 0,
    classificationAccuracy: 0,
    autoResolveRate: 0,
    routingErrors: 0
  })

  useEffect(() => {
    // Имитация загрузки данных
    const loadMetrics = () => {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
      const autoResolved = tickets.filter(t => t.status === 'auto-resolved').length
      const inProgress = tickets.filter(t => t.status === 'in-progress').length
      const escalated = tickets.filter(t => t.escalated).length
      const total = tickets.length
      
      const avgTime = tickets.length > 0
        ? Math.round(tickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.length)
        : 0

      const accuracy = tickets.length > 0
        ? Math.round((tickets.filter(t => t.classificationCorrect !== false).length / tickets.length) * 100)
        : 100

      const autoRate = total > 0 ? Math.round((autoResolved / total) * 100) : 0
      const errors = tickets.filter(t => t.routingError).length

      setMetrics({
        totalTickets: total,
        autoResolved,
        inProgress,
        escalated,
        avgResponseTime: avgTime,
        classificationAccuracy: accuracy,
        autoResolveRate: autoRate,
        routingErrors: errors
      })
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const chartData = [
    { label: 'Авторешение', value: metrics.autoResolved, color: '#10b981' },
    { label: 'В работе', value: metrics.inProgress, color: '#3b82f6' },
    { label: 'Эскалировано', value: metrics.escalated, color: '#f59e0b' }
  ]

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Панель мониторинга ИИ Help Desk</h1>
        <div className="dashboard-status">
          <span className="status-indicator active"></span>
          <span>Система работает</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Всего заявок</div>
            <div className="metric-value">{metrics.totalTickets}</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-label">Авторешение</div>
            <div className="metric-value">{metrics.autoResolved}</div>
            <div className="metric-percentage">{metrics.autoResolveRate}%</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">⚙️</div>
          <div className="metric-content">
            <div className="metric-label">В работе</div>
            <div className="metric-value">{metrics.inProgress}</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⬆️</div>
          <div className="metric-content">
            <div className="metric-label">Эскалировано</div>
            <div className="metric-value">{metrics.escalated}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-label">Среднее время ответа</div>
            <div className="metric-value">{metrics.avgResponseTime}с</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">Точность классификации</div>
            <div className="metric-value">{metrics.classificationAccuracy}%</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-label">Процент автоответов</div>
            <div className="metric-value">{metrics.autoResolveRate}%</div>
          </div>
        </div>

        <div className="metric-card error">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-label">Ошибки маршрутизации</div>
            <div className="metric-value">{metrics.routingErrors}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Распределение заявок</h3>
          <div className="bar-chart">
            {chartData.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.label}</div>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color
                    }}
                  >
                    <span className="bar-value">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Статистика за последние 7 дней</h3>
          <div className="line-chart-placeholder">
            <div className="chart-line">
              {[65, 72, 68, 75, 80, 78, 85].map((value, index) => (
                <div key={index} className="chart-point" style={{ height: `${value}%` }}>
                  <div className="point-value">{value}%</div>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>🎯 Цель: 50% авторешение</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(metrics.autoResolveRate, 50)}%` }}
            >
              {metrics.autoResolveRate}%
            </div>
          </div>
          <p>Текущий показатель: {metrics.autoResolveRate}%</p>
        </div>

        <div className="info-card">
          <h3>🤖 Автоматизация 1-й линии</h3>
          <div className="automation-status">
            <span className="status-badge success">100%</span>
            <span>Первая линия полностью автоматизирована</span>
          </div>
          <p>0 FTE на первой линии поддержки</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

