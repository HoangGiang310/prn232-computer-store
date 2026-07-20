import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/cart_item.dart';

class CartService {
  static const String _cartStorageKey = 'computer_store_mobile_cart';

  static Future<List<CartItem>> getCart() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cartStorageKey);
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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cartStorageKey, jsonEncode(items.map((item) => item.toJson()).toList()));
  }

  static Future<void> clearCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartStorageKey);
  }
}
