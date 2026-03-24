import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  List<dynamic> _docs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.documents();
      if (res['ok'] == true) _docs = res['items'] ?? [];
    } catch (_) {}
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
                      Text('Sənədlər', style: TextStyle(color: c.text, fontSize: 20, fontWeight: FontWeight.w700)),
                      Text('${_docs.length} fayl', style: TextStyle(color: c.muted, fontSize: 11)),
                    ])),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass),
                      child: Row(children: [
                        Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: c.teal)),
                        const SizedBox(width: 6),
                        Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                      ]),
                    ),
                  ]),
                ),
                Expanded(
                  child: RefreshIndicator(
                    color: c.teal,
                    onRefresh: _load,
                    child: _docs.isEmpty
                        ? ListView(children: [Padding(padding: const EdgeInsets.all(40), child: Column(children: [Icon(Icons.folder_outlined, size: 32, color: c.muted), const SizedBox(height: 8), Text('Sənəd tapılmadı', style: TextStyle(color: c.muted, fontSize: 14))]))])
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                            itemCount: _docs.length,
                            itemBuilder: (_, i) => _docCard(_docs[i], c),
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

  Widget _docCard(dynamic doc, dynamic c) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.cardBorder), color: c.cardBg),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: c.teal.withOpacity(0.25)), color: c.teal.withOpacity(0.12)),
          child: Icon(Icons.description_outlined, size: 20, color: c.teal),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(doc['code'] ?? doc['name'] ?? '', style: TextStyle(color: c.text, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(doc['date'] ?? '', style: TextStyle(color: c.muted, fontSize: 11)),
        ])),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: () => launchUrl(Uri.parse('$baseUrl/files/show/${doc['code']}')),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: c.teal.withOpacity(0.3)), color: c.teal.withOpacity(0.12)),
            child: Row(children: [
              Icon(Icons.open_in_new, size: 14, color: c.teal),
              const SizedBox(width: 6),
              Text('Bax', style: TextStyle(color: c.teal, fontSize: 12, fontWeight: FontWeight.w700)),
            ]),
          ),
        ),
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
