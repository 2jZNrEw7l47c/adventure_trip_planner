import { useState, useEffect } from 'react'

export function useCountryData(countryId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!countryId) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    import(`../data/countries/${countryId}.json`)
      .then(m => { setData(m.default); setLoading(false) })
      .catch(() => setLoading(false))
  }, [countryId])

  return { data, loading }
}
