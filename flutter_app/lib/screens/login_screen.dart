import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../services/api.dart';
import '../widgets/ocean_waves.dart';

const _loginUrl = 'https://seafarer.ddla.gov.az/login?mobile=1';
const _bg = Color(0xFF040C1A);
const _teal = Color(0xFF00D4C8);
const _blue = Color(0xFF0057B7);
const _muted = Color(0x73FFFFFF);
const _red = Color(0xFFEF4444);

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _loading = false;
  bool _finMode = false;
  String _fin = '';
  String _finError = '';

  Future<void> _handleMyGov() async {
    setState(() => _loading = true);
    try {
      await launchUrl(Uri.parse(_loginUrl), mode: LaunchMode.externalApplication);
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _handleFinSubmit() async {
    final fin = _fin.trim().toUpperCase();
    if (fin.length < 7) {
      setState(() => _finError = 'FIN kod 7 simvol olmalıdır');
      return;
    }
    setState(() { _loading = true; _finError = ''; });

    try {
      final res = await api.checkFin(fin);
      if (res['ok'] == true) {
        final auth = context.read<AuthProvider>();
        await auth.setAuth(
          res['pin'] ?? fin,
          newSession: res['session']?.toString(),
          newNameAz: res['name_az'],
          newNameEn: res['name_en'],
          newSeamanId: res['seaman_id']?.toString(),
          newPhotoUrl: res['photo_url'],
        );
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() => _finError = res['msg'] ?? 'FIN kod tapılmadı');
      }
    } catch (e) {
      setState(() => _finError = 'Şəbəkə xətası. Yenidən cəhd edin.');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: Stack(
        children: [
          Positioned(top: -80, left: -60, child: Container(width: 280, height: 280, decoration: BoxDecoration(shape: BoxShape.circle, color: _blue.withOpacity(0.08)))),
          Positioned(bottom: 80, right: -60, child: Container(width: 280, height: 280, decoration: BoxDecoration(shape: BoxShape.circle, color: _teal.withOpacity(0.06)))),
          const OceanWaves(),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Image.asset('assets/images/mycabinet-brand.png', height: 36, fit: BoxFit.contain),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _teal.withOpacity(0.3)),
                          color: _teal.withOpacity(0.08),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(width: 7, height: 7, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.greenAccent.shade400)),
                            const SizedBox(width: 6),
                            const Text('Rəsmi Platforma', style: TextStyle(color: _teal, fontSize: 12, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: MediaQuery.of(context).size.height * 0.08),
                  Container(
                    width: 130, height: 130,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: _teal.withOpacity(0.2), width: 2),
                      color: _teal.withOpacity(0.05),
                    ),
                    child: ClipOval(child: Image.asset('assets/images/ddla-logo.png', fit: BoxFit.cover)),
                  ),
                  const SizedBox(height: 24),
                  RichText(
                    text: const TextSpan(children: [
                      TextSpan(text: 'My', style: TextStyle(color: _teal, fontSize: 40, fontWeight: FontWeight.w800, fontStyle: FontStyle.italic)),
                      TextSpan(text: ' Cabinet', style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w300)),
                    ]),
                  ),
                  const SizedBox(height: 6),
                  Text('Dənizçi Şəxsi Kabineti', style: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 14)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _featureChip('Sertifikatlar'),
                      const SizedBox(width: 8),
                      _featureChip('Təlimlər'),
                      const SizedBox(width: 8),
                      _featureChip('Xidmətlər'),
                    ],
                  ),
                  SizedBox(height: MediaQuery.of(context).size.height * 0.06),
                  Text('daxil olmaq üçün', style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 12)),
                  const SizedBox(height: 12),
                  _buildMyGovButton(),
                  const SizedBox(height: 10),
                  Text('və ya', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12)),
                  const SizedBox(height: 10),
                  _buildFinSection(),
                  const SizedBox(height: 24),
                  Text('Azərbaycan Respublikası  •  Dövlət Dəniz və Liman Agentliyi', style: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: 10), textAlign: TextAlign.center),
                  const SizedBox(height: 6),
                  Text('© 2026 DDLA. Bütün hüquqlar qorunur.', style: TextStyle(color: Colors.white.withOpacity(0.15), fontSize: 10)),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _teal.withOpacity(0.3)),
      ),
      child: Text(label, style: const TextStyle(color: _teal, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildMyGovButton() {
    return GestureDetector(
      onTap: _loading ? null : _handleMyGov,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(colors: [Color(0xFF0A6B5F), Color(0xFF0E8A7C)]),
          border: Border.all(color: _teal.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.white.withOpacity(0.15)),
              alignment: Alignment.center,
              child: const Text('myGov', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('myGov ID ilə', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12)),
                  const Text('daxil ol', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.15)),
              child: const Icon(Icons.chevron_right, color: Colors.white, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFinSection() {
    if (!_finMode) {
      return GestureDetector(
        onTap: () => setState(() => _finMode = true),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _teal.withOpacity(0.2)),
            color: _teal.withOpacity(0.04),
          ),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: _teal.withOpacity(0.3))),
                alignment: Alignment.center,
                child: const Text('FIN', style: TextStyle(color: _teal, fontSize: 13, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('FIN kodu ilə', style: TextStyle(color: _muted, fontSize: 12)),
                    const Text('daxil ol', style: TextStyle(color: _teal, fontSize: 20, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(shape: BoxShape.circle, color: _teal.withOpacity(0.1)),
                child: const Icon(Icons.chevron_right, color: _teal, size: 20),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _teal.withOpacity(0.2)),
        color: _teal.withOpacity(0.04),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Text('FIN', style: TextStyle(color: _teal, fontSize: 13, fontWeight: FontWeight.w800)),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() { _finMode = false; _finError = ''; }),
                child: Icon(Icons.close, color: _muted, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            onChanged: (v) => setState(() { _fin = v; _finError = ''; }),
            maxLength: 7,
            textCapitalization: TextCapitalization.characters,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: 4),
            decoration: InputDecoration(
              hintText: 'FIN kodu',
              hintStyle: TextStyle(color: _muted),
              counterText: '',
              filled: true,
              fillColor: Colors.black.withOpacity(0.3),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _teal.withOpacity(0.2))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _teal.withOpacity(0.2))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _teal)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
          ),
          if (_finError.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(_finError, style: const TextStyle(color: _red, fontSize: 12)),
          ],
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _handleFinSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: _teal,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text('Daxil ol', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}
