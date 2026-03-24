import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _items = [];
  bool _loading = true;
  int? _expandedId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.notifications();
      if (res['ok'] == true) _items = res['items'] ?? [];
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;
    final unread = _items.where((i) => i['is_read'] == 0).length;

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
                  child: Row(
                    children: [
                      _backBtn(c),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Bildirişlər', style: TextStyle(color: c.text, fontSize: 20, fontWeight: FontWeight.w700)),
                          if (unread > 0) Text('$unread oxunmamış', style: TextStyle(color: c.muted, fontSize: 11)),
                        ]),
                      ),
                      if (unread > 0)
                        GestureDetector(
                          onTap: () async {
                            await api.markAllRead();
                            setState(() => _items = _items.map((i) => {...i, 'is_read': 1}).toList());
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: c.glassBorder), color: c.glass),
                            child: Row(children: [
                              Icon(Icons.check_circle_outline, size: 14, color: c.teal),
                              const SizedBox(width: 6),
                              Text('Hamısını oxu', style: TextStyle(color: c.teal, fontSize: 12, fontWeight: FontWeight.w600)),
                            ]),
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    color: c.teal,
                    onRefresh: _load,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                      itemCount: _items.length,
                      itemBuilder: (_, i) => _notifCard(_items[i], c),
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

  Widget _notifCard(dynamic item, dynamic c) {
    final isUnread = item['is_read'] == 0;
    final expanded = _expandedId == item['id'];

    return GestureDetector(
      onTap: () {
        if (isUnread) {
          api.markRead(item['id']);
          setState(() => item['is_read'] = 1);
        }
        setState(() => _expandedId = expanded ? null : item['id']);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isUnread ? c.teal.withOpacity(0.3) : c.cardBorder),
          color: isUnread ? c.glass : c.cardBg,
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: isUnread ? c.teal.withOpacity(0.15) : c.cardBorder),
            child: Icon(isUnread ? Icons.notifications : Icons.check, size: 16, color: isUnread ? c.teal : c.muted),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['title'] ?? '', style: TextStyle(color: isUnread ? c.text : c.muted, fontSize: 14, fontWeight: FontWeight.w600)),
              if (expanded && item['body'] != null)
                Padding(padding: const EdgeInsets.only(top: 8), child: Text(item['body'], style: TextStyle(color: c.text.withOpacity(0.8), fontSize: 14, height: 1.5)))
              else if (item['body'] != null)
                Padding(padding: const EdgeInsets.only(top: 4), child: Text(item['body'], style: TextStyle(color: c.muted, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis)),
              Padding(padding: const EdgeInsets.only(top: 8), child: Text(item['created_at'] ?? '', style: TextStyle(color: c.muted.withOpacity(0.5), fontSize: 11))),
            ]),
          ),
          Icon(expanded ? Icons.expand_less : Icons.expand_more, size: 16, color: c.muted),
        ]),
      ),
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
