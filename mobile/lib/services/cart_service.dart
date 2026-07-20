import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/cart_item.dart';
import 'auth_service.dart';

class CartService {
  static const String _cartBaseStorageKey = 'computer_store_mobile_cart';

  static Future<String?> _getCartStorageKey() async {
    final user = await AuthService.getCurrentUser();
    if (user == null) return null;
    final cleanUsername = user.username.trim().toLowerCase();
    return '${_cartBaseStorageKey}_$cleanUsername';
  }

  static Future<List<CartItem>> getCart() async {
    final storageKey = await _getCartStorageKey();
    if (storageKey == null || storageKey.isEmpty) return [];

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(storageKey);
    if (raw == null || raw.isEmpty) return [];

    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded
            .map((item) => CartItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}

    return [];
  }

  static Future<void> saveCart(List<CartItem> items) async {
    final storageKey = await _getCartStorageKey();
    if (storageKey == null || storageKey.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(storageKey, jsonEncode(items.map((item) => item.toJson()).toList()));
  }

  static Future<void> clearCart() async {
    final storageKey = await _getCartStorageKey();
    if (storageKey == null || storageKey.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(storageKey);
  }
}
