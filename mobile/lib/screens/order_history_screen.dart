import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'order_detail_screen.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  List<dynamic> _orders = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final user = await AuthService.getCurrentUser();
      if (user?.token == null) {
        throw Exception('Bạn cần đăng nhập để xem lịch sử đơn.');
      }

      final response = await ApiService.get('/api/customers/me/orders', token: user!.token);
      if (!mounted) return;
      setState(() => _orders = response is List ? response : []);
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử đơn hàng')),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text(_error!))
                : _orders.isEmpty
                    ? const Center(child: Text('Bạn chưa có đơn hàng nào.'))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, index) {
                          final order = _orders[index] as Map<String, dynamic>;
                          final status = order['orderStatus']?.toString() ?? 'New';
                          return InkWell(
                            borderRadius: BorderRadius.circular(18),
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
                            ),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Đơn ${order['id']?.toString().substring(0, 8) ?? '...'}',
                                          style: const TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFDBEAFE),
                                          borderRadius: BorderRadius.circular(999),
                                        ),
                                        child: Text(status, style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text('Sản phẩm: ${(order['orderItems'] as List?)?.length ?? 0}'),
                                  const SizedBox(height: 6),
                                  Text('Tổng: ${(order['finalAmount'] as num?)?.toStringAsFixed(0) ?? '0'} ₫'),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
