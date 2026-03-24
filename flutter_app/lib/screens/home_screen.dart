import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _certs = [];
  int _unread = 0;
  bool _loading = true;
  bool _error = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = false; });
    try {
      final results = await Future.wait([
        api.certificates(),
        api.notifications(),
      ]);
      final certsRes = results[0];
      final notifRes = results[1];
      if (certsRes['ok'] == true) _certs = certsRes['items'] ?? [];
      if (notifRes['ok'] == true) _unread = notifRes['unread'] ?? 0;
    } catch (_) {
      _error = true;
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;
    final auth = context.watch<AuthProvider>();
    final displayName = auth.nameAz ?? auth.pin ?? '---';
    final initials = (auth.nameAz ?? '??').split(' ').map((w) => w.isNotEmpty ? w[0] : '').join().substring(0, 2).toUpperCase();

    final activeCerts = _certs.where((cert) {
      final daysLabel = cert['days_label'];
      final daysLeft = cert['days_left'];
      return daysLabel == 'Müddətsiz' || (daysLeft is num && daysLeft > 0);
    }).toList();
    final expiredCount = _certs.length - activeCerts.length;

    if (_loading) {
      return Scaffold(backgroundColor: c.bg, body: Center(child: CircularProgressIndicator(color: c.teal)));
    }

    return Scaffold(
      backgroundColor: c.bg,
      body: Stack(
        children: [
          Positioned(top: -80, right: -60, child: Container(width: 200, height: 200, decoration: BoxDecoration(shape: BoxShape.circle, color: c.teal.withOpacity(0.04)))),
          Positioned(bottom: 100, left: -40, child: Container(width: 160, height: 160, decoration: BoxDecoration(shape: BoxShape.circle, color: c.blue.withOpacity(0.05)))),
          OceanWaves(color: c.teal),
          SafeArea(
            child: RefreshIndicator(
              color: c.teal,
              onRefresh: _load,
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () {},
                          child: Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: c.teal, width: 2),
                              color: c.teal.withOpacity(0.12),
                            ),
                            alignment: Alignment.center,
                            child: auth.photoUrl != null
                                ? ClipOval(child: Image.network(auth.photoUrl!, width: 48, height: 48, fit: BoxFit.cover))
                                : Text(initials, style: TextStyle(color: c.teal, fontSize: 16, fontWeight: FontWeight.w800)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Xoş gəldiniz', style: TextStyle(color: c.muted, fontSize: 12, fontWeight: FontWeight.w500)),
                              Text(displayName, style: TextStyle(color: c.text, fontSize: 18, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/notifications'),
                          child: Container(
                            width: 46, height: 46,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: c.glassBorder),
                              color: c.glass,
                            ),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Icon(Icons.notifications_outlined, size: 20, color: c.teal),
                                if (_unread > 0)
                                  Positioned(
                                    top: 8, right: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 4),
                                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: const Color(0xFFEF4444)),
                                      alignment: Alignment.center,
                                      child: Text('$_unread', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  _buildWelcomeCard(c),
                  const SizedBox(height: 16),
                  _buildActionsGrid(c),
                  const SizedBox(height: 12),
                  _buildMiniActions(c),
                  const SizedBox(height: 20),
                  _buildCertsSection(c),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard(dynamic c) {
    final activeCerts = _certs.where((cert) => cert['days_label'] == 'Müddətsiz' || (cert['days_left'] is num && cert['days_left'] > 0)).toList();
    final expiredCount = _certs.length - activeCerts.length;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: c.glassBorder),
        color: c.cardBg,
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), border: Border.all(color: c.glassBorder), color: c.glass),
                child: Row(children: [Icon(Icons.anchor, size: 14, color: c.teal), const SizedBox(width: 6), Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.5))]),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: c.green.withOpacity(0.3)), color: c.green.withOpacity(0.12)),
                child: Row(children: [Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: c.green)), const SizedBox(width: 5), Text('Aktiv', style: TextStyle(color: c.green, fontSize: 11, fontWeight: FontWeight.w700))]),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Align(alignment: Alignment.centerLeft, child: Text('Dənizçi Kabineti', style: TextStyle(color: c.text, fontSize: 20, fontWeight: FontWeight.w700))),
          const SizedBox(height: 4),
          Align(alignment: Alignment.centerLeft, child: Text('Sertifikat və sənədlərinizi idarə edin', style: TextStyle(color: c.muted, fontSize: 13))),
          Padding(padding: const EdgeInsets.symmetric(vertical: 14), child: Divider(color: c.divider, height: 1)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _stat('${_certs.length}', 'Sertifikat', c.text, c),
              Container(width: 1, height: 32, color: c.divider),
              _stat('${activeCerts.length}', 'Aktiv', c.green, c),
              Container(width: 1, height: 32, color: c.divider),
              _stat('$expiredCount', 'Bitmiş', expiredCount > 0 ? c.red : c.muted, c),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String num, String label, Color color, dynamic c) {
    return Column(
      children: [
        Text(num, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 3),
        Text(label, style: TextStyle(color: c.muted, fontSize: 11, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildActionsGrid(dynamic c) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: [
          _actionCard(Icons.workspace_premium, 'Sertifikatlar', c.teal, '${_certs.length}', c, () {}),
          _actionCard(Icons.menu_book_rounded, 'Təlimlər', c.blue, null, c, () {}),
          _actionCard(Icons.description_rounded, 'Sənədlər', c.yellow, null, c, () => Navigator.pushNamed(context, '/documents')),
          _actionCard(Icons.settings_rounded, 'Xidmətlər', c.green, null, c, () {}),
        ],
      ),
    );
  }

  Widget _actionCard(IconData icon, String title, Color color, String? badge, dynamic c, VoidCallback onTap) {
    final w = (MediaQuery.of(context).size.width - 42) / 2;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: w,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: c.cardBorder), color: c.cardBg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: color.withOpacity(0.12)),
              child: Icon(icon, size: 22, color: color),
            ),
            const SizedBox(height: 8),
            Text(title, style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w600)),
            if (badge != null) Text(badge, style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniActions(dynamic c) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(child: _miniBtn(Icons.mail_outline, 'Müraciət', c, () => Navigator.pushNamed(context, '/feedback'))),
          const SizedBox(width: 10),
          Expanded(child: _miniBtn(Icons.notifications_outlined, 'Bildirişlər', c, () => Navigator.pushNamed(context, '/notifications'))),
        ],
      ),
    );
  }

  Widget _miniBtn(IconData icon, String label, dynamic c, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: c.glassBorder), color: c.glass),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: c.teal),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: c.teal, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildCertsSection(dynamic c) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: c.teal)),
              const SizedBox(width: 8),
              Text('Son sertifikatlar', style: TextStyle(color: c.text, fontSize: 16, fontWeight: FontWeight.w700)),
              const Spacer(),
              Text('Hamısı ›', style: TextStyle(color: c.teal, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 14),
          if (_error)
            _errorBox(c)
          else if (_certs.isEmpty)
            _emptyBox(c)
          else
            ..._certs.take(4).map((cert) => _miniCertCard(cert, c)),
        ],
      ),
    );
  }

  Widget _miniCertCard(dynamic cert, dynamic c) {
    final unlimited = cert['days_label'] == 'Müddətsiz';
    final percent = (cert['percent'] ?? 0).toDouble();
    final daysLeft = cert['days_left'];
    final color = unlimited ? c.teal : (percent > 50 ? const Color(0xFF22C55E) : (percent > 20 ? const Color(0xFFEAB308) : const Color(0xFFEF4444)));

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.cardBorder), color: c.cardBg),
      child: Row(
        children: [
          Container(width: 4, decoration: BoxDecoration(color: color, borderRadius: const BorderRadius.only(topLeft: Radius.circular(14), bottomLeft: Radius.circular(14)))),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withOpacity(0.4)), color: color.withOpacity(0.15)),
                        child: Row(children: [
                          Container(width: 5, height: 5, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
                          const SizedBox(width: 5),
                          Text(unlimited ? 'Müddətsiz' : '$daysLeft gün', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                      if (!unlimited) Text('${percent.toInt()}%', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(cert['cert_name'] ?? '', style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w600), maxLines: 2, overflow: TextOverflow.ellipsis),
                  if (!unlimited) ...[
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(1.5),
                      child: LinearProgressIndicator(value: percent / 100, backgroundColor: c.divider, color: color, minHeight: 3),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _errorBox(dynamic c) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.red.withOpacity(0.25))),
      child: Column(children: [
        Icon(Icons.warning_amber_rounded, size: 24, color: c.red),
        const SizedBox(height: 10),
        Text('Məlumatlar yüklənə bilmədi', style: TextStyle(color: c.muted, fontSize: 14)),
      ]),
    );
  }

  Widget _emptyBox(dynamic c) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(children: [
        Icon(Icons.inbox, size: 32, color: c.muted),
        const SizedBox(height: 8),
        Text('Sertifikat tapılmadı', style: TextStyle(color: c.muted, fontSize: 14)),
      ]),
    );
  }
}
