import 'package:flutter/material.dart';

class AppColors {
  final Color bg;
  final Color bg2;
  final Color surface;
  final Color glass;
  final Color glassBorder;
  final Color teal;
  final Color blue;
  final Color white;
  final Color text;
  final Color textSecondary;
  final Color muted;
  final Color red;
  final Color yellow;
  final Color green;
  final Color cardBg;
  final Color cardBorder;
  final Color divider;
  final Color inputBg;
  final Brightness statusBar;

  const AppColors({
    required this.bg,
    required this.bg2,
    required this.surface,
    required this.glass,
    required this.glassBorder,
    required this.teal,
    required this.blue,
    required this.white,
    required this.text,
    required this.textSecondary,
    required this.muted,
    required this.red,
    required this.yellow,
    required this.green,
    required this.cardBg,
    required this.cardBorder,
    required this.divider,
    required this.inputBg,
    required this.statusBar,
  });

  static const dark = AppColors(
    bg: Color(0xFF060D1A),
    bg2: Color(0xFF0A1628),
    surface: Color(0xD90A1628),
    glass: Color(0x0A00D4C8),
    glassBorder: Color(0x1F00D4C8),
    teal: Color(0xFF00D4C8),
    blue: Color(0xFF0057B7),
    white: Color(0xFFFFFFFF),
    text: Color(0xFFFFFFFF),
    textSecondary: Color(0x73FFFFFF),
    muted: Color(0x73FFFFFF),
    red: Color(0xFFEF4444),
    yellow: Color(0xFFEAB308),
    green: Color(0xFF22C55E),
    cardBg: Color(0xFF0A1628),
    cardBorder: Color(0x1400D4C8),
    divider: Color(0x1A00D4C8),
    inputBg: Color(0x4D000000),
    statusBar: Brightness.light,
  );

  static const light = AppColors(
    bg: Color(0xFFF0F4F8),
    bg2: Color(0xFFFFFFFF),
    surface: Color(0xD9FFFFFF),
    glass: Color(0x0F00D4C8),
    glassBorder: Color(0x2E00D4C8),
    teal: Color(0xFF00A89E),
    blue: Color(0xFF0057B7),
    white: Color(0xFFFFFFFF),
    text: Color(0xFF0F172A),
    textSecondary: Color(0x8C0F172A),
    muted: Color(0x800F172A),
    red: Color(0xFFDC2626),
    yellow: Color(0xFFCA8A04),
    green: Color(0xFF16A34A),
    cardBg: Color(0xFFFFFFFF),
    cardBorder: Color(0x1F00A89E),
    divider: Color(0x2600A89E),
    inputBg: Color(0x0A000000),
    statusBar: Brightness.dark,
  );
}
