import '../services/api_service.dart';

class ReviewService {
  Future<Map<String, dynamic>> checkEligibility({
    required String productId,
    required String token,
  }) async {
    final response = await ApiService.get(
      '/api/reviews/product/$productId/eligibility',
      token: token,
    );

    if (response is Map<String, dynamic>) {
      return response;
    }

    return {};
  }

  Future<Map<String, dynamic>> fetchSummary({required String productId}) async {
    final response = await ApiService.get('/api/reviews/product/$productId/summary');
    if (response is Map<String, dynamic>) {
      return response;
    }
    return {};
  }

  Future<List<dynamic>> fetchReviews({required String productId}) async {
    final response = await ApiService.get('/api/reviews/product/$productId');
    if (response is Map<String, dynamic>) {
      final reviews = response['reviews'];
      if (reviews is List) {
        return reviews;
      }
    }
    return [];
  }

  Future<Map<String, dynamic>> submitReview({
    required String productId,
    required String token,
    required int rating,
    required String title,
    required String content,
  }) async {
    final response = await ApiService.post(
      '/api/reviews',
      body: {
        'productId': productId,
        'rating': rating,
        'title': title.trim().isEmpty ? 'Đánh giá sản phẩm' : title.trim(),
        'content': content.trim().isEmpty ? 'Sản phẩm rất tốt.' : content.trim(),
      },
      token: token,
    );

    if (response is Map<String, dynamic>) {
      return response;
    }

    return {};
  }
}
