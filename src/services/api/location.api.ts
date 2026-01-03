import axios from 'axios'

interface Province {
  name: string
  code: number
  codename: string
  division_type: string
  phone_code: number
  districts: District[]
}

interface District {
  name: string
  code: number
  codename: string
  division_type: string
  province_code: number
}

const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api'

export const LocationAPI = {
  /**
   * Get all Vietnamese provinces/cities
   * @param depth - 1: provinces only, 2: provinces with districts, 3: provinces with districts and wards
   */
  getProvinces: async (depth: 1 | 2 | 3 = 1) => {
    const response = await axios.get<Province[]>(`${PROVINCES_API_BASE}/p/?depth=${depth}`)
    return response.data
  },

  /**
   * Get districts of a specific province
   */
  getDistrictsByProvinceCode: async (provinceCode: number) => {
    const response = await axios.get<Province>(
      `${PROVINCES_API_BASE}/p/${provinceCode}?depth=2`,
    )
    return response.data.districts
  },

  /**
   * Get shipping carriers (hardcoded as no public API available)
   */
  getShippingCarriers: () => {
    return Promise.resolve([
      'GHN - Fast Delivery',
      'GHTK - Economical Delivery',
      'J&T Express',
      'Viettel Post',
      'Vietnam Post',
      'Ninja Van',
      'Best Express',
      'Kerry Express',
    ])
  },
}
