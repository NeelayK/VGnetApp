import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'

interface LogEntry {
  id: number
  name: string
  request_name: string
  created_at: string
}

export default function HistoryScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25)

      if (!error && data) setLogs(data)
      setLoading(false)
    }

    fetchLogs()
  }, [])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />

  return (
  <View style={styles.container}>
    <Text style={styles.title}>Access Logs</Text>
      {logs.map((item) => (
        <View key={item.id} style={styles.logItem}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.request_name}</Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      ))}
  </View>
)

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  logItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: { fontWeight: 'bold' },
  time: { fontSize: 12, color: 'gray' },
})
