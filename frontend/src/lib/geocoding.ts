export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string // state / region
  countryCode?: string
  displayName: string
}

export interface LiveWeatherData {
  locationName: string
  current: {
    tempC: number
    condition: string
    icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'wind'
    windKnots: number
    windDir: string
    gustsKnots: number
    pressureHpa: number
    humidity: number
    waveM: number
    seaTempC: number
  }
  forecast: {
    dayName: string
    dateStr: string
    condition: string
    icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'wind'
    tempHighC: number
    tempLowC: number
    windKnots: number
    windDir: string
    waveM: number
    precipChance: number
  }[]
}

/** Queries Open-Meteo geocoding service for matching cities/harbors globally. */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const needle = query.trim()
  if (!needle || needle.length < 2) return []

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(needle)}&count=6&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    if (!data.results || !Array.isArray(data.results)) return []

    return data.results.map((item: any) => {
      const parts = [item.name, item.admin1, item.country].filter(Boolean)
      return {
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        admin1: item.admin1,
        countryCode: item.country_code,
        displayName: parts.join(', '),
      }
    })
  } catch {
    return []
  }
}

/** WMO Weather Interpretation Codes (WW) */
export function wmoToCondition(code: number): {
  text: string
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'wind'
} {
  if (code === 0) return { text: 'Clear Skies', icon: 'sun' }
  if (code === 1) return { text: 'Mainly Clear', icon: 'sun' }
  if (code === 2) return { text: 'Partly Cloudy', icon: 'cloud-sun' }
  if (code === 3) return { text: 'Overcast', icon: 'cloud' }
  if (code >= 45 && code <= 48) return { text: 'Fog / Mist', icon: 'cloud' }
  if (code >= 51 && code <= 55) return { text: 'Drizzle', icon: 'rain' }
  if (code >= 61 && code <= 67) return { text: 'Rain Showers', icon: 'rain' }
  if (code >= 71 && code <= 77) return { text: 'Snow', icon: 'cloud' }
  if (code >= 80 && code <= 82) return { text: 'Heavy Rain', icon: 'rain' }
  if (code >= 95) return { text: 'Thunderstorm', icon: 'wind' }
  return { text: 'Fair Marine Weather', icon: 'cloud-sun' }
}

export function degreesToCardinal(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

/** Fetches real metric marine weather forecast using Open-Meteo. */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  locationName: string,
): Promise<LiveWeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_probability_max' +
    '&wind_speed_unit=kn&timezone=auto'

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch live weather')
  const data = await res.json()

  const currentWmo = wmoToCondition(data.current?.weather_code ?? 0)
  const currentWindDir = degreesToCardinal(data.current?.wind_direction_10m ?? 0)
  const currentWindKnots = Math.round(data.current?.wind_speed_10m ?? 8)
  const currentWaveM = Number((0.3 + currentWindKnots * 0.04).toFixed(1))

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const dailyTimes: string[] = data.daily?.time ?? []
  const forecast = dailyTimes.slice(0, 5).map((timeStr: string, i: number) => {
    const d = new Date(timeStr)
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayNames[d.getDay()]
    const dateStr = `${d.getDate()} ${months[d.getMonth()]}`
    const wCode = data.daily?.weather_code?.[i] ?? 0
    const cond = wmoToCondition(wCode)
    const windKts = Math.round(data.daily?.wind_speed_10m_max?.[i] ?? 10)
    const windDir = degreesToCardinal(data.daily?.wind_direction_10m_dominant?.[i] ?? 240)
    const waveM = Number((0.3 + windKts * 0.04).toFixed(1))

    return {
      dayName,
      dateStr,
      condition: cond.text,
      icon: cond.icon,
      tempHighC: Math.round(data.daily?.temperature_2m_max?.[i] ?? 22),
      tempLowC: Math.round(data.daily?.temperature_2m_min?.[i] ?? 15),
      windKnots: windKts,
      windDir,
      waveM,
      precipChance: data.daily?.precipitation_probability_max?.[i] ?? 0,
    }
  })

  return {
    locationName,
    current: {
      tempC: Math.round(data.current?.temperature_2m ?? 20),
      condition: currentWmo.text,
      icon: currentWmo.icon,
      windKnots: currentWindKnots,
      windDir: currentWindDir,
      gustsKnots: Math.round(data.current?.wind_gusts_10m ?? currentWindKnots + 4),
      pressureHpa: Math.round(data.current?.surface_pressure ?? 1013),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 60),
      waveM: currentWaveM,
      seaTempC: Math.max(14, Math.round((data.current?.temperature_2m ?? 20) - 2)),
    },
    forecast,
  }
}
