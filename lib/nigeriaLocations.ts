export interface NigeriaState {
  name: string
  lgas: NigeriaLGA[]
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface NigeriaLGA {
  name: string
  streets?: string[]
  coordinates?: {
    lat: number
    lng: number
  }
}

// Complete Nigeria States and LGAs
export const NIGERIA_LOCATIONS: NigeriaState[] = [
  {
    name: 'Lagos',
    lgas: [
      { name: 'Lagos Mainland', streets: ['Marina', 'Ikoyi', 'Victoria Island', 'Lekki', 'Ajah'] },
      { name: 'Amuwo Odofin', streets: ['Amuwo', 'Festac', 'Apapa'] },
      { name: 'Badagry', streets: ['Badagry', 'Tarkwa Bay', 'Olorunda'] },
      { name: 'Epe', streets: ['Epe', 'Lekki Phase 1', 'Lekki Phase 2'] },
      { name: 'Etim Ekpo', streets: ['Etim Ekpo', 'Oshodi', 'Isolo'] },
      { name: 'Ibeju Lekki', streets: ['Ibeju', 'Eleko', 'Lekki Free Zone'] },
      { name: 'Ifako Ijaiye', streets: ['Ifako', 'Ijaiye', 'Agege'] },
      { name: 'Ikeja', streets: ['Ikeja', 'GRA', 'Allen Avenue', 'Opebi'] },
      { name: 'Ikoyi', streets: ['Ikoyi', 'Banana Island', 'Whitesand'] },
      { name: 'Isolo', streets: ['Isolo', 'Oshodi', 'Ejigbo'] },
      { name: 'Kosofe', streets: ['Kosofe', 'Bariga', 'Shomolu'] },
      { name: 'Lagos Island', streets: ['Lagos Island', 'Onikan', 'Ikoyi'] },
      { name: 'Mushin', streets: ['Mushin', 'Bode Thomas', 'Obafemi Awolowo'] },
      { name: 'Oshodi Isolo', streets: ['Oshodi', 'Isolo', 'Ajao Estate'] },
      { name: 'Shomolu', streets: ['Shomolu', 'Bariga', 'Kosofe'] },
      { name: 'Somolu', streets: ['Somolu', 'Bariga', 'Shomolu'] },
      { name: 'Surulere', streets: ['Surulere', 'Bariga', 'Anthony'] },
    ],
    coordinates: { lat: 6.5244, lng: 3.3792 },
  },
  {
    name: 'Federal Capital Territory',
    lgas: [
      { name: 'Abuja Municipal Area Council', streets: ['Abuja City Center', 'Wuse', 'Garki', 'Ikoyi', 'Maitama'] },
      { name: 'Gwagwalada', streets: ['Gwagwalada', 'Tunga', 'Gwako'] },
      { name: 'Kuje', streets: ['Kuje', 'Kuye', 'Bwada'] },
      { name: 'Kwali', streets: ['Kwali', 'Gbako', 'Tapo'] },
    ],
    coordinates: { lat: 9.0765, lng: 7.3986 },
  },
  {
    name: 'Oyo',
    lgas: [
      { name: 'Ibadan North', streets: ['Ibadan', 'Bodija', 'UI', 'Dugbe'] },
      { name: 'Ibadan North West', streets: ['Sango', 'Eruwa', 'Ogbomoso'] },
      { name: 'Ibadan South East', streets: ['Ibadan South', 'Eleyele', 'Iwopin'] },
      { name: 'Ibadan South West', streets: ['Ibadan West', 'Akinyele', 'Lagelu'] },
      { name: 'Oyo East', streets: ['Oyo', 'Iganna', 'Ago Are'] },
      { name: 'Afijio', streets: ['Afijio', 'Awe', 'Oyo'] },
      { name: 'Egbeda', streets: ['Egbeda', 'Oke Ado', 'Felele'] },
      { name: 'Ibarapa Central', streets: ['Igboora', 'Ibarapa', 'Eruwa'] },
    ],
    coordinates: { lat: 7.3869, lng: 3.9455 },
  },
  {
    name: 'Kano',
    lgas: [
      { name: 'Kano Municipal', streets: ['Kano City', 'Sabon Gari', 'Fagge'] },
      { name: 'Tarauni', streets: ['Tarauni', 'Sabongari', 'Magama'] },
      { name: 'Nassarawa', streets: ['Nassarawa', 'Kura', 'Karaye'] },
      { name: 'Gwale', streets: ['Gwale', 'Dandago', 'Kofar Waje'] },
      { name: 'Dala', streets: ['Dala', 'Hotoro', 'Gida'] },
    ],
    coordinates: { lat: 12.0022, lng: 8.6753 },
  },
  {
    name: 'Rivers',
    lgas: [
      { name: 'Port Harcourt', streets: ['Port Harcourt', 'GRA', 'Rumuola', 'Rumuokoro'] },
      { name: 'Obio Akpor', streets: ['Obio Akpor', 'Rumueme', 'Rumuigbo'] },
      { name: 'Eleme', streets: ['Eleme', 'Alesa', 'Eteo'] },
      { name: 'Ogu Bolo', streets: ['Ogu', 'Bolo', 'Tai'] },
    ],
    coordinates: { lat: 4.8156, lng: 7.0498 },
  },
  {
    name: 'Delta',
    lgas: [
      { name: 'Warri', streets: ['Warri', 'Effurun', 'Uvwie'] },
      { name: 'Uvwie', streets: ['Uvwie', 'Warri South', 'Warri North'] },
      { name: 'Asaba', streets: ['Asaba', 'Okpanam', 'Oshimili South'] },
    ],
    coordinates: { lat: 5.7521, lng: 5.5244 },
  },
  {
    name: 'Edo',
    lgas: [
      { name: 'Benin City', streets: ['Benin City', 'Iweka', 'Ugbowo', 'Akpakpava'] },
      { name: 'Oredo', streets: ['Oredo', 'Benin South', 'Benin West'] },
      { name: 'Igueben', streets: ['Igueben', 'Okada', 'Esan Central'] },
    ],
    coordinates: { lat: 6.4969, lng: 5.6271 },
  },
  {
    name: 'Enugu',
    lgas: [
      { name: 'Enugu North', streets: ['Enugu', 'Coal Camp', 'New Haven'] },
      { name: 'Enugu South', streets: ['Enugu South', 'Ogui', 'Achara Layout'] },
      { name: 'Udi', streets: ['Udi', 'Enugu North', 'Enugu South'] },
    ],
    coordinates: { lat: 6.4549, lng: 7.5119 },
  },
  {
    name: 'Abia',
    lgas: [
      { name: 'Abakaliki', streets: ['Abakaliki', 'Afikpo', 'Ohaozara'] },
      { name: 'Aba', streets: ['Aba', 'Port Harcourt Road', 'Obohia Street'] },
      { name: 'Umahia', streets: ['Umahia', 'Ikot Ekpene', 'Arochukwu'] },
    ],
    coordinates: { lat: 5.1021, lng: 7.3667 },
  },
  {
    name: 'Cross River',
    lgas: [
      { name: 'Calabar South', streets: ['Calabar', 'Douala Road', 'Adiabo'] },
      { name: 'Calabar Municipality', streets: ['Calabar', 'Adiabo', 'Bakassi'] },
      { name: 'Bucalabu', streets: ['Bucalabu', 'Ikom', 'Oban'] },
    ],
    coordinates: { lat: 4.9515, lng: 8.7844 },
  },
  {
    name: 'Akwa Ibom',
    lgas: [
      { name: 'Uyo', streets: ['Uyo', 'Akwa Ibom South', 'Akwa Ibom North'] },
      { name: 'Itam', streets: ['Itam', 'Eket', 'Ibeno'] },
      { name: 'Ikot Abasi', streets: ['Ikot Abasi', 'Ini', 'Essien Udim'] },
    ],
    coordinates: { lat: 5.0379, lng: 7.9644 },
  },
  {
    name: 'Bayelsa',
    lgas: [
      { name: 'Yenagoa', streets: ['Yenagoa', 'Bayelsa Central', 'Bayelsa South'] },
      { name: 'Sagbama', streets: ['Sagbama', 'Ekeremor', 'Brass'] },
    ],
    coordinates: { lat: 5.0379, lng: 6.2591 },
  },
  {
    name: 'Kaduna',
    lgas: [
      { name: 'Kaduna North', streets: ['Kaduna', 'Barnawa', 'Kurmin Mashi'] },
      { name: 'Kaduna South', streets: ['Kaduna South', 'Jaji', 'Chikun'] },
      { name: 'Kafanchan', streets: ['Kafanchan', 'Kachia', 'Kagarko'] },
    ],
    coordinates: { lat: 10.5369, lng: 7.4432 },
  },
  {
    name: 'Jigawa',
    lgas: [
      { name: 'Dutse', streets: ['Dutse', 'Gwiwa', 'Hadejia'] },
      { name: 'Kazaure', streets: ['Kazaure', 'Kafin Hausa', 'Kirikasamma'] },
    ],
    coordinates: { lat: 12.4108, lng: 9.3524 },
  },
  {
    name: 'Katsina',
    lgas: [
      { name: 'Katsina', streets: ['Katsina', 'Daura', 'Malumfashi'] },
      { name: 'Kankara', streets: ['Kankara', 'Ruma', 'Dandume'] },
    ],
    coordinates: { lat: 12.9884, lng: 7.6233 },
  },
  {
    name: 'Kebbi',
    lgas: [
      { name: 'Birnin Kebbi', streets: ['Birnin Kebbi', 'Argungu', 'Zuru'] },
      { name: 'Jega', streets: ['Jega', 'Gwandu', 'Bagudo'] },
    ],
    coordinates: { lat: 12.3009, lng: 4.1963 },
  },
  {
    name: 'Sokoto',
    lgas: [
      { name: 'Sokoto North', streets: ['Sokoto', 'Gusau', 'Marnadi'] },
      { name: 'Goronyo', streets: ['Goronyo', 'Illela', 'Binji'] },
    ],
    coordinates: { lat: 13.1536, lng: 5.2379 },
  },
  {
    name: 'Zamfara',
    lgas: [
      { name: 'Gusau', streets: ['Gusau', 'Kaura Namoda', 'Tsafe'] },
      { name: 'Gummi', streets: ['Gummi', 'Maru', 'Maradun'] },
    ],
    coordinates: { lat: 12.1668, lng: 6.6667 },
  },
  {
    name: 'Niger',
    lgas: [
      { name: 'Minna', streets: ['Minna', 'Bosso', 'Paikoro'] },
      { name: 'Suleja', streets: ['Suleja', 'Shiroro', 'Rafi'] },
    ],
    coordinates: { lat: 9.5833, lng: 6.5167 },
  },
  {
    name: 'Kwara',
    lgas: [
      { name: 'Ilorin', streets: ['Ilorin', 'Ilorin East', 'Ilorin South'] },
      { name: 'Offa', streets: ['Offa', 'Oyun', 'Ekiti'] },
    ],
    coordinates: { lat: 8.4833, lng: 4.5833 },
  },
  {
    name: 'Osun',
    lgas: [
      { name: 'Osogbo', streets: ['Osogbo', 'Osun South West', 'Osun North East'] },
      { name: 'Ilesha', streets: ['Ilesha', 'Isokan', 'Ijebu Jesa'] },
      { name: 'Ife', streets: ['Ile Ife', 'Ife Central', 'Ife East'] },
    ],
    coordinates: { lat: 7.7667, lng: 4.5333 },
  },
  {
    name: 'Ondo',
    lgas: [
      { name: 'Akure', streets: ['Akure', 'Akure South', 'Akure North'] },
      { name: 'Ondo Town', streets: ['Ondo', 'Ondo East', 'Ondo West'] },
      { name: 'Ose', streets: ['Ose', 'Odigbo', 'Okitipupa'] },
    ],
    coordinates: { lat: 7.2129, lng: 5.1848 },
  },
  {
    name: 'Ekiti',
    lgas: [
      { name: 'Ado Ekiti', streets: ['Ado Ekiti', 'Ekiti West', 'Ekiti East'] },
      { name: 'Ijero', streets: ['Ijero', 'Irepodun', 'Emure'] },
    ],
    coordinates: { lat: 7.6167, lng: 5.2333 },
  },
  {
    name: 'Ogun',
    lgas: [
      { name: 'Abeokuta', streets: ['Abeokuta', 'Abeokuta South', 'Abeokuta North'] },
      { name: 'Ijebu Ode', streets: ['Ijebu Ode', 'Ijebu East', 'Ijebu North'] },
      { name: 'Sagamu', streets: ['Sagamu', 'Remo', 'Ijebu North East'] },
    ],
    coordinates: { lat: 6.6667, lng: 3.35 },
  },
  {
    name: 'Imo',
    lgas: [
      { name: 'Owerri', streets: ['Owerri', 'Owerri North', 'Owerri West'] },
      { name: 'Orlu', streets: ['Orlu', 'Orsu', 'Oru East'] },
      { name: 'Okigwe', streets: ['Okigwe', 'Ohaji Egbema', 'Oguta'] },
    ],
    coordinates: { lat: 5.4833, lng: 7.0167 },
  },
  {
    name: 'Anambra',
    lgas: [
      { name: 'Awka', streets: ['Awka', 'Awka North', 'Awka South'] },
      { name: 'Onitsha', streets: ['Onitsha', 'Onitsha North', 'Onitsha South'] },
      { name: 'Nnewi', streets: ['Nnewi', 'Nnewi North', 'Nnewi South'] },
    ],
    coordinates: { lat: 6.2333, lng: 7.1333 },
  },
  {
    name: 'Ebonyi',
    lgas: [
      { name: 'Abakaliki', streets: ['Abakaliki', 'Abakaliki South', 'Abakaliki North'] },
      { name: 'Afikpo', streets: ['Afikpo', 'Afikpo South', 'Afikpo North'] },
    ],
    coordinates: { lat: 6.3263, lng: 8.1147 },
  },
  {
    name: 'Adamawa',
    lgas: [
      { name: 'Yola', streets: ['Yola', 'Yola South', 'Yola North'] },
      { name: 'Gombe', streets: ['Gombe', 'Gombe South', 'Gombe North'] },
    ],
    coordinates: { lat: 9.2077, lng: 12.4744 },
  },
  {
    name: 'Taraba',
    lgas: [
      { name: 'Jalingo', streets: ['Jalingo', 'Taraba South', 'Taraba North'] },
      { name: 'Wukari', streets: ['Wukari', 'Takum', 'Ibi'] },
    ],
    coordinates: { lat: 8.8941, lng: 11.3542 },
  },
  {
    name: 'Plateau',
    lgas: [
      { name: 'Jos', streets: ['Jos', 'Jos North', 'Jos South'] },
      { name: 'Bukuru', streets: ['Bukuru', 'Riyom', 'Barikin Ladi'] },
    ],
    coordinates: { lat: 9.9265, lng: 8.8953 },
  },
  {
    name: 'Nasarawa',
    lgas: [
      { name: 'Lafia', streets: ['Lafia', 'Lafia North', 'Lafia South'] },
      { name: 'Keffi', streets: ['Keffi', 'Karu', 'Keffi North'] },
    ],
    coordinates: { lat: 8.5411, lng: 8.5541 },
  },
  {
    name: 'Benue',
    lgas: [
      { name: 'Makurdi', streets: ['Makurdi', 'Makurdi South', 'Makurdi North'] },
      { name: 'Gboko', streets: ['Gboko', 'Naka', 'Logo'] },
    ],
    coordinates: { lat: 7.7333, lng: 8.7667 },
  },
]

// Get all states
export const getAllStates = (): string[] => {
  return NIGERIA_LOCATIONS.map(state => state.name).sort()
}

// Get LGAs for a specific state
export const getLGAsByState = (stateName: string): string[] => {
  const state = NIGERIA_LOCATIONS.find(s => s.name === stateName)
  if (!state) return []
  return state.lgas.map(lga => lga.name).sort()
}

// Get streets for a specific LGA
export const getStreetsByLGA = (stateName: string, lgaName: string): string[] => {
  const state = NIGERIA_LOCATIONS.find(s => s.name === stateName)
  if (!state) return []
  const lga = state.lgas.find(l => l.name === lgaName)
  if (!lga || !lga.streets) return []
  return lga.streets.sort()
}

// Get geolocation of user using browser's geolocation API
export const getUserGeolocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      error => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

// Find nearest state based on coordinates
export const findNearestState = (lat: number, lng: number): string | null => {
  let nearestState = null
  let minDistance = Infinity

  NIGERIA_LOCATIONS.forEach(state => {
    if (state.coordinates) {
      const distance = Math.sqrt(
        Math.pow(state.coordinates.lat - lat, 2) + Math.pow(state.coordinates.lng - lng, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        nearestState = state.name
      }
    }
  })

  return nearestState
}

// Format location string
export const formatLocationString = (
  state: string,
  lga?: string,
  street?: string
): string => {
  const parts = [street, lga, state].filter(Boolean)
  return parts.join(', ')
}

// Parse location string to get state, lga, street
export const parseLocationString = (
  locationString: string
): { state?: string; lga?: string; street?: string } => {
  const parts = locationString.split(',').map(p => p.trim())

  let state: string | undefined
  let lga: string | undefined
  let street: string | undefined

  // Try to match parts with known locations
  for (const part of parts) {
    // Check if it's a state
    if (getAllStates().includes(part)) {
      state = part
    }
    // Check if it's an LGA
    else if (state && getLGAsByState(state).includes(part)) {
      lga = part
    }
    // Otherwise treat as street
    else if (state && lga) {
      street = part
    }
  }

  return { state, lga, street }
}

// Validate location components
export const isValidLocation = (
  state: string,
  lga: string,
  street?: string
): boolean => {
  const states = getAllStates()
  if (!states.includes(state)) return false

  const lgas = getLGAsByState(state)
  if (!lgas.includes(lga)) return false

  if (street) {
    const streets = getStreetsByLGA(state, lga)
    return streets.length === 0 || streets.includes(street)
  }

  return true
}

// Get state coordinates for map center
export const getStateCoordinates = (stateName: string): { lat: number; lng: number } | null => {
  const state = NIGERIA_LOCATIONS.find(s => s.name === stateName)
  return state?.coordinates || null
}
