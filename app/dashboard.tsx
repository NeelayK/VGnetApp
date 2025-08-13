import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';
import HistoryScreen from './history';


type Role = 'admin' | 'student' | 'visiting';

const LOGGABLE_DOORS = ['Main Door', 'Workshop Door'];
const ADMIN_ONLY_DOORS = ['Admin Door'];
const FAN_ZONES = ['Computer Room', 'Workshop Room'];

const COMMANDS = [
  { key: 'doors', label: 'Door Locks', icon: 'door' },
  { key: 'fans', label: 'Fan Commands', icon: 'fan' },
  { key: 'camera', label: 'Camera', icon: 'cctv' },
  { key: 'logs', label: 'Access Logs', icon: 'file-document' }
];

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState('');
  const [activeCommand, setActiveCommand] = useState('doors');

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');

      const { data, error } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        Alert.alert('Profile Error', 'Could not load user role');
        return;
      }

      setRole(data.role as Role);
      setName(data.name);
      setLoading(false);
    };

    getUserProfile();
  }, []);

  const logAction = async (action: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('history').insert({
      user_id: user.id,
      name: name,
      request_name: action
    });

    Alert.alert('Success', `Action: ${action}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey, {name}</Text>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </Pressable>
        </View>

        {/* Scrollable Command Menu */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.commandScroll}
          contentContainerStyle={styles.commandRow}
        >
          {COMMANDS.map(cmd => (
            <Pressable
              key={cmd.key}
              style={[
                styles.commandItem,
                activeCommand === cmd.key && styles.commandActive
              ]}
              onPress={() => setActiveCommand(cmd.key)}
            >
              <MaterialCommunityIcons
                name={cmd.icon as any}
                size={28}
                color={activeCommand === cmd.key ? 'white' : colors.dark}
              />
              <Text
                style={[
                  styles.commandLabel,
                  activeCommand === cmd.key && { color: 'white' }
                ]}
              >
                {cmd.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Active Command Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {activeCommand === 'doors' && (
            <>
              {[...LOGGABLE_DOORS, ...(role === 'admin' ? ADMIN_ONLY_DOORS : [])].map((door) => (
                <View key={door} style={styles.card}>
                  <Text style={styles.label}>{door}</Text>
                  <View style={styles.buttonRow}>
                    {role === 'admin' && (
                      <>
                        <Pressable style={styles.button} onPress={() => logAction(`${door} Always On`)}>
                          <Text style={styles.buttonText}>Always On</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={() => logAction(`${door} Always Off`)}>
                          <Text style={styles.buttonText}>Always Off</Text>
                        </Pressable>
                      </>
                    )}
                    <Pressable style={styles.button} onPress={() => logAction(`${door} Temporary Open`)}>
                      <Text style={styles.buttonText}>Open (10s)</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeCommand === 'fans' && (
            FAN_ZONES.map(zone => (
              <View key={zone} style={styles.card}>
                <Text style={styles.label}>{zone}</Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.button} onPress={() => Alert.alert('Fan On', zone)}>
                    <Text style={styles.buttonText}>On</Text>
                  </Pressable>
                  <Pressable style={styles.button} onPress={() => Alert.alert('Fan Off', zone)}>
                    <Text style={styles.buttonText}>Off</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          {activeCommand === 'camera' && (
            <View style={styles.card}>
              <Text style={styles.label}>Camera Feed</Text>
              <Text>(Camera integration here)</Text>
            </View>
          )}

{activeCommand === 'logs' && (
  <View style={styles.card}>
    <HistoryScreen />
  </View>
)}

        </ScrollView>
      </View>
    </>
  );
}

const colors = {
  light: '#F8F8F8',
  red: '#C21F4C',
  dark: '#1F1F1F'
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.light,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark
  },
  logout: {
    color: colors.red,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: colors.red,
    padding: 8,
    borderRadius: 12
  },
  commandScroll: {
    maxHeight: 100
  },
  commandRow: {
    paddingHorizontal: 10,
    gap: 10
  },
  commandItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    width: 90
  },
  commandActive: {
    backgroundColor: colors.red
  },
  commandLabel: {
    fontSize: 12,
    marginTop: 4,
    color: colors.dark,
    textAlign: 'center'
  },
  card: {
    padding: 15,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 12
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'

  },
  button: {
    backgroundColor: colors.red,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 10
  }
});
