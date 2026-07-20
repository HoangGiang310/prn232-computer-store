import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final List<CartItem>? selectedItems;

  const CheckoutScreen({super.key, this.selectedItems});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _shippingNameController = TextEditingController();
  final _shippingPhoneController = TextEditingController();
  final _shippingAddressController = TextEditingController();
  final _voucherController = TextEditingController();

  AuthUser? _currentUser;
  List<CartItem> _items = [];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadUserAndCart();
  }

  Future<void> _loadUserAndCart() async {
    final user = await AuthService.getCurrentUser();
    final items = widget.selectedItems ?? await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _currentUser = user;
      _items = items;
    });

    if (_currentUser != null) {
      _shippingNameController.text = _currentUser!.fullName ?? _currentUser!.username;
    }
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không có sản phẩm nào để thanh toán.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final token = _currentUser?.token;
      if (token == null || token.isEmpty) {
        throw Exception('Bạn cần đăng nhập để đặt hàng.');
      }

      const paymentMethod = 'E-Wallet';
      final totalAmount = _items.fold(0.0, (sum, item) => sum + item.price * item.quantity);

      final payload = {
        'orderChannel': 'Online',
        'orderStatus': 'New',
        'paymentMethod': paymentMethod,
        'isPaid': true,
        'shippingName': _shippingNameController.text.trim(),
        'shippingPhone': _shippingPhoneController.text.trim(),
        'shippingAddress': _shippingAddressController.text.trim(),
        'voucherCode': _voucherController.text.trim().isEmpty ? null : _voucherController.text.trim(),
        'totalAmount': totalAmount,
        'discountAmount': 0,
        'shippingFee': 0,
        'finalAmount': totalAmount,
        'orderItems': _items.map((item) => {
          'productId': item.productId,
          'quantity': item.quantity,
          'unitPrice': item.price,
        }).toList(),
      };

      final response = await ApiService.post(
        '/api/orders',
        body: payload,
        token: token,
      );

      // Remove ONLY the checked out items from the stored cart
      final allCartItems = await CartService.getCart();
      final remainingCartItems = allCartItems.where((cartItem) {
        return !_items.any((orderedItem) => orderedItem.productId == cartItem.productId);
      }).toList();
      await CartService.saveCart(remainingCartItems);

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(
            order: response is Map<String, dynamic> ? response : {},
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Thanh toán đơn hàng'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ordered Items Summary Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.shopping_bag_rounded, color: Color(0xFF1D4ED8), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Sản phẩm đã chọn (${_items.length})',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ..._items.map((item) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  Text(
                                    'Số lượng: ${item.quantity} x ${item.price.toStringAsFixed(0)} ₫',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '${(item.quantity * item.price).toStringAsFixed(0)} ₫',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1D4ED8),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Shipping Details Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_shipping_rounded, color: Color(0xFF1D4ED8), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Thông tin giao hàng',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _shippingNameController,
                        decoration: InputDecoration(
                          labelText: 'Tên người nhận',
                          prefixIcon: const Icon(Icons.person_outline_rounded),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập tên người nhận'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _shippingPhoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          labelText: 'Số điện thoại',
                          prefixIcon: const Icon(Icons.phone_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập số điện thoại'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _shippingAddressController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          labelText: 'Địa chỉ nhận hàng',
                          prefixIcon: const Icon(Icons.location_on_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập địa chỉ'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _voucherController,
                        decoration: InputDecoration(
                          labelText: 'Mã voucher (nếu có)',
                          prefixIcon: const Icon(Icons.discount_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitOrder,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1D4ED8),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                          )
                        : const Text(
                            'Xác nhận đặt hàng',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
