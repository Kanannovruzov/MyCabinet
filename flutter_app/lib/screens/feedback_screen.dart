import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  String _topic = '';
  String _message = '';
  bool _sending = false;

  final _topics = [
    ('Sertifikat məsələsi', Icons.workspace_premium),
    ('Texniki problem', Icons.build_outlined),
    ('Ödəniş məsələsi', Icons.credit_card),
    ('Məlumat yenilənməsi', Icons.refresh),
    ('Digər', Icons.more_horiz),
  ];

  Future<void> _send() async {
    if (_message.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mətn daxil edin')));
      return;
    }
    setState(() => _sending = true);
    try {
      final res = await api.feedbackSend(_topic, _message.trim());
      if (res['ok'] == true) {
        if (!mounted) return;
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Göndərildi'),
            content: const Text('Müraciətiniz qəbul edildi. Tezliklə cavab veriləcək.'),
            actions: [TextButton(onPressed: () { Navigator.pop(context); Navigator.pop(context); }, child: const Text('Tamam'))],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['msg'] ?? 'Göndərmək mümkün olmadı')));
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Şəbəkə xətası')));
    }
    setState(() => _sending = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ThemeProvider>().colors;

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
                    Expanded(child: Text('Əks-Əlaqə', style: TextStyle(color: c.text, fontSize: 20, fontWeight: FontWeight.w700))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: c.glassBorder), color: c.glass),
                      child: Row(children: [Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: c.teal)), const SizedBox(width: 6), Text('DDLA', style: TextStyle(color: c.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1))]),
                    ),
                  ]),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: c.glassBorder), color: c.glass),
                          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Icon(Icons.info_outline, size: 16, color: c.teal),
                            const SizedBox(width: 10),
                            Expanded(child: Text('Müraciətiniz Dövlət Dəniz və Liman Agentliyinə göndəriləcək. Gündə 1 müraciət mümkündür.', style: TextStyle(color: c.muted, fontSize: 13, height: 1.5))),
                          ]),
                        ),
                        const SizedBox(height: 16),
                        Text('Mövzu', style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Wrap(spacing: 8, runSpacing: 8, children: _topics.map((t) {
                          final active = _topic == t.$1;
                          return GestureDetector(
                            onTap: () => setState(() => _topic = t.$1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: active ? c.teal : c.cardBorder),
                                color: active ? c.teal.withOpacity(0.15) : c.cardBg,
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                Icon(t.$2, size: 14, color: active ? c.teal : c.muted),
                                const SizedBox(width: 6),
                                Text(t.$1, style: TextStyle(color: active ? c.teal : c.muted, fontSize: 13, fontWeight: active ? FontWeight.w600 : FontWeight.w500)),
                              ]),
                            ),
                          );
                        }).toList()),
                        const SizedBox(height: 16),
                        Text('Müraciət mətni', style: TextStyle(color: c.text, fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        TextField(
                          onChanged: (v) => setState(() => _message = v),
                          maxLines: 6,
                          maxLength: 2000,
                          style: TextStyle(color: c.text, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Müraciətinizi buraya yazın...',
                            hintStyle: TextStyle(color: c.muted),
                            filled: true,
                            fillColor: c.cardBg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: c.cardBorder)),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: c.cardBorder)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: c.teal)),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _sending ? null : _send,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: c.teal,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 6,
                            ),
                            child: _sending
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.send, size: 18), SizedBox(width: 8), Text('Göndər', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))]),
                          ),
                        ),
                      ],
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
