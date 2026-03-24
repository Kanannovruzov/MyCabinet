import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});

  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  List<dynamic> _certs = [];
  bool _loading = true;
  bool _error = false;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = false; });
    try {
      final res = await api.certificates();
      if (res['ok'] == true) _certs = res['items'] ?? [];
      else _error = true;
    } catch (_) {
      _error = true;
    }
    setState(() => _loading = false);
  }

  bool _isExpired(dynamic c) {
    final unlimited = c['days_label'] == 'Müddətsiz';
    return !unlimited && (c['days_left'] == 0 || c['status'] == 'Müddəti bitib');
  }

  Color _certColor(dynamic cert) {
    if (_isExpired(cert)) return const Color(0xFFEF4444);
    if (cert['days_label'] == 'Müddətsiz') return const Color(0xFF00D4C8);
    final p = (cert['percent'] ?? 0).toDouble();
    if (p > 50) return const Color(0xFF00D4C8);
    if (p > 20) return const Color(0xFFEAB308);
    return const Color(0xFFEF4444);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;
    final filtered = _certs.where((cert) {
      if (_filter == 'active') return !_isExpired(cert);
      if (_filter == 'expired') return _isExpired(cert);
      return true;
    }).toList();
    final activeCount = _certs.where((cert) => !_isExpired(cert)).length;
    final expiredCount = _certs.length - activeCount;

    if (_loading) return Scaffold(backgroundColor: c.bg, body: Center(child: CircularProgressIndicator(color: c.teal)));

    return Scaffold(
      backgroundColor: c.bg,
      body: Stack(
        children: [
          Positioned(top: -80, right: -60, child: Container(width: 200, height: 200, decoration: BoxDecoration(shape: BoxShape.circle, color: c.teal.withOpacity(0.04)))),
          OceanWaves(color: c.teal),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Sertifikatlar', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
                        Text('${_certs.length} sertifikat', style: TextStyle(color: c.muted, fontSize: 12)),
                      ]),
                      _ddlaPill(c),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _stat('${_certs.length}', 'Cəmi', c.text, c),
                      Container(width: 1, height: 28, color: c.divider),
                      _stat('$activeCount', 'Aktiv', c.green, c),
                      Container(width: 1, height: 28, color: c.divider),
                      _stat('$expiredCount', 'Bitmiş', expiredCount > 0 ? c.red : c.muted, c),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    _filterBtn('Hamısı', 'all', Icons.list, c),
                    const SizedBox(width: 8),
                    _filterBtn('Aktiv', 'active', Icons.check_circle_outline, c),
                    const SizedBox(width: 8),
                    _filterBtn('Bitmiş', 'expired', Icons.error_outline, c),
                  ]),
                ),
                Expanded(
                  child: RefreshIndicator(
                    color: c.teal,
                    onRefresh: _load,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                      itemCount: filtered.length,
                      itemBuilder: (_, i) => _certCard(filtered[i], c),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String num, String label, Color color, dynamic c) {
    return Column(children: [
      Text(num, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.w800)),
      Text(label, style: TextStyle(color: c.muted, fontSize: 10, fontWeight: FontWeight.w500)),
    ]);
  }

  Widget _filterBtn(String label, String key, IconData icon, dynamic c) {
    final active = _filter == key;
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: active ? c.teal : c.cardBorder),
          color: active ? c.teal.withOpacity(0.15) : c.cardBg,
        ),
        child: Row(children: [
          Icon(icon, size: 14, color: active ? c.teal : c.muted),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: active ? c.teal : c.muted, fontSize: 13, fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }

  Widget _certCard(dynamic cert, dynamic c) {
    final color = _certColor(cert);
    final unlimited = cert['days_label'] == 'Müddətsiz';
    final expired = _isExpired(cert);
    final percent = (cert['percent'] ?? 0).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.25)), color: c.cardBg),
      child: Row(
        children: [
          Container(width: 4, decoration: BoxDecoration(color: color, borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)))),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withOpacity(0.4)), color: color.withOpacity(0.18)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
                      const SizedBox(width: 6),
                      Text(unlimited ? 'Müddətsiz' : expired ? 'Müddəti bitib' : '${cert['days_left']} gün qalıb', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                    ]),
                  ),
                  const SizedBox(height: 10),
                  Text(cert['cert_name'] ?? '', style: TextStyle(color: c.text, fontSize: 15, fontWeight: FontWeight.w600, height: 1.4), maxLines: 3, overflow: TextOverflow.ellipsis),
                  if (cert['code'] != null && cert['code'].toString().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(cert['code'], style: TextStyle(color: c.muted, fontSize: 12)),
                  ],
                  if (!unlimited) ...[
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(value: percent / 100, backgroundColor: c.divider, color: color, minHeight: 4),
                    ),
                    Align(alignment: Alignment.centerRight, child: Text('${percent.toInt()}%', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700))),
                  ],
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('BAŞLAMA TARİXİ', style: TextStyle(color: c.muted, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                      const SizedBox(height: 3),
                      Text(cert['start'] ?? '—', style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w600)),
                    ])),
                    Container(width: 1, height: 28, color: c.divider),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('BİTMƏ TARİXİ', style: TextStyle(color: c.muted, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                      const SizedBox(height: 3),
                      Text(cert['end'] ?? '—', style: TextStyle(color: expired ? c.red : c.text, fontSize: 13, fontWeight: FontWeight.w600)),
                    ])),
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _ddlaPill(dynamic c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass),
      child: Row(children: [
        Icon(Icons.anchor, size: 12, color: c.teal),
        const SizedBox(width: 6),
        Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
      ]),
    );
  }
}
