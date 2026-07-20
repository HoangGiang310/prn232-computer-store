import 'product.dart';

class CartItem {
  final String productId;
  final String name;
  final String brand;
  final String category;
  final double price;
  final int quantity;
  final int stockQuantity;

  const CartItem({
    required this.productId,
    required this.name,
    required this.brand,
    required this.category,
    required this.price,
    required this.quantity,
    required this.stockQuantity,
  });

  CartItem copyWith({
    String? productId,
    String? name,
    String? brand,
    String? category,
    double? price,
    int? quantity,
    int? stockQuantity,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      category: category ?? this.category,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      stockQuantity: stockQuantity ?? this.stockQuantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'name': name,
      'brand': brand,
      'category': category,
      'price': price,
      'quantity': quantity,
      'stockQuantity': stockQuantity,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      productId: json['productId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 0,
    );
  }

  factory CartItem.fromProduct(Product product) {
    return CartItem(
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      quantity: 1,
      stockQuantity: product.stockQuantity,
    );
  }
}
