# Site1

Landing page moderna, responsiva e otimizada para conversao com foco em geracao de leads para clinicas e consultorios.

## Configuracao rapida

1. Endpoint do formulario:
- Abra `index.html`.
- No formulario `#lead-form`, altere `data-endpoint="https://example.com/api/leads"` para seu endpoint real.
- O envio e feito em `POST` com JSON.

2. Tracking (GA4 e Meta Pixel):
- Abra `script.js`.
- Atualize `ga4MeasurementId` com seu ID real (ex: `G-ABC123DEF4`).
- Atualize `metaPixelId` com seu ID real numerico.

3. Eventos ja mapeados:
- Cliques de CTA (`cta_nav_click`, `cta_hero_primary_click`, `cta_hero_secondary_click`, `cta_final_click`)
- Tentativa de envio (`lead_form_submit_attempt`)
- Erro de validacao (`lead_form_validation_error`)
- Envio com sucesso (`lead_form_submit_success`)
- Erro no envio (`lead_form_submit_error`)

## Payload enviado pelo formulario

```json
{
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "utm_source": "string",
  "utm_medium": "string",
  "utm_campaign": "string",
  "page_url": "string",
  "timestamp": "ISO-8601"
}
```
