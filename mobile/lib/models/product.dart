class Product {
  final String id;
  final String productCode;
  final String name;
  final String category;
  final String brand;
  final String specifications;
  final double price;
  final int stockQuantity;
  final List<String> imageUrls;

  const Product({
    required this.id,
    required this.productCode,
    required this.name,
    required this.category,
    required this.brand,
    required this.specifications,
    required this.price,
    required this.stockQuantity,
    this.imageUrls = const [],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final rawImages = json['images'];
    final imageUrls = <String>[];

    if (rawImages is List) {
      for (final item in rawImages) {
        if (item is Map<String, dynamic>) {
          final imageUrl = item['imageUrl']?.toString();
          if (imageUrl != null && imageUrl.isNotEmpty) {
            imageUrls.add(imageUrl);
          }
        }
      }
    }

    return Product(
      id: json['id']?.toString() ?? '',
      productCode: json['productCode']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Sản phẩm',
      category: json['category']?.toString() ?? 'General',
      brand: json['brand']?.toString() ?? 'Unknown',
      specifications: json['specifications']?.toString() ?? 'Không có mô tả',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 0,
      imageUrls: imageUrls,
    );
  }

  String get formattedPrice {
    final amount = price.toStringAsFixed(0);
    return '$amount ₫';
  }

  String get firstImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
}
