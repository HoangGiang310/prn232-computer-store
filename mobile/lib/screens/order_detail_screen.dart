import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import '../services/review_service.dart';

class OrderDetailScreen extends StatefulWidget {
  final Map<String, dynamic> order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final ReviewService _reviewService = ReviewService();
  bool _isSubmitting = false;
  String? _status;

  @override
  void initState() {
    super.initState();
    _status = widget.order['orderStatus']?.toString() ?? 'New';
  }

  Future<void> _showReviewDialog({required String productId, required String productName}) async {
    final user = await AuthService.getCurrentUser();
    final token = user?.token;

    if (token == null || token.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bạn cần đăng nhập để đánh giá sản phẩm.')),
      );
      return;
    }

    int selectedRating = 5;
    final titleController = TextEditingController();
    final contentController = TextEditingController();

    final eligibility = await _reviewService.checkEligibility(productId: productId, token: token);
    final canReview = eligibility['canReview'] == true;
    final hasReviewed = eligibility['hasReviewed'] == true;

    if (!mounted) return;

    if (!canReview || hasReviewed) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            hasReviewed
                ? 'Bạn đã đánh giá sản phẩm này rồi.'
                : 'Bạn chỉ có thể đánh giá sản phẩm đã mua và được giao thành công.',
          ),
        ),
      );
      return;
    }

    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              title: Text('Đánh giá: $productName'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chọn số sao:'),
                    const SizedBox(height: 8),
                    Row(
                      children: List.generate(5, (index) {
                        final starValue = index + 1;
                        return IconButton(
                          onPressed: () => setDialogState(() => selectedRating = starValue),
                          icon: Icon(
                            Icons.star,
                            color: starValue <= selectedRating ? Colors.amber : Colors.grey.shade300,
                            size: 32,
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(
                        labelText: 'Tiêu đề đánh giá',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: contentController,
                      minLines: 3,
                      maxLines: 5,
                      decoration: const InputDecoration(
                        labelText: 'Nội dung đánh giá',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Hủy'),
                ),
                FilledButton(
                  onPressed: () async {
                    final title = titleController.text.trim();
                    final content = contentController.text.trim();
                    final dialogMessenger = ScaffoldMessenger.of(dialogContext);

                    if (!mounted) return;
                    setState(() => _isSubmitting = true);
                    try {
                      await _reviewService.submitReview(
                        productId: productId,
                        token: token,
                        rating: selectedRating,
                        title: title,
                        content: content,
                      );
                      if (!mounted) return;
                      if (dialogContext.mounted) {
                        Navigator.pop(dialogContext);
                      }
                      dialogMessenger.showSnackBar(
                        const SnackBar(content: Text('Đánh giá của bạn đã được gửi thành công.')),
                      );
                    } catch (error) {
                      if (!mounted) return;
                      dialogMessenger.showSnackBar(
                        SnackBar(content: Text(error.toString())),
                      );
                    } finally {
                      if (mounted) setState(() => _isSubmitting = false);
                    }
                  },
                  child: _isSubmitting
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Gửi đánh giá'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final orderId = widget.order['id']?.toString() ?? '...';
    final finalAmount = (widget.order['finalAmount'] as num?)?.toStringAsFixed(0) ?? '0';
    final items = (widget.order['orderItems'] as List?) ?? [];
    final shippingName = widget.order['shippingName']?.toString() ?? '---';
    final shippingAddress = widget.order['shippingAddress']?.toString() ?? '---';
    final shippingPhone = widget.order['shippingPhone']?.toString() ?? '---';
    final status = _status ?? 'New';

    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết đơn hàng')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Đơn hàng ${orderId.substring(0, 8)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(status, style: const TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 12),
                    _detailRow('Người nhận', shippingName),
                    _detailRow('SĐT', shippingPhone),
                    _detailRow('Địa chỉ', shippingAddress),
                    _detailRow('Tổng tiền', '$finalAmount ₫'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text('Sản phẩm trong đơn', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              ...items.map((item) {
                final product = item['product'] as Map<String, dynamic>? ?? {};
                final productName = product['name']?.toString() ?? item['name']?.toString() ?? 'Sản phẩm';
                final productId = product['id']?.toString() ?? item['productId']?.toString() ?? '';
                final quantity = (item['quantity'] as num?)?.toInt() ?? 0;
                final unitPrice = (item['unitPrice'] as num?)?.toDouble() ?? 0;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(productName, style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('SL: $quantity • Giá: ${unitPrice.toStringAsFixed(0)} ₫'),
                          ],
                        ),
                      ),
                      if (status == 'Delivered' || status == 'Confirmed')
                        TextButton(
                          onPressed: () => _showReviewDialog(productId: productId, productName: productName),
                          child: const Text('Đánh giá'),
                        ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 90, child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
