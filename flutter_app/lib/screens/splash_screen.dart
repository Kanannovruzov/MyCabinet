import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/ocean_waves.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _ringController;
  late AnimationController _textController;
  late AnimationController _glowController;

  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _ringScale;
  late Animation<double> _ringOpacity;
  late Animation<double> _ring2Scale;
  late Animation<double> _ring2Opacity;
  late Animation<double> _textOpacity;

  @override
  void initState() {
    super.initState();

    _glowController = AnimationController(vsync: this, duration: const Duration(seconds: 3))
      ..repeat(reverse: true);

    _logoController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _logoScale = Tween(begin: 0.3, end: 1.0).animate(CurvedAnimation(parent: _logoController, curve: Curves.elasticOut));
    _logoOpacity = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _logoController, curve: Curves.easeIn));

    _ringController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _ringScale = Tween(begin: 0.2, end: 1.0).animate(CurvedAnimation(parent: _ringController, curve: Curves.easeOut));
    _ringOpacity = Tween(begin: 0.0, end: 0.6).animate(_ringController);
    _ring2Scale = Tween(begin: 0.2, end: 1.0).animate(CurvedAnimation(parent: _ringController, curve: Curves.easeOut));
    _ring2Opacity = Tween(begin: 0.0, end: 0.3).animate(_ringController);

    _textController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _textOpacity = Tween(begin: 0.0, end: 1.0).animate(_textController);

    _startAnimation();
  }

  Future<void> _startAnimation() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _logoController.forward();
    _ringController.forward();
    await Future.delayed(const Duration(milliseconds: 800));
    _textController.forward();
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    final auth = context.read<AuthProvider>();
    if (auth.isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  void dispose() {
    _logoController.dispose();
    _ringController.dispose();
    _textController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const bg = Color(0xFF040C1A);
    const teal = Color(0xFF00D4C8);
    const blue = Color(0xFF0057B7);

    return Scaffold(
      backgroundColor: bg,
      body: Stack(
        children: [
          Positioned(top: -100, left: -50, child: Container(width: 300, height: 300, decoration: BoxDecoration(shape: BoxShape.circle, color: blue.withOpacity(0.1)))),
          Positioned(bottom: -60, right: -40, child: Container(width: 250, height: 250, decoration: BoxDecoration(shape: BoxShape.circle, color: teal.withOpacity(0.08)))),
          const OceanWaves(),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    ScaleTransition(
                      scale: _ring2Scale,
                      child: FadeTransition(
                        opacity: _ring2Opacity,
                        child: Container(
                          width: 240, height: 240,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: teal.withOpacity(0.08)),
                            color: teal.withOpacity(0.02),
                          ),
                        ),
                      ),
                    ),
                    ScaleTransition(
                      scale: _ringScale,
                      child: FadeTransition(
                        opacity: _ringOpacity,
                        child: Container(
                          width: 180, height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: teal.withOpacity(0.15)),
                            color: teal.withOpacity(0.04),
                          ),
                        ),
                      ),
                    ),
                    AnimatedBuilder(
                      animation: _glowController,
                      builder: (_, __) => Container(
                        width: 130, height: 130,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: teal.withOpacity(0.05 + _glowController.value * 0.1),
                        ),
                      ),
                    ),
                    ScaleTransition(
                      scale: _logoScale,
                      child: FadeTransition(
                        opacity: _logoOpacity,
                        child: Container(
                          width: 120, height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [BoxShadow(color: teal.withOpacity(0.5), blurRadius: 30)],
                          ),
                          child: ClipOval(child: Image.asset('assets/images/ddla-logo.png', fit: BoxFit.cover)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                FadeTransition(
                  opacity: _textOpacity,
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: teal, width: 1.5),
                          color: teal.withOpacity(0.08),
                        ),
                        child: const Text('DDLA', style: TextStyle(color: teal, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 3)),
                      ),
                      const SizedBox(height: 12),
                      RichText(
                        text: const TextSpan(children: [
                          TextSpan(text: 'My', style: TextStyle(color: teal, fontSize: 46, fontWeight: FontWeight.w800, letterSpacing: -1)),
                          TextSpan(text: ' Cabinet', style: TextStyle(color: Colors.white, fontSize: 46, fontWeight: FontWeight.w300, letterSpacing: -1)),
                        ]),
                      ),
                      const SizedBox(height: 8),
                      Text('Dənizçi Şəxsi Kabineti', style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 14, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Text('Dövlət Dəniz və Liman Agentliyi', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(height: 3, color: teal.withOpacity(0.5)),
          ),
        ],
      ),
    );
  }
}
