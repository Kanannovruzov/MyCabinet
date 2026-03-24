import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.profile();
      if (res['ok'] == true) _profile = res['item'];
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;
    final auth = context.watch<AuthProvider>();

    if (_loading) return Scaffold(backgroundColor: c.bg, body: Center(child: CircularProgressIndicator(color: c.teal)));

    final p = _profile;
    final nameAz = p?['name_az'] ?? auth.nameAz ?? '---';
    final nameEn = p?['name_en'] ?? auth.nameEn ?? '';
    final seamanId = p?['seaman_id'] ?? auth.seamanId ?? '';
    final unikal = p?['unikal'] ?? p?['colID'];
    final photoUrl = unikal != null ? '$baseUrl/image/$unikal' : auth.photoUrl;

    return Scaffold(
      backgroundColor: c.bg,
      body: Stack(
        children: [
          OceanWaves(color: c.teal),
          SafeArea(
            child: RefreshIndicator(
              color: c.teal,
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Profil', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
                      GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/settings'),
                        child: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: c.glass, border: Border.all(color: c.glassBorder)),
                          child: Icon(Icons.settings_outlined, size: 20, color: c.teal),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 90, height: 90,
                          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: c.teal, width: 3)),
                          child: ClipOval(
                            child: photoUrl != null
                                ? Image.network(photoUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _initials(nameAz, c))
                                : _initials(nameAz, c),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(nameAz, style: TextStyle(color: c.text, fontSize: 20, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                        if (nameEn.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(nameEn, style: TextStyle(color: c.muted, fontSize: 13)),
                        ],
                        if (seamanId.toString().isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), color: c.teal.withOpacity(0.12), border: Border.all(color: c.teal.withOpacity(0.3))),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.tag, size: 14, color: c.teal),
                              const SizedBox(width: 6),
                              Text('ID: $seamanId', style: TextStyle(color: c.teal, fontSize: 12, fontWeight: FontWeight.w700)),
                            ]),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  _section('Şəxsi məlumat', Icons.person_outline, c, [
                    _infoRow('FIN', p?['fin'] ?? '', c),
                    _infoRow('Doğum tarixi', p?['dob'] ?? '', c),
                    _infoRow('Cins', p?['gender'] ?? '', c),
                  ]),
                  const SizedBox(height: 16),
                  _section('Əlaqə', Icons.phone_outlined, c, [
                    _infoRow('E-poçt', p?['email'] ?? '', c),
                    _infoRow('Telefon', p?['phone1'] ?? '', c),
                    if (p?['phone2'] != null && p!['phone2'].toString().isNotEmpty) _infoRow('Telefon 2', p['phone2'], c),
                  ]),
                  const SizedBox(height: 16),
                  _section('Dənizçi', Icons.anchor, c, [
                    _infoRow('Vəzifə', p?['crew'] ?? '', c),
                    _infoRow('Təşkilat', p?['org'] ?? '', c),
                    _infoRow('Verilmə tarixi', p?['seaman_issue'] ?? '', c),
                    _infoRow('Etibarlıdır', p?['seaman_valid'] ?? '', c),
                  ]),
                  const SizedBox(height: 16),
                  _settingsRow(c),
                  const SizedBox(height: 16),
                  _logoutBtn(c, auth),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _initials(String name, dynamic c) {
    final i = name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    return Container(color: c.teal.withOpacity(0.12), alignment: Alignment.center, child: Text(i, style: TextStyle(color: c.teal, fontSize: 28, fontWeight: FontWeight.w800)));
  }

  Widget _section(String title, IconData icon, dynamic c, List<Widget> rows) {
    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: c.cardBorder), color: c.cardBg),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
            child: Row(children: [
              Container(width: 32, height: 32, decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), color: c.teal.withOpacity(0.15)), child: Icon(icon, size: 16, color: c.teal)),
              const SizedBox(width: 10),
              Text(title, style: TextStyle(color: c.text, fontSize: 15, fontWeight: FontWeight.w700)),
            ]),
          ),
          ...rows,
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, dynamic c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.divider, width: 1))),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: c.muted, fontSize: 12, fontWeight: FontWeight.w500)),
        Text(value, style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _settingsRow(dynamic c) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/settings'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: c.cardBorder), color: c.cardBg),
        child: Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: c.teal.withOpacity(0.12)), child: Icon(Icons.settings_outlined, size: 20, color: c.teal)),
          const SizedBox(width: 12),
          Expanded(child: Text('Tənzimləmələr', style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600))),
          Icon(Icons.chevron_right, size: 20, color: c.muted),
        ]),
      ),
    );
  }

  Widget _logoutBtn(dynamic c, AuthProvider auth) {
    return GestureDetector(
      onTap: () async {
        await auth.clearAuth();
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/login');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.red.withOpacity(0.3)), color: c.red.withOpacity(0.08)),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.logout, size: 18, color: c.red),
          const SizedBox(width: 8),
          Text('Çıxış et', style: TextStyle(color: c.red, fontSize: 15, fontWeight: FontWeight.w700)),
        ]),
      ),
    );
  }
}
