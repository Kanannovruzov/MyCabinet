import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/certificates_screen.dart';
import 'screens/trainings_screen.dart';
import 'screens/services_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/documents_screen.dart';
import 'screens/feedback_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()..init()),
      ],
      child: const MyCabinetApp(),
    ),
  );
}

class MyCabinetApp extends StatelessWidget {
  const MyCabinetApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();

    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarBrightness: theme.isDark ? Brightness.dark : Brightness.light,
      statusBarIconBrightness: theme.isDark ? Brightness.light : Brightness.dark,
    ));

    return MaterialApp(
      title: 'DDLA MyCabinet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: theme.isDark ? Brightness.dark : Brightness.light,
        scaffoldBackgroundColor: theme.colors.bg,
        fontFamily: 'Roboto',
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const SplashScreen(),
        '/login': (_) => const LoginScreen(),
        '/home': (_) => const MainTabScreen(),
        '/notifications': (_) => const NotificationsScreen(),
        '/documents': (_) => const DocumentsScreen(),
        '/feedback': (_) => const FeedbackScreen(),
        '/settings': (_) => const SettingsScreen(),
      },
    );
  }
}

class MainTabScreen extends StatefulWidget {
  const MainTabScreen({super.key});

  @override
  State<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends State<MainTabScreen> {
  int _currentIndex = 0;

  final _screens = const [
    HomeScreen(),
    CertificatesScreen(),
    TrainingsScreen(),
    ServicesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: c.bg2,
          border: Border(top: BorderSide(color: c.divider, width: 1)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _tab(Icons.home_rounded, 'Ana səhifə', 0, c),
                _tab(Icons.workspace_premium, 'Sertifikat', 1, c),
                _tab(Icons.menu_book_rounded, 'Təlim', 2, c),
                _tab(Icons.settings_rounded, 'Xidmət', 3, c),
                _tab(Icons.person_rounded, 'Profil', 4, c),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _tab(IconData icon, String label, int index, dynamic c) {
    final active = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: active ? c.teal : c.muted),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                color: active ? c.teal : c.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
