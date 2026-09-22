import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Farm {
  id: string
  name: string
  owner_id: string
  logo_url?: string | null
}

interface FarmState {
  farm: Farm | null
  setFarm: (farm: Farm | null) => void
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      farm: null,
      setFarm: (farm) => set({ farm }),
    }),
    { name: 'LayerPro-farm' }
  )
)
