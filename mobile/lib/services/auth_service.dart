import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth_user.dart';
import 'api_service.dart';

class AuthService {
  static const String _authStorageKey = 'computer_store_mobile_auth';

  static Future<void> saveCurrentUser(AuthUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_authStorageKey, jsonEncode(user.toJson()));
  }

  static Future<AuthUser?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_authStorageKey);
    if (raw == null || raw.isEmpty) {
      return null;
    }

    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) {
        return AuthUser.fromJson(decoded);
      }
    } catch (_) {}

    return null;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_authStorageKey);
  }

  static Future<AuthUser> login({
    required String username,
    required String password,
  }) async {
    final response = await ApiService.post(
      '/api/auth/login',
      body: {
        'username': username,
        'password': password,
      },
    );

    final user = AuthUser(
      username: response['username']?.toString() ?? username,
      role: response['role']?.toString() ?? 'customer',
      fullName: response['fullName']?.toString(),
      token: response['token']?.toString(),
    );

    await saveCurrentUser(user);
    return user;
  }

  static Future<AuthUser> register({
    required String username,
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await ApiService.post(
      '/api/auth/register',
      body: {
        'username': username,
        'email': email,
        'password': password,
        'fullName': fullName,
      },
    );

    final user = AuthUser(
      username: response['username']?.toString() ?? username,
      role: response['role']?.toString() ?? 'customer',
      fullName: response['fullName']?.toString() ?? fullName,
      token: response['token']?.toString(),
    );

    await saveCurrentUser(user);
    return user;
  }
}
