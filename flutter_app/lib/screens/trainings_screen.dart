import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class TrainingsScreen extends StatefulWidget {
  const TrainingsScreen({super.key});

  @override
  State<TrainingsScreen> createState() => _TrainingsScreenState();
}

class _TrainingsScreenState extends State<TrainingsScreen> {
  List<dynamic> _courses = [];
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
      final res = await api.trainings();
      if (res['ok'] == true) _courses = res['items'] ?? [];
      else _error = true;
    } catch (_) {
      _error = true;
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;

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
                        Text('Təlimlər', style: TextStyle(color: c.text, fontSize: 22, fontWeight: FontWeight.w700)),
                        Text('${_courses.length} kurs', style: TextStyle(color: c.muted, fontSize: 12)),
                      ]),
                      _ddlaPill(c),
                    ],
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    color: c.teal,
                    onRefresh: _load,
                    child: _courses.isEmpty
                        ? ListView(children: [_emptyBox(c)])
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                            itemCount: _courses.length,
                            itemBuilder: (_, i) => _courseCard(_courses[i], c),
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

  Widget _courseCard(dynamic course, dynamic c) {
    final status = course['status'] ?? 'not_started';
    final locked = status == 'locked' || status == 'cooldown';
    final configs = {
      'not_started': ('Başlanmayıb', c.muted as Color, Icons.circle_outlined),
      'in_progress': ('Davam edir', c.teal as Color, Icons.play_circle_outline),
      'completed': ('Tamamlanıb', c.green as Color, Icons.check_circle_outline),
      'locked': ('Kilidli', c.muted as Color, Icons.lock_outline),
      'cooldown': ('Gözləmə', c.yellow as Color, Icons.access_time),
    };
    final cfg = configs[status] ?? configs['not_started']!;
    final color = cfg.$2;

    return GestureDetector(
      onTap: locked ? null : () async {
        final url = course['course_url'];
        if (url != null) await launchUrl(Uri.parse('${baseUrl}$url'));
      },
      child: Opacity(
        opacity: locked ? 0.7 : 1.0,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.3)), color: c.cardBg),
          child: Row(
            children: [
              Container(width: 4, decoration: BoxDecoration(color: locked ? c.divider : color, borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)))),
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
                          Icon(cfg.$3, size: 12, color: color),
                          const SizedBox(width: 6),
                          Text(cfg.$1, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                      const SizedBox(height: 8),
                      Text(course['title'] ?? '', style: TextStyle(color: c.text, fontSize: 15, fontWeight: FontWeight.w600, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                      if (course['reference_code'] != null) Text(course['reference_code'], style: TextStyle(color: c.muted, fontSize: 11)),
                      if (course['description'] != null) ...[
                        const SizedBox(height: 4),
                        Text(course['description'], style: TextStyle(color: c.muted, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
                      ],
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: c.glass),
                        child: Row(children: [
                          _statItem('${course['module_count'] ?? 0}', 'Modul', c),
                          Container(width: 1, height: 24, color: c.divider),
                          const SizedBox(width: 12),
                          _statItem('${course['material_count'] ?? 0}', 'Material', c),
                          if (course['test_passed'] == true) ...[
                            Container(width: 1, height: 24, color: c.divider),
                            const SizedBox(width: 12),
                            _statItem(course['test_score'] != null ? '${(course['test_score'] as num).round()}%' : '✓', 'Test', c, valueColor: c.green),
                          ],
                        ]),
                      ),
                      if (!locked) ...[
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.6)), color: color.withOpacity(0.12)),
                          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Icon(status == 'not_started' ? Icons.play_arrow : status == 'completed' ? Icons.refresh : Icons.arrow_forward, size: 14, color: color),
                            const SizedBox(width: 6),
                            Text(status == 'not_started' ? 'Başla' : status == 'completed' ? 'Yenidən bax' : 'Davam et', style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
                          ]),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String val, String label, dynamic c, {Color? valueColor}) {
    return Column(children: [
      Text(val, style: TextStyle(color: valueColor ?? c.text, fontSize: 16, fontWeight: FontWeight.w700)),
      Text(label, style: TextStyle(color: c.muted, fontSize: 10)),
    ]);
  }

  Widget _emptyBox(dynamic c) => Padding(padding: const EdgeInsets.all(40), child: Column(children: [Icon(Icons.menu_book, size: 32, color: c.muted), const SizedBox(height: 8), Text('Təlim tapılmadı', style: TextStyle(color: c.muted, fontSize: 14))]));
  Widget _ddlaPill(dynamic c) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass), child: Row(children: [Icon(Icons.anchor, size: 12, color: c.teal), const SizedBox(width: 6), Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1))]));
}
