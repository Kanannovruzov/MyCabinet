import 'dart:math';
import 'package:flutter/material.dart';

class OceanWaves extends StatefulWidget {
  final Color? color;

  const OceanWaves({super.key, this.color});

  @override
  State<OceanWaves> createState() => _OceanWavesState();
}

class _OceanWavesState extends State<OceanWaves> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? const Color(0xFF00D4C8);
    return Positioned.fill(
      child: IgnorePointer(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return CustomPaint(
              painter: _WavePainter(
                progress: _controller.value,
                color: color,
              ),
            );
          },
        ),
      ),
    );
  }
}

class _WavePainter extends CustomPainter {
  final double progress;
  final Color color;

  _WavePainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final waves = [
      _WaveConfig(0.15, 0.06, 30, 1.0),
      _WaveConfig(0.30, 0.05, 25, 0.7),
      _WaveConfig(0.45, 0.04, 35, 1.3),
      _WaveConfig(0.60, 0.05, 28, 0.5),
      _WaveConfig(0.75, 0.03, 22, 1.1),
      _WaveConfig(0.88, 0.04, 32, 0.8),
    ];

    for (final wave in waves) {
      final paint = Paint()
        ..color = color.withOpacity(wave.opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;

      final path = Path();
      final y = size.height * wave.yPercent;
      final offset = progress * size.width * wave.speed;

      path.moveTo(0, y);
      for (double x = 0; x <= size.width; x += 2) {
        final dy = sin((x + offset) * 2 * pi / size.width * 2) * wave.amplitude;
        path.lineTo(x, y + dy);
      }

      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _WavePainter old) => old.progress != progress;
}

class _WaveConfig {
  final double yPercent;
  final double opacity;
  final double amplitude;
  final double speed;
  _WaveConfig(this.yPercent, this.opacity, this.amplitude, this.speed);
}
