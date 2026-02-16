# FleetView — Dokumentace (A4)

## Přehled
FleetView je webová aplikace pro správu vozového parku s real-time trackingem, analýzou jízd, eco-driving monitoringem a vizualizací senzorových dat. Aplikace je postavena na Vue 3, Pinia, Leaflet a Chart.js s bezpečným BFF proxy pro GPS Dozor API.

## Instalace a spuštění

### Požadavky
- Node.js 20+ a npm 10+
- Přístup k GPS Dozor API (credentials)

### Setup
```bash
npm install
cp env.example .env
# Vyplň GPSDOZOR_USERNAME a GPSDOZOR_PASSWORD v .env
npm run dev
```

Aplikace běží na:
- Frontend: `http://localhost:5173`
- BFF server: `http://localhost:8787`

## Hlavní funkce

**Dashboard**: Real-time mapa vozidel, statistiky, počasí, geokódované adresy  
**Vozidla**: Seznam vozidel s filtrováním, řazením, detailní stránka  
**Kniha jízd**: Historie jízd, porovnání s optimální trasou (OSRM), výškový profil  
**Eco Driving**: Detekce ostrého brzdění/akcelerace, mapa událostí, statistiky  
**Senzory**: Interaktivní grafy rychlosti, otáček, spotřeby, teploty, napětí baterie


## Práce se senzory a eco‑driving
1. Vyberte vozidlo, u kterého jsou v API dostupná data.
2. Tlačítko **Najít data** automaticky nastaví období podle poslední aktivity vozidla.
3. Senzory s daty jsou zvýrazněné zeleně a označené **✓**.
4. Pokud senzory nic nevrátí, aplikace použije GPS historii a zobrazí minimálně rychlost (fallback je označený).
5. Eco‑driving se primárně načítá z endpointu; pokud je prázdný, dopočítá se z GPS historie.

## Limity dat
- Dostupnost dat závisí na telemetrii konkrétního vozidla a nastavení GPS Dozor.
- Pokud vozidlo nemá data ani v historii, zobrazí se stav „bez dat“.

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

## Build a testy

```bash
npm run build    # Production build → dist/
npm run test     # Unit testy (Vitest)
```

## Deployment

1. Nastav `.env` na produkčním serveru
2. `npm run build` → `dist/`
3. Serve `dist/` přes nginx/Apache
4. Spusť BFF: `node server/index.js` (doporučeno PM2/systemd)

## Struktura projektu

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

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: FleetView production app"
git remote add origin https://github.com/TVUJ_USERNAME/fleet-view.git
git push -u origin main
```

**Důležité**: `.env` je v `.gitignore` — credentials se nikdy necommitují!
