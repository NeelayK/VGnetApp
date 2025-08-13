import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native'

interface SplashProps {
  loading?: boolean
  duration?: number
  onDone?: () => void
}

export default function SplashScreen({ loading = false, duration = 2000, onDone }: SplashProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      if (onDone) onDone()
    })
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={require('../assets/images/adaptive-icon.png')} style={styles.logo} />
      {loading && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="small" color="blue" />
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 200, height: 200 },
  loaderWrapper: {
    marginTop: 20,
  },
})
