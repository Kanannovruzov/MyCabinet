import 'dart:convert';
import 'package:http/http.dart' as http;

const String baseUrl = 'https://seafarer.ddla.gov.az';

class ApiService {
  String? _pin;
  String? _session;

  void setAuth(String pin, String session) {
    _pin = pin;
    _session = session;
  }

  void clearAuth() {
    _pin = null;
    _session = null;
  }

  Map<String, String> get _headers {
    final h = <String, String>{
      'Content-Type': 'application/json',
      'X-Mobile': '1',
    };
    if (_pin != null) h['X-Pin'] = _pin!;
    if (_session != null) h['X-Session'] = _session!;
    return h;
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final res = await http.get(Uri.parse('$baseUrl$path'), headers: _headers);
    return json.decode(res.body);
  }

  Future<Map<String, dynamic>> _post(String path, {Map<String, dynamic>? body}) async {
    final res = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: body != null ? json.encode(body) : null,
    );
    return json.decode(res.body);
  }

  Future<Map<String, dynamic>> certificates() => _get('/mobile/certificates');
  Future<Map<String, dynamic>> certificate(int id) => _get('/mobile/certificates/$id');
  Future<Map<String, dynamic>> profile() => _get('/mobile/profile');
  Future<Map<String, dynamic>> profileById(int manId) => _get('/welcome/profile/$manId');
  Future<Map<String, dynamic>> services() => _get('/mobile/services');
  Future<Map<String, dynamic>> allServices() => _get('/mobile/getAllServices');
  Future<Map<String, dynamic>> notifications() => _get('/mobile/notifications');
  Future<Map<String, dynamic>> markRead(int id) => _post('/mobile/notifications/read/$id');
  Future<Map<String, dynamic>> markAllRead() => _post('/mobile/notifications/read-all');
  Future<Map<String, dynamic>> trainings() => _get('/mobile/trainings');
  Future<Map<String, dynamic>> documents() => _get('/mobile/documents');
  Future<Map<String, dynamic>> serviceRequests() => _get('/mobile/services/requests');

  Future<Map<String, dynamic>> feedbackSend(String topic, String message) =>
      _post('/mobile/feedback/send', body: {'topic': topic, 'message': message});

  Future<Map<String, dynamic>> checkFin(String fin) =>
      _post('/mobile/check-fin', body: {'fin': fin});
}

final api = ApiService();
