import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:local_auth/local_auth.dart';
import '../providers/theme_provider.dart';
import '../widgets/ocean_waves.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _bioAvailable = false;
  String _bioType = 'Biometrik';
  IconData _bioIcon = Icons.fingerprint;

  @override
  void initState() {
    super.initState();
    _checkBio();
  }

  Future<void> _checkBio() async {
    final auth = LocalAuthentication();
    try {
      final available = await auth.canCheckBiometrics;
      final enrolled = await auth.isDeviceSupported();
      _bioAvailable = available && enrolled;
      if (available) {
        final types = await auth.getAvailableBiometrics();
        if (types.contains(BiometricType.face)) {
          _bioType = 'Üz tanıma';
          _bioIcon = Icons.face;
        } else if (types.contains(BiometricType.fingerprint)) {
          _bioType = 'Barmaq izi';
          _bioIcon = Icons.fingerprint;
        }
      }
    } catch (_) {}
    if (mounted) setState(() {});
  }

  Future<void> _toggleBio(bool value, ThemeProvider theme) async {
    if (value) {
      final auth = LocalAuthentication();
      try {
        final ok = await auth.authenticate(localizedReason: 'Biometrik girişi aktivləşdirin');
        if (ok) await theme.setBiometricEnabled(true);
      } catch (_) {}
    } else {
      await theme.setBiometricEnabled(false);
    }
  }

  void _togglePin(bool value, ThemeProvider theme) {
    if (value) {
      _showPinModal(theme);
    } else {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Parolu söndür'),
          content: const Text('Parol kilidi söndürülsün?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Ləğv et')),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);
                await theme.setPinEnabled(false);
                await theme.setAppPin(null);
              },
              child: const Text('Söndür', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      );
    }
  }

  void _showPinModal(ThemeProvider theme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PinEntrySheet(
        colors: theme.colors,
        onConfirm: (pin) async {
          Navigator.pop(context);
          await theme.setAppPin(pin);
          await theme.setPinEnabled(true);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Parol uğurla təyin edildi')));
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final c = theme.colors;

    return Scaffold(
      backgroundColor: c.bg,
      body: Stack(
        children: [
          OceanWaves(color: c.teal),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                  child: Row(children: [
                    _backBtn(c),
                    const SizedBox(width: 10),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Tənzimləmələr', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
                      Text('Proqram parametrləri', style: TextStyle(color: c.muted, fontSize: 12)),
                    ])),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass),
                      child: Row(children: [Icon(Icons.settings, size: 12, color: c.teal), const SizedBox(width: 6), Text('v1.0', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1))]),
                    ),
                  ]),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                    children: [
                      _sectionCard(c, 'Təhlükəsizlik', Icons.shield_outlined, c.teal, [
                        _settingRow(c, Icons.lock_outline, c.blue, 'Parol kilidi',
                          theme.pinEnabled ? '4 rəqəmli parol aktivdir' : 'Tətbiqə giriş üçün parol təyin edin',
                          Switch(
                            value: theme.pinEnabled,
                            onChanged: (v) => _togglePin(v, theme),
                            activeColor: c.blue,
                            activeTrackColor: c.blue.withOpacity(0.6),
                          ),
                          showBorder: true,
                          trailing: theme.pinEnabled ? GestureDetector(
                            onTap: () => _showPinModal(theme),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), border: Border.all(color: c.blue.withOpacity(0.4)), color: c.blue.withOpacity(0.1)),
                              child: Text('Dəyiş', style: TextStyle(color: c.blue, fontSize: 11, fontWeight: FontWeight.w700)),
                            ),
                          ) : null,
                        ),
                        _settingRow(c, _bioIcon, _bioAvailable ? c.teal : c.muted, _bioType,
                          _bioAvailable ? 'Tətbiqə daxil olmaq üçün istifadə edin' : 'Bu cihazda dəstəklənmir',
                          Opacity(
                            opacity: _bioAvailable ? 1.0 : 0.4,
                            child: Switch(
                              value: theme.biometricEnabled,
                              onChanged: _bioAvailable ? (v) => _toggleBio(v, theme) : null,
                              activeColor: c.teal,
                              activeTrackColor: c.teal.withOpacity(0.6),
                            ),
                          ),
                          showBorder: false,
                        ),
                      ]),
                      const SizedBox(height: 16),
                      _sectionCard(c, 'Görünüş', theme.isDark ? Icons.nightlight_round : Icons.wb_sunny, theme.isDark ? const Color(0xFFEAB308) : c.blue, [
                        _settingRow(c, theme.isDark ? Icons.nightlight_round : Icons.wb_sunny, theme.isDark ? const Color(0xFFEAB308) : c.blue,
                          theme.isDark ? 'Gecə rejimi' : 'Gündüz rejimi',
                          theme.isDark ? 'Qaranlıq tema aktivdir' : 'İşıqlı tema aktivdir',
                          Switch(
                            value: theme.isDark,
                            onChanged: (_) => theme.toggleTheme(),
                            activeColor: const Color(0xFFEAB308),
                            activeTrackColor: const Color(0xFFEAB308).withOpacity(0.6),
                          ),
                          showBorder: false,
                        ),
                      ]),
                      const SizedBox(height: 16),
                      _sectionCard(c, 'Haqqında', Icons.info_outline, c.blue, [
                        _infoRow(c, 'Tətbiq', 'DDLA MyCabinet'),
                        _infoRow(c, 'Versiya', '1.0.0'),
                        _infoRow(c, 'Tərtibatçı', 'DDLA', last: true),
                      ]),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionCard(dynamic c, String title, IconData icon, Color iconColor, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: c.cardBorder), color: c.cardBg),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
          child: Row(children: [
            Container(width: 32, height: 32, decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), color: iconColor.withOpacity(0.15)), child: Icon(icon, size: 16, color: iconColor)),
            const SizedBox(width: 10),
            Text(title, style: TextStyle(color: c.text, fontSize: 15, fontWeight: FontWeight.w700)),
          ]),
        ),
        ...children,
      ]),
    );
  }

  Widget _settingRow(dynamic c, IconData icon, Color iconColor, String label, String desc, Widget toggle, {bool showBorder = true, Widget? trailing}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(border: showBorder ? Border(bottom: BorderSide(color: c.divider)) : null),
      child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: iconColor.withOpacity(0.12)), child: Icon(icon, size: 20, color: iconColor)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(desc, style: TextStyle(color: c.muted, fontSize: 11)),
        ])),
        if (trailing != null) ...[trailing, const SizedBox(width: 8)],
        toggle,
      ]),
    );
  }

  Widget _infoRow(dynamic c, String label, String value, {bool last = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: BoxDecoration(border: last ? null : Border(bottom: BorderSide(color: c.divider))),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: c.muted, fontSize: 12, fontWeight: FontWeight.w500)),
        Text(value, style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _backBtn(dynamic c) {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: c.glass, border: Border.all(color: c.glassBorder)),
        child: Icon(Icons.arrow_back, size: 22, color: c.teal),
      ),
    );
  }
}

