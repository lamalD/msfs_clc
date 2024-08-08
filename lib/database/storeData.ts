import { create } from 'zustand';
import { LoadSimbriefData } from '../actions/simbrief.action';
import { getUserById } from '../actions/user.actions';

interface FlightData {
  simbriefId: string
  usernameSimbrief: string
  origin: string
  destination: string
  departureDate: string
  departureTime: string
  aircraftType: string
  registration: string
  flightNumber: string
  blockFuel: string
  takeoffFuel: string
  tripfuel: string
  dow: string
  doi: string
  zfw: string
  zfwi: string
  zfwmac: string
  tow: string
  towi: string
  towmac: string
  ldw: string
  pld: string
  paxCount: string
  pax_weight: string
  paxCount_F: string
  paxCount_C: string
  paxCount_Y: string
  bagCount: string
  bag_weight: string
  cargo: string
  fwd_hold: string
  fwd_hold_uld: string
  aft_hold: string
  aft_hold_uld: string
  blk_hold: string
  blk_hold_uld: string
  ramp_fuel: string
  to_fuel: string
  trip_fuel: string
  units: string
  limitation: string
  underload: string
  paxMale: string
  paxFemale: string
  paxChildren: string
}

interface UserData {
  userName: string
  usernameSimbrief: string
  currentFlightId: string
}

interface AppError {
  message: string;
  code?: number; // Optional error code
}

interface StoreState {
  userData: UserData | null;
  userIsLoading: boolean;
  userError: AppError | null;
  flightData: FlightData | null;
  isLoading: boolean;
  error: AppError | null;
  fetchUserData: (userId: string) => Promise<UserData>;
  fetchFlightData: (usernameSimbrief: string) => Promise<FlightData>;
}

export const useStore = create<StoreState>((set) => ({
  userData: null,
  userIsLoading: false,
  userError: null,
  flightData: null,
  isLoading: false,
  error: null,
  fetchUserData: async (userId: string) => {
    set({ userIsLoading: true });
    try {
      const userData = await getUserById(userId);
      set({ userData, userIsLoading: false });
      return userData
    } catch (error: any) {
      const appError: AppError = {
        message: error.message || 'An unexpected error occurred',
      };
      set({ userError: appError, userIsLoading: false });
      throw error
    }
  },
  fetchFlightData: async (usernameSimbrief: string) => {
    set({ isLoading: true });
    try {
      const flightData = await LoadSimbriefData({ usernameSimbrief });
      if (flightData) {
        set({ flightData, isLoading: false });
        console.log("flightData storeData: ", flightData)
        return flightData
      } else {
        throw new Error('Flight data not found')
      }
    } catch (error: any) {
      const appError: AppError = {
        message: error.message || 'An unexpected error occurred',
      };
      set({ error: appError, isLoading: false });
      throw error
    }
  },
}));