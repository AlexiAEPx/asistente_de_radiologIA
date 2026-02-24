# Asistente de Radiología

Estación de informes radiológicos con IA.

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
3. **Environment Variables** → añade:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
4. **Deploy**

En ~1 minuto: `https://asistente-radiologia-XXXX.vercel.app`

### 3. Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # edita con tu API key
npm run dev                         # http://localhost:3000
```

## Seguridad

- API key solo en servidor (nunca llega al navegador)
- Repo privado
- Vercel cifra variables de entorno en reposo
