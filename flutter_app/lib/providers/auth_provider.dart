import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';

class AuthProvider extends ChangeNotifier {
  String? session;
  String? pin;
  String? nameAz;
  String? nameEn;
  String? seamanId;
  String? photoUrl;
  bool loaded = false;

  bool get isLoggedIn => pin != null;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    pin = prefs.getString('pin');
    session = prefs.getString('session');
    nameAz = prefs.getString('nameAz');
    nameEn = prefs.getString('nameEn');
    seamanId = prefs.getString('seamanId');
    photoUrl = prefs.getString('photoUrl');
    if (pin != null) {
      api.setAuth(pin!, session ?? pin!);
    }
    loaded = true;
    notifyListeners();
  }

  Future<void> setAuth(String newPin, {
    String? newSession,
    String? newNameAz,
    String? newNameEn,
    String? newSeamanId,
    String? newPhotoUrl,
  }) async {
    pin = newPin;
    session = newSession ?? newPin;
    nameAz = newNameAz;
    nameEn = newNameEn;
    seamanId = newSeamanId;
    photoUrl = newPhotoUrl;
    api.setAuth(pin!, session!);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pin', pin!);
    await prefs.setString('session', session!);
    if (nameAz != null) await prefs.setString('nameAz', nameAz!);
    if (nameEn != null) await prefs.setString('nameEn', nameEn!);
    if (seamanId != null) await prefs.setString('seamanId', seamanId!);
    if (photoUrl != null) await prefs.setString('photoUrl', photoUrl!);
    notifyListeners();
  }

  Future<void> clearAuth() async {
    pin = null;
    session = null;
    nameAz = null;
    nameEn = null;
    seamanId = null;
    photoUrl = null;
    api.clearAuth();
    final prefs = await SharedPreferences.getInstance();
    for (final k in ['pin', 'session', 'nameAz', 'nameEn', 'seamanId', 'photoUrl']) {
      await prefs.remove(k);
    }
    notifyListeners();
  }
}
