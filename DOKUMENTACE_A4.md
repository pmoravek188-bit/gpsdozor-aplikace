# FleetView — Dokumentace

## Pro koho a proč
FleetView je určený pro fleet manažery, dispečery a provozní týmy, které potřebují rychlý přehled o vozidlech na jednom místě. Cílem je zjednodušit každodenní dohled nad flotilou: poloha, jízdy, styl jízdy a technický stav.

## Přehled
FleetView je webová aplikace pro správu vozového parku s real-time trackingem, analýzou jízd, eco-driving monitoringem a vizualizací senzorových dat. Postavena na Vue 3, Pinia, Leaflet a Chart.js s bezpečným BFF proxy pro GPS Dozor API.

## Instalace

**Požadavky**: Node.js 20+, npm 10+, GPS Dozor API credentials

```bash
npm install
cp env.example .env
# Vyplň GPSDOZOR_USERNAME a GPSDOZOR_PASSWORD
npm run dev
```

**URL**: Frontend `http://localhost:5173`, BFF `http://localhost:8787`

## Funkce

**Dashboard**: Real-time mapa vozidel, statistiky, počasí, geokódované adresy  
**Vozidla**: Seznam s filtrováním, řazením, detailní stránka  
**Kniha jízd**: Historie jízd, porovnání s optimální trasou (OSRM), výškový profil  
**Eco Driving**: Detekce ostrého brzdění/akcelerace, mapa událostí, statistiky  
**Senzory**: Interaktivní grafy rychlosti, otáček, spotřeby, teploty, napětí


## Práce se senzory a eco‑driving
1. Vyberte vozidlo s dostupnými daty.
2. **Najít data** nastaví období podle poslední aktivity vozidla.
3. Senzory s daty jsou označené **✓** a zeleně.
4. Pokud senzory nic nevrátí, použije se GPS historie (minimálně rychlost).
5. Eco‑driving se bere z endpointu, případně se dopočítá z GPS historie.

## Limity dat
- Ne každé vozidlo má telemetrii v API; v takovém případě aplikace zobrazí „bez dat“.

## Technologie

**Frontend**: Vue 3 (Composition API), Pinia, Vue Router, Tailwind CSS v4  
**Mapy**: Leaflet + Vue-Leaflet  
**Grafy**: Chart.js + Vue-Chartjs  
**Backend**: Express.js BFF proxy  
**APIs**: GPS Dozor, Open-Meteo, Nominatim, OSRM, Overpass, Open-Elevation

## Bezpečnost

- Credentials pouze v `.env` (nikdy v gitu)
- BFF proxy zpracovává autentizaci GPS Dozor
- Frontend volá pouze `/bff/api/v1/*` bez auth hlaviček
- CORS povoleno pro localhost development

## Build & Testy

```bash
npm run build    # Production build → dist/
npm run test     # Unit testy (Vitest)
```

## Deployment

1. Nastav `.env` na produkčním serveru
2. `npm run build` → `dist/`
3. Serve `dist/` přes nginx/Apache
4. Spusť BFF: `node server/index.js` (doporučeno PM2/systemd)

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: FleetView production app"
git remote add origin https://github.com/TVUJ_USERNAME/fleet-view.git
git push -u origin main
```

**Důležité**: `.env` je v `.gitignore` — credentials se nikdy necommitují!

## Struktura

```
server/          # Express BFF (credentials isolation)
src/
  api/          # API klienti (bez credentials)
  components/   # UI komponenty
  composables/ # Vue composables
  stores/       # Pinia stores
  views/        # Stránky
  i18n/         # Překlady (cs, en)
```

---
*FleetView v1.0 — Production-ready fleet management dashboard*
