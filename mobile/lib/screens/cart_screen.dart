import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> _items = [];
  Set<String> _selectedProductIds = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    final user = await AuthService.getCurrentUser();
    if (user == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.info_outline, color: Colors.white),
              SizedBox(width: 10),
              Expanded(child: Text('Bạn cần phải đăng nhập mới có thể xem giỏ hàng')),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFFEF4444),
          duration: const Duration(seconds: 3),
        ),
      );
      Navigator.pop(context);
      return;
    }

    final items = await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _items = items;
      _selectedProductIds = _selectedProductIds
          .where((id) => items.any((e) => e.productId == id))
          .toSet();
      _isLoading = false;
    });
  }

  Future<void> _persistCart(List<CartItem> items) async {
    await CartService.saveCart(items);
    setState(() {
      _items = items;
      _selectedProductIds = _selectedProductIds
          .where((id) => items.any((e) => e.productId == id))
          .toSet();
    });
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
    setState(() {
      _items = [];
      _selectedProductIds.clear();
    });
  }

  double get _totalPrice {
    return _items
        .where((item) => _selectedProductIds.contains(item.productId))
        .fold(0.0, (sum, item) => sum + item.price * item.quantity);
  }

  int get _selectedItemQuantity {
    return _items
        .where((item) => _selectedProductIds.contains(item.productId))
        .fold(0, (sum, item) => sum + item.quantity);
  }

  @override
  Widget build(BuildContext context) {
    final isAllSelected = _items.isNotEmpty && _selectedProductIds.length == _items.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Giỏ hàng của bạn'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _items.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_bag_outlined, size: 64, color: Color(0xFF94A3B8)),
                        SizedBox(height: 12),
                        Text(
                          'Giỏ hàng của bạn đang trống.',
                          style: TextStyle(fontSize: 15, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      // Select All Header Bar
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          border: Border(
                            bottom: BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                        ),
                        child: Row(
                          children: [
                            Checkbox(
                              value: isAllSelected,
                              activeColor: const Color(0xFF1D4ED8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                              onChanged: (bool? checked) {
                                setState(() {
                                  if (checked == true) {
                                    _selectedProductIds = _items.map((e) => e.productId).toSet();
                                  } else {
                                    _selectedProductIds.clear();
                                  }
                                });
                              },
                            ),
                            Text(
                              'Chọn tất cả (${_items.length} sản phẩm)',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const Spacer(),
                            if (_selectedProductIds.isNotEmpty)
                              TextButton(
                                onPressed: () {
                                  setState(() => _selectedProductIds.clear());
                                },
                                child: const Text('Bỏ chọn'),
                              ),
                          ],
                        ),
                      ),

                      // Cart Item List
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (_, index) {
                            final item = _items[index];
                            final isChecked = _selectedProductIds.contains(item.productId);

                            return Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isChecked ? const Color(0xFF93C5FD) : const Color(0xFFF1F5F9),
                                  width: isChecked ? 1.5 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(10),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  // Selection Checkbox
                                  Checkbox(
                                    value: isChecked,
                                    activeColor: const Color(0xFF1D4ED8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                    onChanged: (bool? checked) {
                                      setState(() {
                                        if (checked == true) {
                                          _selectedProductIds.add(item.productId);
                                        } else {
                                          _selectedProductIds.remove(item.productId);
                                        }
                                      });
                                    },
                                  ),
                                  const SizedBox(width: 4),

                                  // Product Icon
                                  Container(
                                    width: 54,
                                    height: 54,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEFF6FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.laptop_mac_rounded, color: Color(0xFF1D4ED8)),
                                  ),
                                  const SizedBox(width: 12),

                                  // Item Description
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.name,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                            color: Color(0xFF0F172A),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item.brand,
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          '${item.price.toStringAsFixed(0)} ₫',
                                          style: const TextStyle(
                                            color: Color(0xFF1D4ED8),
                                            fontWeight: FontWeight.w800,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Quantity Control & Delete
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      IconButton(
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                        onPressed: () => _removeItem(item.productId),
                                        icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                                        tooltip: 'Xóa sản phẩm',
                                      ),
                                      const SizedBox(height: 8),
                                      Container(
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: const Color(0xFFE2E8F0)),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            InkWell(
                                              onTap: () => _changeQuantity(item.productId, -1),
                                              borderRadius: BorderRadius.circular(8),
                                              child: const Padding(
                                                padding: EdgeInsets.all(4),
                                                child: Icon(Icons.remove, size: 16, color: Color(0xFF475569)),
                                              ),
                                            ),
                                            Padding(
                                              padding: const EdgeInsets.symmetric(horizontal: 8),
                                              child: Text(
                                                '${item.quantity}',
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                              ),
                                            ),
                                            InkWell(
                                              onTap: () => _changeQuantity(item.productId, 1),
                                              borderRadius: BorderRadius.circular(8),
                                              child: const Padding(
                                                padding: EdgeInsets.all(4),
                                                child: Icon(Icons.add, size: 16, color: Color(0xFF475569)),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      // Summary & Checkout Panel
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(12),
                              blurRadius: 10,
                              offset: const Offset(0, -4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Tổng thanh toán',
                                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                    ),
                                    Text(
                                      'Đã chọn $_selectedItemQuantity sản phẩm',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: Color(0xFF059669),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  '${_totalPrice.toStringAsFixed(0)} ₫',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF1D4ED8),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            SizedBox(
                              width: double.infinity,
                              height: 46,
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  final selectedItems = _items
                                      .where((item) => _selectedProductIds.contains(item.productId))
                                      .toList();

                                  if (selectedItems.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: const Row(
                                          children: [
                                            Icon(Icons.info_outline, color: Colors.white),
                                            SizedBox(width: 10),
                                            Expanded(
                                              child: Text('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.'),
                                            ),
                                          ],
                                        ),
                                        behavior: SnackBarBehavior.floating,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        backgroundColor: const Color(0xFFEF4444),
                                      ),
                                    );
                                    return;
                                  }

                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => CheckoutScreen(selectedItems: selectedItems),
                                    ),
                                  ).then((_) => _loadCart());
                                },
                                icon: const Icon(Icons.payment_rounded, size: 20),
                                label: Text(
                                  'Thanh toán (${_selectedProductIds.length})',
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1D4ED8),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  elevation: 2,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: TextButton(
                                onPressed: _clearCart,
                                style: TextButton.styleFrom(
                                  foregroundColor: const Color(0xFFEF4444),
                                ),
                                child: const Text('Xóa toàn bộ giỏ hàng'),
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
