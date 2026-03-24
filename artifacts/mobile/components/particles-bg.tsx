import { View, StyleSheet } from 'react-native';

const DOTS = [
  { top: '8%',  left: '12%', size: 3,   opacity: 0.6 },
  { top: '14%', left: '78%', size: 2,   opacity: 0.4 },
  { top: '22%', left: '55%', size: 4,   opacity: 0.3 },
  { top: '31%', left: '90%', size: 2,   opacity: 0.5 },
  { top: '38%', left: '6%',  size: 3,   opacity: 0.35 },
  { top: '45%', left: '35%', size: 2,   opacity: 0.25 },
  { top: '52%', left: '68%', size: 5,   opacity: 0.2 },
  { top: '60%', left: '20%', size: 2,   opacity: 0.45 },
  { top: '67%', left: '85%', size: 3,   opacity: 0.3 },
  { top: '74%', left: '47%', size: 2,   opacity: 0.4 },
  { top: '82%', left: '10%', size: 4,   opacity: 0.25 },
  { top: '88%', left: '62%', size: 2,   opacity: 0.5 },
  { top: '5%',  left: '40%', size: 3,   opacity: 0.35 },
  { top: '93%', left: '30%', size: 2,   opacity: 0.3 },
  { top: '18%', left: '25%', size: 2.5, opacity: 0.45 },
];

export default function ParticlesBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {DOTS.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: d.top as any,
            left: d.left as any,
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: '#00d4c8',
            opacity: d.opacity,
          }}
        />
      ))}
    </View>
  );
}
