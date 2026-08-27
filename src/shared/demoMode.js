export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const DEMO_USER = {
  uid: 'demo-teacher',
  name: 'Demo Teacher',
  email: 'demo@tarl.local',
  role: 'teacher',
  isDemo: true,
}

export function isDemoMode() {
  return DEMO_MODE
}
