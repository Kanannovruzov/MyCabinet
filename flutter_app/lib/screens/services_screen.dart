import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  String _tab = 'services';
  List<dynamic> _services = [];
  List<dynamic> _requests = [];
  bool _loading = true;

  final _statusLabels = {0: 'Gözləmədə', 1: 'İcrada', 2: 'Geri qaytarıldı', 3: 'Tamamlandı', 4: 'Baxılmamış'};
  final _statusIcons = {0: Icons.access_time, 1: Icons.autorenew, 2: Icons.undo, 3: Icons.check_circle_outline, 4: Icons.visibility_off};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([api.services(), api.serviceRequests()]);
      if (results[0]['ok'] == true) _services = results[0]['items'] ?? [];
      if (results[1]['ok'] == true) _requests = results[1]['items'] ?? [];
    } catch (_) {}
    setState(() => _loading = false);
  }

  Color _statusColor(int id, dynamic c) {
    if (id == 3) return c.green;
    if (id == 1) return c.teal;
    if (id == 0 || id == 2) return c.yellow;
    return c.red;
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;

    if (_loading) return Scaffold(backgroundColor: c.bg, body: Center(child: CircularProgressIndicator(color: c.teal)));

    return Scaffold(
      backgroundColor: c.bg,
      body: Stack(
        children: [
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
                        Text('Xidmətlər', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
                        Text('DDLA xidmətləri', style: TextStyle(color: c.muted, fontSize: 12)),
                      ]),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass),
                        child: Row(children: [Icon(Icons.anchor, size: 12, color: c.teal), const SizedBox(width: 6), Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1))]),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(children: [
                    _tabBtn('Xidmətlər', 'services', Icons.grid_view_rounded, c),
                    const SizedBox(width: 8),
                    _tabBtn('Müraciətlərim', 'requests', Icons.list, c),
                  ]),
                ),
                Expanded(
                  child: RefreshIndicator(
                    color: c.teal,
                    onRefresh: _load,
                    child: _tab == 'services'
                        ? ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 32), itemCount: _services.length, itemBuilder: (_, i) => _svcCard(_services[i], c))
                        : ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 32), itemCount: _requests.length, itemBuilder: (_, i) => _reqCard(_requests[i], c)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabBtn(String label, String key, IconData icon, dynamic c) {
    final active = _tab == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tab = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: active ? c.teal : c.cardBorder), color: active ? c.teal.withOpacity(0.15) : c.cardBg),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon, size: 14, color: active ? c.teal : c.muted),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: active ? c.teal : c.muted, fontSize: 13, fontWeight: FontWeight.w600)),
          ]),
        ),
      ),
    );
  }

  Widget _svcCard(dynamic svc, dynamic c) {
    return GestureDetector(
      onTap: () => launchUrl(Uri.parse('$baseUrl${svc['url']}')),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.cardBorder), color: c.cardBg),
        child: Row(children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: c.teal.withOpacity(0.25)), color: c.teal.withOpacity(0.12)),
            child: Icon(Icons.anchor, size: 18, color: c.teal),
          ),
          const SizedBox(width: 14),
          Expanded(child: Text(svc['name'] ?? '', style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis)),
          Container(width: 32, height: 32, decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), color: c.teal.withOpacity(0.12)), child: Icon(Icons.chevron_right, size: 16, color: c.teal)),
        ]),
      ),
    );
  }

  Widget _reqCard(dynamic req, dynamic c) {
    final statusId = req['status_id'] ?? 4;
    final color = _statusColor(statusId, c);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: color.withOpacity(0.25)), color: c.cardBg),
      child: Row(children: [
        Container(width: 4, decoration: BoxDecoration(color: color, borderRadius: const BorderRadius.only(topLeft: Radius.circular(14), bottomLeft: Radius.circular(14)))),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.4)), color: color.withOpacity(0.18)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(_statusIcons[statusId] ?? Icons.help_outline, size: 12, color: color),
                  const SizedBox(width: 6),
                  Text(_statusLabels[statusId] ?? 'Naməlum', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                ]),
              ),
              const SizedBox(height: 8),
              Text(req['service_name'] ?? '', style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600), maxLines: 2),
              const SizedBox(height: 4),
              Text('${req['tarix'] ?? ''}  ·  ${req['no'] ?? ''}', style: TextStyle(color: c.muted, fontSize: 11)),
            ]),
          ),
        ),
      ]),
    );
  }
}
