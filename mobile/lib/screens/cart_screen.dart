import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../services/cart_service.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> _items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    final items = await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _items = items;
      _isLoading = false;
    });
  }

  Future<void> _persistCart(List<CartItem> items) async {
    await CartService.saveCart(items);
    setState(() => _items = items);
  }

  Future<void> _changeQuantity(String productId, int delta) async {
    final nextItems = _items.map((item) {
      if (item.productId != productId) return item;
      final nextQuantity = item.quantity + delta;
      if (nextQuantity <= 0) return null;
      return item.copyWith(quantity: nextQuantity);
    }).whereType<CartItem>().toList();

    await _persistCart(nextItems);
  }

  Future<void> _removeItem(String productId) async {
    final nextItems = _items.where((item) => item.productId != productId).toList();
    await _persistCart(nextItems);
  }

  Future<void> _clearCart() async {
    await CartService.clearCart();
    setState(() => _items = []);
  }

  double get _totalPrice => _items.fold(0.0, (sum, item) => sum + item.price * item.quantity);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Giỏ hàng')),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _items.isEmpty
                ? const Center(child: Text('Giỏ hàng của bạn đang trống.'))
                : Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (_, index) {
                            final item = _items[index];
                            return Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        Text(item.brand, style: const TextStyle(color: Colors.black54)),
                                        const SizedBox(height: 6),
                                        Text('${item.price.toStringAsFixed(0)} ₫', style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    children: [
                                      Row(
                                        children: [
                                          IconButton(
                                            onPressed: () => _changeQuantity(item.productId, -1),
                                            icon: const Icon(Icons.remove),
                                          ),
                                          Text('${item.quantity}'),
                                          IconButton(
                                            onPressed: () => _changeQuantity(item.productId, 1),
                                            icon: const Icon(Icons.add),
                                          ),
                                        ],
                                      ),
                                      TextButton(
                                        onPressed: () => _removeItem(item.productId),
                                        child: const Text('Xóa'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Tổng tiền', style: TextStyle(fontWeight: FontWeight.bold)),
                                Text('${_totalPrice.toStringAsFixed(0)} ₫', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                              ],
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                                  );
                                },
                                child: const Text('Thanh toán'),
                              ),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: _clearCart,
                                child: const Text('Xóa toàn bộ'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
