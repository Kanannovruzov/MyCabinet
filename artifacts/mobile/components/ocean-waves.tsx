import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

function generateWavePath(w: number, h: number, amplitude: number, frequency: number, phase: number): string {
  let d = `M 0 ${h}`;
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = h / 2 + Math.sin((i / steps) * Math.PI * 2 * frequency + phase) * amplitude;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${w} ${h} Z`;
  return d;
}

function WaveLayer({
  delay,
  y,
  opacity: baseOp,
  speed = 12000,
  amplitude = 8,
  frequency = 2,
  color = '#00d4c8',
}: {
  delay: number;
  y: number;
  opacity: number;
  speed?: number;
  amplitude?: number;
  frequency?: number;
  color?: string;
}) {
  const translateX = useRef(new Animated.Value(-width * 0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 0,
          duration: speed,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -width * 0.5,
          duration: speed,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const waveW = width * 2;
  const waveH = amplitude * 3;
  const path1 = generateWavePath(waveW, waveH, amplitude, frequency, 0);
  const path2 = generateWavePath(waveW, waveH, amplitude * 0.6, frequency * 1.5, 1.2);

  return (
    <AnimatedSvg
      width={waveW}
      height={waveH}
      style={[
        styles.wave,
        {
          top: y,
          opacity: baseOp,
          transform: [{ translateX }],
        },
      ]}
    >
      <Path d={path1} fill={color} fillOpacity={0.5} />
      <Path d={path2} fill={color} fillOpacity={0.3} />
    </AnimatedSvg>
  );
}

export default function OceanWaves({ color = '#00d4c8' }: { color?: string }) {
  return (
    <View style={styles.container} pointerEvents="none">
      <WaveLayer delay={0} y={height * 0.08} opacity={0.08} speed={14000} amplitude={10} frequency={2} color={color} />
      <WaveLayer delay={1500} y={height * 0.25} opacity={0.06} speed={11000} amplitude={12} frequency={1.5} color={color} />
      <WaveLayer delay={3000} y={height * 0.45} opacity={0.05} speed={16000} amplitude={8} frequency={2.5} color={color} />
      <WaveLayer delay={800} y={height * 0.62} opacity={0.06} speed={13000} amplitude={14} frequency={1.8} color={color} />
      <WaveLayer delay={2200} y={height * 0.8} opacity={0.04} speed={18000} amplitude={10} frequency={2.2} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    left: 0,
  },
});
