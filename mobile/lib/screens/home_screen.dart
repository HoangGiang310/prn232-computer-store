import 'package:flutter/material.dart';

import '../models/product.dart';
import '../services/auth_service.dart';
import '../services/product_service.dart';
import 'create_order_screen.dart';
import 'customers_screen.dart';
import 'inventory_screen.dart';
import 'login_screen.dart';
import 'orders_screen.dart';
import 'product_detail_screen.dart';
import 'products_screen.dart';
import 'register_screen.dart';
import 'reports_screen.dart';
import 'vouchers_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ProductService _service = ProductService();
  List<Product> _products = [];
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
    if (!mounted) return;
    setState(() {
      _currentUser = user;
    });
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    setState(() {
      _currentUser = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng xuất thành công.')),
    );
    _loadProducts();
  }

  String _getRoleLabel(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'QUẢN TRỊ VIÊN';
      case 'sales':
      case 'staff':
        return 'NHÂN VIÊN BÁN HÀNG';
      case 'warehouse':
      case 'manager':
        return 'THỦ KHO / QUẢN LÝ KHO';
      case 'accountant':
      case 'bookkeeper':
        return 'KẾ TOÁN';
      case 'customer':
        return 'KHÁCH HÀNG';
      default:
        return role.toUpperCase();
    }
  }

  List<Widget> _buildFeatureCards(BuildContext context) {
    final cards = <Widget>[];

    void addCard(IconData icon, String title, String subtitle, Widget destination) {
      cards.add(_homeFeatureCard(context, icon, title, subtitle, destination));
    }

    final role = _currentUser?.role.toLowerCase();

    if (role == null) {
      addCard(
        Icons.inventory_2_outlined,
        'Sản phẩm',
        'Xem và lọc sản phẩm',
        const ProductsScreen(),
      );
      return cards;
    }

    if (role == 'admin') {
      addCard(Icons.inventory_2_outlined, 'Sản phẩm', 'Xem và lọc sản phẩm', const ProductsScreen());
      addCard(Icons.shopping_bag_outlined, 'Đơn hàng', 'Theo dõi đơn', const OrdersScreen());
      addCard(Icons.bar_chart_outlined, 'Báo cáo', 'Doanh thu và thống kê', const ReportsScreen());
      addCard(Icons.people_alt_outlined, 'Khách hàng', 'Danh sách khách mua', const CustomersScreen());
      addCard(Icons.warehouse_outlined, 'Kho hàng', 'Điều chỉnh tồn kho', const InventoryScreen());
      addCard(Icons.confirmation_num_outlined, 'Voucher', 'Quản lý khuyến mãi', const VouchersScreen());
    } else if (role == 'sales' || role == 'staff') {
      addCard(Icons.inventory_2_outlined, 'Sản phẩm', 'Xem và lọc sản phẩm', const ProductsScreen());
      addCard(Icons.add_shopping_cart_outlined, 'Tạo đơn', 'Tạo đơn hàng POS', const CreateOrderScreen());
      addCard(Icons.shopping_bag_outlined, 'Đơn hàng', 'Theo dõi đơn', const OrdersScreen());
      addCard(Icons.people_alt_outlined, 'Khách hàng', 'Danh sách khách mua', const CustomersScreen());
    } else if (role == 'warehouse' || role == 'manager') {
      addCard(Icons.inventory_2_outlined, 'Sản phẩm', 'Xem và lọc sản phẩm', const ProductsScreen());
      addCard(Icons.warehouse_outlined, 'Kho hàng', 'Điều chỉnh tồn kho', const InventoryScreen());
      addCard(Icons.shopping_bag_outlined, 'Đơn hàng', 'Theo dõi đơn', const OrdersScreen());
    } else if (role == 'accountant' || role == 'bookkeeper') {
      addCard(Icons.bar_chart_outlined, 'Báo cáo', 'Doanh thu và thống kê', const ReportsScreen());
    } else if (role == 'customer') {
      addCard(Icons.inventory_2_outlined, 'Sản phẩm', 'Xem và lọc sản phẩm', const ProductsScreen());
      addCard(Icons.shopping_bag_outlined, 'Đơn hàng', 'Đơn hàng của bạn', const OrdersScreen());
      addCard(Icons.confirmation_num_outlined, 'Voucher', 'Danh sách khuyến mãi', const VouchersScreen());
    }

    return cards;
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final products = await _service.fetchProducts();
      if (!mounted) return;
      setState(() => _products = products.take(4).toList());
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
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
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentUser != null
                            ? 'XIN CHÀO: ${_currentUser!.fullName?.toUpperCase() ?? _currentUser!.username.toUpperCase()}'
                            : 'CHÀO MỪNG BẠN',
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _currentUser != null
                            ? 'Vai trò: ${_getRoleLabel(_currentUser!.role)}'
                            : 'Trải nghiệm mua sắm laptop hàng đầu',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _currentUser != null
                            ? 'Bạn đã đăng nhập vào hệ thống quản lý cửa hàng.'
                            : 'Đăng nhập hoặc Đăng ký để đặt hàng trực tuyến, áp dụng voucher và viết đánh giá sản phẩm.',
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
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
                                backgroundColor: const Color(0xFF1D4ED8),
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
                      ]
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Chức năng chính',
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
                  children: _buildFeatureCards(context),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Sản phẩm mới nhất',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ProductsScreen()),
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
                    child: Text(_error!,
                        style: const TextStyle(color: Colors.red)),
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
                          MaterialPageRoute(
                            builder: (_) =>
                                ProductDetailScreen(product: product),
                          ),
                        ),
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDBEAFE),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(
                                  Icons.computer,
                                  color: Color(0xFF1D4ED8),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      product.brand,
                                      style: const TextStyle(
                                          color: Colors.black54),
                                    ),
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
                                onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CreateOrderScreen(
                                        selectedProduct: product),
                                  ),
                                ),
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

  static Widget _homeFeatureCard(
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
              color: Colors.black.withValues(alpha: 0.04),
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
            Text(
              subtitle,
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
