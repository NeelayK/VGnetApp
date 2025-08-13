import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import SplashScreen from '../components/SplashScreen'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }

    setTimeout(() => {
      setShowSplash(false)
      checkAuth()
    }, 2500)
  }, [])

  return showSplash ? <SplashScreen /> : null
}
