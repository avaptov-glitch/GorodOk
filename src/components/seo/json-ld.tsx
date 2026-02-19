/**
 * Компонент для вставки JSON-LD структурированных данных (Schema.org).
 * Используется для SEO — помогает поисковикам понять контент страницы.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
