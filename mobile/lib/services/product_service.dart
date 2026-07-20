import '../models/product.dart';
import 'api_service.dart';

class ProductService {
  Future<List<Product>> fetchProducts() async {
    final response = await ApiService.get('/api/products');

    if (response is List) {
      return response
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    if (response is Map<String, dynamic>) {
      final list = response['data'] ?? response['items'] ?? response['products'];
      if (list is List) {
        return list
            .map((item) => Product.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    return [];
  }

  Future<Product?> fetchProductById(String id) async {
    final response = await ApiService.get('/api/products/$id');

    if (response is Map<String, dynamic>) {
      final decoded = response['data'] ?? response;
      if (decoded is Map<String, dynamic>) {
        return Product.fromJson(decoded);
      }
    }

    return null;
  }
}
