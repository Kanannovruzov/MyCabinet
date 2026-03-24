import { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const TEAL = '#00d4c8';

function Wave({ delay, y, opacity: baseOp, speed = 8000 }: { delay: number; y: number; opacity: number; speed?: number }) {
  const translateX = useRef(new Animated.Value(-width)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, { toValue: width, duration: speed, delay, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.wave, { top: y, opacity: baseOp, transform: [{ translateX }] }]}>
      <View style={styles.waveLine} />
    </Animated.View>
  );
}

export default function OceanWaves() {
  return (
    <>
      <Wave delay={0} y={height * 0.12} opacity={0.06} speed={9000} />
      <Wave delay={2000} y={height * 0.3} opacity={0.04} speed={7000} />
      <Wave delay={4000} y={height * 0.48} opacity={0.03} speed={10000} />
      <Wave delay={1000} y={height * 0.66} opacity={0.05} speed={8000} />
      <Wave delay={3000} y={height * 0.84} opacity={0.03} speed={11000} />
    </>
  );
}

const styles = StyleSheet.create({
  wave: { position: 'absolute', left: 0, width: width * 2, height: 2 },
  waveLine: { width: '100%', height: 2, borderRadius: 1, backgroundColor: TEAL },
});
