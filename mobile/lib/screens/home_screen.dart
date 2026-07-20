import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import '../services/product_service.dart';
import 'cart_screen.dart';
import 'login_screen.dart';
import 'order_history_screen.dart';
import 'product_detail_screen.dart';
import 'products_screen.dart';
import 'register_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ProductService _service = ProductService();
  List<Product> _products = [];
  List<CartItem> _items = [];
  bool _isLoading = true;
  String? _error;
  AuthUser? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadProducts();
  }

  Future<void> _loadUser() async {
    final user = await AuthService.getCurrentUser();
    final items = await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _currentUser = user;
      _items = items;
    });
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    setState(() => _currentUser = null);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng xuất thành công.')),
    );
    await _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final products = await _service.fetchProducts();
      if (!mounted) return;
      setState(() => _products = products.take(6).toList());
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getRoleLabel(String role) {
    return role.toLowerCase() == 'customer' ? 'KHÁCH HÀNG' : role.toUpperCase();
  }

  List<Widget> _buildSummaryCards(BuildContext context) {
    final cards = <Widget>[];

    void addCard(IconData icon, String title, String subtitle, Widget destination) {
      cards.add(_buildFeatureCard(context, icon, title, subtitle, destination));
    }

    addCard(Icons.inventory_2_outlined, 'Sản phẩm', 'Khám phá laptop & linh kiện', const ProductsScreen());
    addCard(Icons.shopping_cart_outlined, 'Giỏ hàng', 'Quản lý sản phẩm đã chọn', const CartScreen());
    addCard(Icons.receipt_long_outlined, 'Lịch sử đơn', 'Theo dõi đơn hàng của bạn', const OrderHistoryScreen());

    return cards;
  }

  Future<void> _addToCart(Product product) async {
    final existingIndex = _items.indexWhere((item) => item.productId == product.id);
    final updatedItems = List<CartItem>.from(_items);

    if (existingIndex >= 0) {
      updatedItems[existingIndex] = updatedItems[existingIndex].copyWith(
        quantity: updatedItems[existingIndex].quantity + 1,
      );
    } else {
      updatedItems.add(CartItem.fromProduct(product));
    }

    await CartService.saveCart(updatedItems);
    if (!mounted) return;
    setState(() => _items = updatedItems);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã thêm ${product.name} vào giỏ hàng.')),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _currentUser != null
                      ? 'XIN CHÀO, ${_currentUser!.fullName?.toUpperCase() ?? _currentUser!.username.toUpperCase()}'
                      : 'CHÀO MỪNG BẠN',
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.4,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'FLASH SALE',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Laptop & linh kiện công nghệ cho mọi nhu cầu',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _currentUser != null
                ? 'Bạn đang ở chế độ khách hàng. Duyệt sản phẩm, thêm vào giỏ và đặt hàng nhanh chóng.'
                : 'Đăng nhập hoặc đăng ký để đặt hàng trực tuyến, xem ưu đãi và theo dõi đơn hàng dễ dàng.',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _heroPill('Giao hàng nhanh', '24h nội thành'),
              _heroPill('Đổi trả 30 ngày', 'An tâm mua sắm'),
              _heroPill('Bảo hành toàn diện', 'Trọn gói'),
            ],
          ),
          if (_currentUser == null) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    ).then((_) => _loadUser());
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF60A5FA),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Đăng nhập'),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                    ).then((_) => _loadUser());
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Đăng ký'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _heroPill(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('TQG Computer Store'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        actions: [
          if (_currentUser != null)
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Đăng xuất',
              onPressed: _logout,
            )
          else
            IconButton(
              icon: const Icon(Icons.login),
              tooltip: 'Đăng nhập',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ).then((_) => _loadUser());
              },
            ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await _loadUser();
            await _loadProducts();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeroBanner(),
                const SizedBox(height: 20),
                _buildPromoCard(),
                const SizedBox(height: 20),
                const Text(
                  'Khám phá nhanh',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.15,
                  children: _buildSummaryCards(context),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Sản phẩm mới nhất',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    TextButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ProductsScreen()),
                      ),
                      child: const Text('Xem thêm'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (_isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (_error != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Text(_error!, style: const TextStyle(color: Colors.red)),
                  )
                else if (_products.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Text('Chưa có dữ liệu sản phẩm từ backend.'),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _products.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, index) {
                      final product = _products[index];
                      return InkWell(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
                        ),
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDBEAFE),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(Icons.computer, color: Color(0xFF1D4ED8)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text(product.brand, style: const TextStyle(color: Colors.black54)),
                                    const SizedBox(height: 6),
                                    Text(
                                      product.formattedPrice,
                                      style: const TextStyle(
                                        color: Color(0xFF1D4ED8),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () => _addToCart(product),
                                icon: const Icon(Icons.shopping_cart_outlined),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPromoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFDBEAFE), Color(0xFFF8FAFC)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ưu đãi hôm nay',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8)),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Giảm 10% cho đơn hàng trên 8 triệu và miễn phí vận chuyển nội thành.',
                  style: TextStyle(fontSize: 13, color: Colors.black87),
                ),
                const SizedBox(height: 12),
                TextButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProductsScreen()),
                  ),
                  icon: const Icon(Icons.local_offer_outlined),
                  label: const Text('Khám phá ngay'),
                ),
              ],
            ),
          ),
          Container(
            width: 86,
            height: 86,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.discount_outlined, size: 40, color: Color(0xFF1D4ED8)),
          ),
        ],
      ),
    );
  }

  static Widget _buildFeatureCard(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    Widget destination,
  ) {
    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => destination),
      ),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor: const Color(0xFFDBEAFE),
              child: Icon(icon, color: const Color(0xFF1D4ED8)),
            ),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          ],
        ),
      ),
    );
  }
}
