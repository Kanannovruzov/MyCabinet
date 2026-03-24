import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../theme/colors.dart';

class ThemeProvider extends ChangeNotifier {
  bool isDark = true;
  bool biometricEnabled = false;
  bool pinEnabled = false;
  String? appPin;
  bool loaded = false;

  final _secureStorage = const FlutterSecureStorage();

  AppColors get colors => isDark ? AppColors.dark : AppColors.light;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    isDark = prefs.getString('theme') != 'light';
    biometricEnabled = prefs.getString('biometric') == '1';
    pinEnabled = prefs.getString('pinEnabled') == '1';
    try {
      appPin = await _secureStorage.read(key: 'appPin');
    } catch (_) {
      appPin = prefs.getString('appPin');
    }
    loaded = true;
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    isDark = !isDark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme', isDark ? 'dark' : 'light');
    notifyListeners();
  }

  Future<void> setBiometricEnabled(bool v) async {
    biometricEnabled = v;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('biometric', v ? '1' : '0');
    notifyListeners();
  }

  Future<void> setPinEnabled(bool v) async {
    pinEnabled = v;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pinEnabled', v ? '1' : '0');
    notifyListeners();
  }

  Future<void> setAppPin(String? v) async {
    appPin = v;
    try {
      if (v != null) {
        await _secureStorage.write(key: 'appPin', value: v);
      } else {
        await _secureStorage.delete(key: 'appPin');
      }
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      if (v != null) {
        await prefs.setString('appPin', v);
      } else {
        await prefs.remove('appPin');
      }
    }
    notifyListeners();
  }
}
