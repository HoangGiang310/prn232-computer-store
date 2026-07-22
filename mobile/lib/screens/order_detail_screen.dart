import 'package:flutter/material.dart';

import '../services/api_service.dart';
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
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.info_outline, color: Colors.white),
              SizedBox(width: 10),
              Expanded(child: Text('Bạn cần đăng nhập để đánh giá sản phẩm.')),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFFEF4444),
        ),
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
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFFEF4444),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: [
                  const Icon(Icons.rate_review_rounded, color: Color(0xFF1D4ED8)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Đánh giá: $productName',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chọn số sao:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final starValue = index + 1;
                        return IconButton(
                          onPressed: () => setDialogState(() => selectedRating = starValue),
                          icon: Icon(
                            Icons.star_rounded,
                            color: starValue <= selectedRating ? Colors.amber : Colors.grey.shade300,
                            size: 32,
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: titleController,
                      decoration: InputDecoration(
                        labelText: 'Tiêu đề đánh giá',
                        hintText: 'Ví dụ: Sản phẩm rất tốt',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: contentController,
                      minLines: 3,
                      maxLines: 5,
                      decoration: InputDecoration(
                        labelText: 'Nội dung đánh giá',
                        hintText: 'Nêu cảm nhận chi tiết của bạn về sản phẩm...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1D4ED8),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
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
                        SnackBar(
                          content: const Row(
                            children: [
                              Icon(Icons.check_circle_outline, color: Colors.white),
                              SizedBox(width: 10),
                              Text('Đánh giá của bạn đã được gửi thành công.'),
                            ],
                          ),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          backgroundColor: const Color(0xFF059669),
                        ),
                      );
                    } catch (error) {
                      if (!mounted) return;
                      dialogMessenger.showSnackBar(
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
                  },
                  child: _isSubmitting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Gửi đánh giá'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return const Color(0xFF059669);
      case 'confirmed':
      case 'processing':
        return const Color(0xFF1D4ED8);
      case 'cancelled':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFFD97706);
    }
  }

  String _formatStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'ĐÃ GIAO HÀNG THÀNH CÔNG';
      case 'confirmed':
        return 'ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN';
      case 'processing':
        return 'ĐANG XỬ LÝ & ĐÓNG GÓI';
      case 'cancelled':
        return 'ĐƠN HÀNG ĐÃ BỊ HỦY';
      case 'new':
        return 'ĐƠN HÀNG MỚI TẠO';
      default:
        return status.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    final orderId = widget.order['id']?.toString() ?? '...';
    final finalAmount = (widget.order['finalAmount'] as num?)?.toStringAsFixed(0) ?? '0';
    final totalAmount = (widget.order['totalAmount'] as num?)?.toStringAsFixed(0) ?? finalAmount;
    final discountAmount = (widget.order['discountAmount'] as num?)?.toDouble() ?? 0.0;
    final voucherCode = widget.order['voucherCode']?.toString() ?? '';
    final items = (widget.order['orderItems'] as List?) ?? [];
    final shippingName = widget.order['shippingName']?.toString() ?? '---';
    final shippingAddress = widget.order['shippingAddress']?.toString() ?? '---';
    final shippingPhone = widget.order['shippingPhone']?.toString() ?? '---';
    final paymentMethod = widget.order['paymentMethod']?.toString() ?? 'E-Wallet';
    final status = _status ?? 'New';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Chi tiết đơn hàng'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Status Banner Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFF0F172A), _getStatusColor(status)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(16),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha(30),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'ĐƠN HÀNG #${orderId.length > 8 ? orderId.substring(0, 8) : orderId}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            paymentMethod,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      _formatStatusLabel(status),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Shipping Info Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
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
                        Icon(Icons.location_on_rounded, color: Color(0xFF1D4ED8), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Thông tin nhận hàng',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _infoRow(Icons.person_outline_rounded, 'Người nhận', shippingName),
                    _infoRow(Icons.phone_outlined, 'Số điện thoại', shippingPhone),
                    _infoRow(Icons.map_outlined, 'Địa chỉ', shippingAddress),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Order Items Header
              const Row(
                children: [
                  Icon(Icons.shopping_bag_rounded, color: Color(0xFF1D4ED8), size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Sản phẩm trong đơn',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Order Items List
              ...items.map((item) {
                final product = item['product'] as Map<String, dynamic>? ?? {};
                final productName = product['name']?.toString() ?? item['name']?.toString() ?? 'Sản phẩm';
                final productId = product['id']?.toString() ?? item['productId']?.toString() ?? '';
                final quantity = (item['quantity'] as num?)?.toInt() ?? 0;
                final unitPrice = (item['unitPrice'] as num?)?.toDouble() ?? 0;
                final images = product['images'] as List?;
                final firstImage = (images != null && images.isNotEmpty && images[0] is Map)
                    ? images[0]['imageUrl']?.toString() ?? ''
                    : item['imageUrl']?.toString() ?? '';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: firstImage.isNotEmpty
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.network(
                                      firstImage,
                                      width: 52,
                                      height: 52,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const Icon(Icons.laptop_mac_rounded, color: Color(0xFF1D4ED8)),
                                    ),
                                  )
                                : const Icon(Icons.laptop_mac_rounded, color: Color(0xFF1D4ED8)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  productName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'SL: $quantity × ${unitPrice.toStringAsFixed(0)} ₫',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${(quantity * unitPrice).toStringAsFixed(0)} ₫',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                              color: Color(0xFF1D4ED8),
                            ),
                          ),
                        ],
                      ),
                      if (status == 'Delivered' || status == 'Confirmed') ...[
                        const SizedBox(height: 10),
                        const Divider(height: 1, color: Color(0xFFF1F5F9)),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _showReviewDialog(
                                productId: productId,
                                productName: productName,
                              ),
                              icon: const Icon(Icons.star_outline_rounded, size: 16),
                              label: const Text('Viết đánh giá'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF1D4ED8),
                                side: const BorderSide(color: Color(0xFF93C5FD)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                );
              }),
              const SizedBox(height: 12),

              // Payment Summary Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(10),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _priceRow('Tạm tính', '$totalAmount ₫'),
                    if (discountAmount > 0)
                      _priceRow(
                        'Giảm giá ${voucherCode.isNotEmpty ? "(Voucher: $voucherCode)" : ""}',
                        '-${discountAmount.toStringAsFixed(0)} ₫',
                        valueColor: const Color(0xFF059669),
                      ),
                    _priceRow('Phí vận chuyển', 'Miễn phí'),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(height: 1, color: Color(0xFFF1F5F9)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Tổng thanh toán',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        Text(
                          '$finalAmount ₫',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1D4ED8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (status == 'New') ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 2,
                    ),
                    onPressed: _cancelOrder,
                    icon: const Icon(Icons.cancel_outlined),
                    label: const Text(
                      'HỦY ĐƠN HÀNG NÀY',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _cancelOrder() async {
    final orderId = widget.order['id']?.toString();
    if (orderId == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444)),
            SizedBox(width: 8),
            Text('Xác nhận hủy đơn'),
          ],
        ),
        content: const Text('Bạn có chắc chắn muốn hủy đơn hàng này không? Sản phẩm sẽ được hoàn tự động về kho.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Bỏ qua'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hủy đơn hàng'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final user = await AuthService.getCurrentUser();
      if (user?.token == null) return;

      final orderChannel = widget.order['orderChannel']?.toString() ?? 'Online';
      final paymentMethod = widget.order['paymentMethod']?.toString() ?? 'E-Wallet';

      await ApiService.put(
        '/api/orders/$orderId',
        body: {
          'orderStatus': 'Cancelled',
          'orderChannel': orderChannel,
          'paymentMethod': paymentMethod,
        },
        token: user!.token,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hủy đơn hàng thành công!'),
          backgroundColor: Color(0xFF059669),
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF64748B)),
          const SizedBox(width: 8),
          SizedBox(
            width: 90,
            child: Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor)),
        ],
      ),
    );
  }
}
