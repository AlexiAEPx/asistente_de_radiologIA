# Asistente de Radiología

Estación de informes radiológicos con IA.

## Configuración de modelos y API keys

Sí: para usar varios proveedores, tú tienes que configurar sus API keys en variables de entorno.

- Modelos de **Anthropic** usan: `ANTHROPIC_API_KEY`
- Modelos de **OpenAI** usan: `OPENAI_API_KEY`

La web permite seleccionar modelos (más baratos o más potentes) y mantiene estimación de coste por uso.

### Variables necesarias

| Variable | Obligatoria | Cuándo |
|---|---:|---|
| `ANTHROPIC_API_KEY` | No* | Si quieres usar modelos Claude |
| `OPENAI_API_KEY` | No* | Si quieres usar modelos GPT |

\* Debes configurar al menos una. Si eliges en la UI un modelo cuyo proveedor no tiene key, la API devolverá error indicando qué variable falta.

### Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus claves
npm run dev
```

Ejemplo mínimo (`.env.local`):

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

## Despliegue en Vercel (5 minutos)

### 1. Sube a GitHub (repo PRIVADO)

```bash
cd asistente-radiologia
git init
git add .
git commit -m "Initial commit"

# Con GitHub CLI:
gh repo create asistente-radiologia --private --source=. --push

# O manual:
git remote add origin https://github.com/TU_USUARIO/asistente-radiologia.git
git push -u origin main
```

### 2. Despliega en Vercel

1. [vercel.com](https://vercel.com) → Login con GitHub
2. **Add New Project** → Importa `asistente-radiologia`
3. **Environment Variables** → añade una o ambas:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
   - `OPENAI_API_KEY` = `sk-proj-...`
4. **Deploy**

En ~1 minuto: `https://asistente-radiologia-XXXX.vercel.app`

## Seguridad

- API keys solo en servidor (nunca llegan al navegador)
- Repo privado
- Vercel cifra variables de entorno en reposo

## API JSON-first (PR1)

Nuevos endpoints backend con contratos validados de entrada/salida:

- `POST /api/analyze-request`
- `POST /api/generate-report`
- `POST /api/check-report`
- `POST /api/teaching`

`/api/chat` se mantiene temporalmente por compatibilidad y devuelve aviso de deprecación.
