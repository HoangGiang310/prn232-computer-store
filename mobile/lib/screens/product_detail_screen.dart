import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/cart_service.dart';
import '../services/review_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ReviewService _reviewService = ReviewService();
  Map<String, dynamic> _summary = {};
  List<dynamic> _reviews = [];
  bool _isLoadingReviews = true;
  String? _reviewError;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _isLoadingReviews = true;
      _reviewError = null;
    });

    try {
      final summary = await _reviewService.fetchSummary(productId: widget.product.id);
      final reviews = await _reviewService.fetchReviews(productId: widget.product.id);

      if (!mounted) return;
      setState(() {
        _summary = summary;
        _reviews = reviews;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _reviewError = error.toString());
    } finally {
      if (mounted) setState(() => _isLoadingReviews = false);
    }
  }

  Future<void> _addToCart() async {
    final existingItems = await CartService.getCart();
    final existingIndex = existingItems.indexWhere((item) => item.productId == widget.product.id);
    final nextItems = List<CartItem>.from(existingItems);

    if (existingIndex >= 0) {
      nextItems[existingIndex] = nextItems[existingIndex].copyWith(
        quantity: nextItems[existingIndex].quantity + 1,
      );
    } else {
      nextItems.add(CartItem.fromProduct(widget.product));
    }

    await CartService.saveCart(nextItems);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã thêm ${widget.product.name} vào giỏ hàng.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final average = (_summary['averageRating'] as num?)?.toDouble() ?? 0;
    final totalReviews = (_summary['totalReviews'] as num?)?.toInt() ?? 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết sản phẩm')),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    height: 220,
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(Icons.computer, size: 72, color: Color(0xFF1D4ED8)),
                  ),
                  const SizedBox(height: 16),
                  Text(widget.product.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(widget.product.brand, style: const TextStyle(fontSize: 16, color: Colors.black54)),
                  const SizedBox(height: 12),
                  Text(widget.product.formattedPrice, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 6),
                      Text('$average/5', style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      Text('($totalReviews đánh giá)', style: const TextStyle(color: Colors.black54)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Mô tả sản phẩm', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(widget.product.specifications),
                        const SizedBox(height: 8),
                        Text('Tồn kho: ${widget.product.stockQuantity}'),
                        const SizedBox(height: 8),
                        Text('Danh mục: ${widget.product.category}'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Đánh giá khách hàng', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  if (_isLoadingReviews)
                    const Center(child: CircularProgressIndicator())
                  else if (_reviewError != null)
                    Text(_reviewError!)
                  else if (_reviews.isEmpty)
                    const Text('Chưa có đánh giá nào cho sản phẩm này.')
                  else
                    ..._reviews.take(3).map((review) {
                      final rating = (review['rating'] as num?)?.toInt() ?? 0;
                      final customerName = review['customerName']?.toString() ?? 'Khách hàng';
                      final title = review['title']?.toString() ?? '';
                      final content = review['content']?.toString() ?? '';

                      return Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 12),
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
                                Text(customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                const Spacer(),
                                Row(
                                  children: List.generate(5, (index) {
                                    return Icon(
                                      Icons.star,
                                      size: 16,
                                      color: index < rating ? Colors.amber : Colors.grey.shade300,
                                    );
                                  }),
                                ),
                              ],
                            ),
                            if (title.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            ],
                            const SizedBox(height: 6),
                            Text(content),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _addToCart,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: const Text('Thêm vào giỏ hàng'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
