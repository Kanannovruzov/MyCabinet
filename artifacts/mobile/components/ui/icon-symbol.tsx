import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING: IconMapping = {
  'house.fill': 'home',
  'rosette': 'workspace-premium',
  'book.fill': 'menu-book',
  'briefcase.fill': 'work',
  'person.fill': 'person',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bell.fill': 'notifications',
  'doc.fill': 'description',
  'star.fill': 'star',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'arrow.left': 'arrow-back',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = (MAPPING[name] ?? 'help') as ComponentProps<typeof MaterialIcons>['name'];
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
