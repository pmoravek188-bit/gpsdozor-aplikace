# FleetView — Fleet Management Dashboard

## Pro koho a proč
FleetView je určený pro fleet manažery, dispečery a provozní týmy, které potřebují rychlý přehled o vozidlech na jednom místě. Cílem je zjednodušit každodenní dohled nad flotilou: poloha, jízdy, styl jízdy a technický stav.

## Co aplikace umí
- Živá mapa s aktuální polohou a stavem vozidel
- Kniha jízd včetně trasy, optimalizace a výškového profilu
- Eco‑driving přehled (události, závažnost, mapa, časové trendy)
- Senzorová data (rychlost, otáčky, spotřeba, teplota atd.)
- Bonus: počasí, geokódované adresy, POI u vozidel, OSRM routing


## Jak pracovat se senzory a eco‑driving
1. Vyber vozidlo (pokud má data jen jedna jednotka, použij právě tu).
2. Klikni **Najít data** – aplikace nastaví období podle poslední aktivity vozidla a najde dostupná data.
3. Senzory s daty jsou označené **✓** a zeleným zvýrazněním; použij **Zobrazit senzory s daty**.
4. Když senzory nic nevrátí, aplikace zkusí GPS historii a zobrazí aspoň rychlost (fallback je vždy označený).
5. Eco‑driving se načítá z endpointu; pokud není nic, je dopočítaný z GPS historie (fallback je vždy označený).

## Limity dat
- Dostupnost senzorů/eco‑eventů závisí na konkrétním zařízení a API.
- Pokud dané vozidlo nemá data ani v historii, aplikace to férově zobrazí jako „bez dat“.

## Použité endpointy GPS Dozor (min. 3 splněno)
- `/groups`
- `/vehicles/group/{code}`
- `/vehicle/{code}/trips`
- `/vehicles/history/{code}`
- `/vehicle/{code}/eco-driving-events`
- `/vehicle/{code}/sensors/{types}`


## Další veřejná API
- Open‑Meteo (počasí)
- Nominatim (reverzní geokódování)
- OSRM (routing / optimalizace trasy)
- Overpass (POI z OpenStreetMap)
- Open‑Elevation (výškový profil)

## AI nástroje a workflow
- Opus: první návrh struktury a komponent
- ChatGPT: revize UX, robustní parsování dat, opravy edge‑caseů, doporučení pro 10/10 prezentaci
- Iterace: návrh → implementace → testy → UX polish

## Na co jsem narazil a jak jsem to řešil
- Ne všechna vozidla mají data pro všechny senzory → výchozí `Speed`, automatické hledání období s daty, filtry a selektory
- API vrací různé formáty odpovědí → normalizace dat před vykreslením
- Chyby časových rozsahů → jasné hlášky a rychlé volby období
- Duplicitní query parametry v BFF → oprava proxy vrstvy

## Co bych přidal s více časem
- Upozornění (alerty) na překročení rychlosti / dlouhé stání
- Skóre řidiče a benchmark mezi vozidly
- Reporty a exporty (PDF, měsíční přehledy)
- Cache a inteligentní refresh podle změn polohy

## Spuštění

### Jak spustit z GitHubu
```bash
git clone https://github.com/pmoravek188-bit/gpsdozor-aplikace.git
cd gpsdozor-aplikace
npm install
cp env.example .env
# vyplň GPSDOZOR_USERNAME a GPSDOZOR_PASSWORD
npm run dev
```
Otevři `http://localhost:5173` (BFF běží na `http://localhost:8787`).

