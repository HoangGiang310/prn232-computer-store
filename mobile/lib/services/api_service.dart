import 'dart:convert';
import 'package:http/http.dart' as http;

const String apiBaseUrl = 'http://localhost:5000';

class ApiService {
  static dynamic _decodeBody(http.Response response) {
    if (response.body.isEmpty) return null;
    try {
      return jsonDecode(response.body);
    } catch (_) {
      return null;
    }
  }

  static Future<dynamic> post(
    String path, {
    required Map<String, dynamic> body,
    String? token,
  }) async {
    final uri = Uri.parse('$apiBaseUrl$path');
    final response = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    final decoded = _decodeBody(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    if (decoded is Map<String, dynamic>) {
      throw Exception(decoded['message'] ?? 'Request failed.');
    }

    throw Exception('Request failed.');
  }

  static Future<dynamic> get(
    String path, {
    String? token,
  }) async {
    final uri = Uri.parse('$apiBaseUrl$path');
    final response = await http.get(
      uri,
      headers: {
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      },
    );

    final decoded = _decodeBody(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    if (decoded is Map<String, dynamic>) {
      throw Exception(decoded['message'] ?? 'Request failed.');
    }

    throw Exception('Request failed.');
  }
}
