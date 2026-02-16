# GitHub Setup — Krok za krokem

## 1. Vytvoř nový GitHub repository

1. Jdi na https://github.com/new
2. Repository name: `fleet-view` (nebo jak chceš)
3. **Nastav jako Private** (obsahuje integraci s GPS Dozor API)
4. **Nevyplňuj** README, .gitignore, license (už máme)
5. Klikni "Create repository"

## 2. Push kódu na GitHub

```bash
cd "/Users/patrik/Desktop/gps-dozor-ukol (kopie)/fleet-view"

# Přidej všechny soubory (kromě .env - ten je v .gitignore)
git add .

# Vytvoř první commit
git commit -m "Initial commit: FleetView production-ready app

- Vue 3 + Pinia + Leaflet + Chart.js
- Secure BFF proxy for GPS Dozor API
- Real-time tracking, trip analysis, eco-driving
- Dark mode, i18n (CZ/EN), responsive design
- Unit tests, CI/CD workflow"

# Přidej remote (nahraď TVUJ_USERNAME)
git remote add origin https://github.com/TVUJ_USERNAME/fleet-view.git

# Push na GitHub
git branch -M main
git push -u origin main
```

## 3. Ověření

- Jdi na `https://github.com/TVUJ_USERNAME/fleet-view`
- Měl bys vidět všechny soubory
- **DŮLEŽITÉ**: `.env` by tam **NEMĚL** být (je v `.gitignore`)

## 4. GitHub Actions CI/CD

Po pushu se automaticky spustí:
- ✅ Unit testy (`npm run test`)
- ✅ Build (`npm run build`)

Vidíš to v záložce **Actions** na GitHubu.

## 5. Secrets (volitelné pro deployment)

Pokud chceš automatický deployment, přidej Secrets:
- Settings → Secrets and variables → Actions
- `GPSDOZOR_USERNAME`
- `GPSDOZOR_PASSWORD`

## ✅ Hotovo!

Repo je připravené a funkční. Kdokoliv může:
1. `git clone` repo
2. `npm install`
3. Vytvořit `.env` z `env.example`
4. `npm run dev` → aplikace běží!
