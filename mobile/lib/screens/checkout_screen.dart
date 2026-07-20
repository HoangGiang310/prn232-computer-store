import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

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
    final items = await CartService.getCart();
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
        const SnackBar(content: Text('Giỏ hàng đang trống.')),
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

      await CartService.clearCart();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => OrderSuccessScreen(order: response is Map<String, dynamic> ? response : {})),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sản phẩm: ${_items.length}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ..._items.map((item) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text('${item.quantity} x ${item.price.toStringAsFixed(0)} ₫'),
                          ],
                        ),
                      ),
                      Text('${(item.quantity * item.price).toStringAsFixed(0)} ₫'),
                    ],
                  ),
                )),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _shippingNameController,
                  decoration: const InputDecoration(labelText: 'Tên người nhận', border: OutlineInputBorder()),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Vui lòng nhập tên người nhận' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _shippingPhoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Số điện thoại', border: OutlineInputBorder()),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Vui lòng nhập số điện thoại' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _shippingAddressController,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Địa chỉ nhận hàng', border: OutlineInputBorder()),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Vui lòng nhập địa chỉ' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _voucherController,
                  decoration: const InputDecoration(labelText: 'Mã voucher (nếu có)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitOrder,
                    child: Text(_isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'),
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