class _PinEntrySheet extends StatefulWidget {
  final dynamic colors;
  final Function(String) onConfirm;

  const _PinEntrySheet({required this.colors, required this.onConfirm});

  @override
  State<_PinEntrySheet> createState() => _PinEntrySheetState();
}

class _PinEntrySheetState extends State<_PinEntrySheet> {
  String _step = 'enter';
  String _pin = '';
  String _confirmPin = '';
  String _error = '';

  void _handleDigit(String d) {
    setState(() {
      _error = '';
      if (_step == 'enter') {
        _pin += d;
        if (_pin.length == 4) Future.delayed(const Duration(milliseconds: 200), () => setState(() => _step = 'confirm'));
      } else {
        _confirmPin += d;
        if (_confirmPin.length == 4) {
          if (_confirmPin == _pin) {
            widget.onConfirm(_pin);
          } else {
            _error = 'Parollar uyğun gəlmir';
            _confirmPin = '';
          }
        }
      }
    });
  }

  void _handleDelete() {
    setState(() {
      _error = '';
      if (_step == 'enter') {
        if (_pin.isNotEmpty) _pin = _pin.substring(0, _pin.length - 1);
      } else {
        if (_confirmPin.isNotEmpty) _confirmPin = _confirmPin.substring(0, _confirmPin.length - 1);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.colors;
    final currentPin = _step == 'enter' ? _pin : _confirmPin;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: c.bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: c.glass, border: Border.all(color: c.glassBorder)),
                    child: Icon(Icons.close, size: 20, color: c.teal),
                  ),
                ),
              ),
            ),
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), color: c.teal.withOpacity(0.12), border: Border.all(color: c.teal.withOpacity(0.3))),
              child: Icon(Icons.lock, size: 28, color: c.teal),
            ),
            const SizedBox(height: 20),
            Text(_step == 'enter' ? 'Parol təyin edin' : 'Parolu təsdiqləyin', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text('4 rəqəmli parol daxil edin', style: TextStyle(color: c.muted, fontSize: 13)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (i) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 8),
                width: 16, height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: c.teal.withOpacity(0.4), width: 2),
                  color: i < currentPin.length ? c.teal : Colors.transparent,
                ),
              )),
            ),
            if (_error.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error, style: TextStyle(color: c.red, fontSize: 13, fontWeight: FontWeight.w600))),
            const SizedBox(height: 30),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (final row in [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: row.map((d) {
                          if (d.isEmpty) return const SizedBox(width: 72, height: 72);
                          if (d == 'del') {
                            return GestureDetector(
                              onTap: _handleDelete,
                              child: SizedBox(width: 72, height: 72, child: Icon(Icons.backspace_outlined, size: 22, color: c.muted)),
                            );
                          }
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: GestureDetector(
                              onTap: () => _handleDigit(d),
                              child: Container(
                                width: 72, height: 72,
                                decoration: BoxDecoration(shape: BoxShape.circle, color: c.glass, border: Border.all(color: c.glassBorder)),
                                alignment: Alignment.center,
                                child: Text(d, style: TextStyle(color: c.text, fontSize: 28, fontWeight: FontWeight.w500)),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
