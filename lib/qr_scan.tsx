import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function QRScanScreen({ onDone, onScanComplete }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const resetScan = () => setScanned(false);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const door = data.trim();
    const validDoors = ['Main Door', 'Workshop Room', 'Discussion Room'];

    if (!validDoors.map(d => d.toLowerCase()).includes(door.toLowerCase())) {
      Alert.alert('Invalid QR', `Door "${door}" not recognized.`);
      setTimeout(resetScan, 2500);
      return;
    }

    // Send door name to parent
    onScanComplete(door);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          We need camera access to scan door QR codes.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Camera permission denied. Enable it in settings.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={onDone}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      {/* Camera View */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      </View>

      {/* Hint */}
      <Text style={styles.hint}>Align the QR code inside the box</Text>

      {/* Scan Again Button */}
      {scanned && (
        <Pressable style={styles.button} onPress={resetScan}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 80
  },
  cameraWrapper: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#C21F4C'
  },
  camera: {
    width: 320,
    height: 320
  },
  hint: {
    color: '#444',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  button: {
    marginTop: 20,
    backgroundColor: '#C21F4C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#0006',
    padding: 8,
    borderRadius: 6
  },
  backButtonText: { color: '#fff', fontSize: 16 },
  permissionText: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
    fontSize: 16
  }
});
