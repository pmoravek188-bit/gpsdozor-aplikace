import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = Number(process.env.BFF_PORT || 8787)
const GPS_BASE_URL = process.env.GPSDOZOR_BASE_URL || 'https://a1.gpsguard.eu'
const GPS_USERNAME = process.env.GPSDOZOR_USERNAME || ''
const GPS_PASSWORD = process.env.GPSDOZOR_PASSWORD || ''

if (!GPS_USERNAME || !GPS_PASSWORD) {
  console.error('Missing GPSDOZOR_USERNAME or GPSDOZOR_PASSWORD in environment.')
  process.exit(1)
}

const upstream = axios.create({
  baseURL: `${GPS_BASE_URL.replace(/\/$/, '')}/api/v1`,
  timeout: 20000,
  auth: {
    username: GPS_USERNAME,
    password: GPS_PASSWORD,
  },
})

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/bff/health', (_req, res) => {
  res.json({ ok: true, service: 'fleet-view-bff' })
})

// Proxy all GPS Dozor requests through backend so credentials never reach browser.
app.use('/bff/api/v1', async (req, res) => {
  try {
    const url = req.path.replace(/^\/bff\/api\/v1/, '') || '/'
    const response = await upstream.request({
      method: req.method,
      url,
      params: req.query,
      data: req.method === 'GET' ? undefined : req.body,
      headers: {
        'content-type': req.headers['content-type'],
      },
      validateStatus: () => true,
    })

    res.status(response.status).json(response.data)
  } catch (error) {
    const status = error?.response?.status || 502
    res.status(status).json({
      error: 'Upstream request failed',
      status,
    })
  }
})

app.listen(PORT, () => {
  console.log(`FleetView BFF running on http://localhost:${PORT}`)
})
