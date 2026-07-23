import 'package:flutter/material.dart';

import 'order_history_screen.dart';

class OrderSuccessScreen extends StatelessWidget {
  final Map<String, dynamic> order;

  const OrderSuccessScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final orderId = order['id']?.toString() ?? '...';
    final finalAmount = (order['finalAmount'] as num?)?.toStringAsFixed(0) ?? '0';
    final items = (order['orderItems'] as List?) ?? [];
    final shippingName = order['shippingName']?.toString() ?? 'Khách hàng';

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      appBar: AppBar(title: const Text('Đặt hàng thành công')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Expanded(
                child: Center(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: const [
                        BoxShadow(
                          color: Color.fromARGB(13, 0, 0, 0),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE1F5F1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check_circle, size: 56, color: Color(0xFF1B8577)),
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Cảm ơn bạn đã đặt hàng!',
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Đơn hàng của bạn đã được ghi nhận và đang được xử lý.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade700),
                        ),
                        const SizedBox(height: 20),
                        _summaryRow('Mã đơn', orderId.substring(0, 8)),
                        _summaryRow('Khách hàng', shippingName),
                        _summaryRow('Số sản phẩm', '${items.length}'),
                        _summaryRow('Tổng tiền', '$finalAmount ₫'),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                    );
                  },
                  icon: const Icon(Icons.receipt_long),
                  label: const Text('Xem lịch sử đơn hàng'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  icon: const Icon(Icons.home_outlined),
                  label: const Text('Về trang chủ'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
          Text(value),
        ],
      ),
    );
  }
}
