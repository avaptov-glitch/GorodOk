'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#fafafa',
        }}
      >
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}
            >
              &#9888;
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: '0.75rem',
              }}
            >
              Критическая ошибка
            </h1>
            <p
              style={{
                color: '#666',
                marginBottom: '2rem',
                lineHeight: 1.5,
              }}
            >
              Приложение столкнулось с серьёзной ошибкой. Пожалуйста, обновите
              страницу.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#1a1a1a',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Обновить страницу
            </button>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1.5rem' }}>
                Код ошибки: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
