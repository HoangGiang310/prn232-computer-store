import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import '../services/product_service.dart';
import '../theme/app_theme.dart';
import '../widgets/store_ui.dart';
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
    _refreshAll();
  }

  Future<void> _refreshAll() async {
    await Future.wait([_loadUser(), _loadProducts()]);
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
    setState(() {
      _currentUser = null;
      _items = [];
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng xuất thành công.')),
    );
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

  int get _totalCartCount => _items.fold(0, (sum, item) => sum + item.quantity);

  Future<void> _openCart() async {
    if (_currentUser == null) {
      _showLoginRequired('Bạn cần đăng nhập để xem giỏ hàng.');
      return;
    }
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CartScreen()),
    );
    await _loadUser();
  }

  void _showLoginRequired(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.lock_outline_rounded, color: Colors.white, size: 19),
            const SizedBox(width: 9),
            Expanded(child: Text(message)),
          ],
        ),
      ),
    );
  }

  Future<void> _addToCart(Product product) async {
    if (_currentUser == null) {
      _showLoginRequired('Bạn cần đăng nhập để thêm sản phẩm vào giỏ.');
      return;
    }

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: _refreshAll,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHero(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 30),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildCategories(),
                      const SizedBox(height: 26),
                      const StoreSectionHeader(
                        title: 'Truy cập nhanh',
                        subtitle: 'Những tác vụ bạn dùng nhiều nhất',
                      ),
                      const SizedBox(height: 13),
                      _buildQuickActions(),
                      const SizedBox(height: 24),
                      _buildPromoCard(),
                      const SizedBox(height: 28),
                      StoreSectionHeader(
                        title: 'Sản phẩm mới',
                        subtitle: 'Các lựa chọn nổi bật vừa cập nhật',
                        actionLabel: 'Xem tất cả',
                        onAction: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const ProductsScreen()),
                        ),
                      ),
                      const SizedBox(height: 14),
                      _buildProducts(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      toolbarHeight: 66,
      title: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: .08)),
            ),
            child: const Icon(Icons.computer_rounded, size: 20),
          ),
          const SizedBox(width: 11),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'TQG Store',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
              ),
              SizedBox(height: 1),
              Text(
                'Tech for every setup',
                style: TextStyle(
                  fontSize: 9.5,
                  color: Color(0xFFB8BDC7),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              onPressed: _openCart,
              icon: const Icon(Icons.shopping_bag_outlined),
              tooltip: 'Giỏ hàng',
            ),
            if (_totalCartCount > 0)
              Positioned(
                right: 4,
                top: 6,
                child: Container(
                  constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppColors.ink, width: 1.5),
                  ),
                  child: Text(
                    '$_totalCartCount',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
          ],
        ),
        PopupMenuButton<String>(
          icon: Icon(
            _currentUser == null ? Icons.account_circle_outlined : Icons.account_circle_rounded,
          ),
          tooltip: 'Tài khoản',
          onSelected: (value) async {
            if (value == 'login') {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
              await _loadUser();
            } else if (value == 'register') {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const RegisterScreen()),
              );
              await _loadUser();
            } else if (value == 'logout') {
              await _logout();
            }
          },
          itemBuilder: (_) {
            if (_currentUser == null) {
              return const [
                PopupMenuItem(value: 'login', child: Text('Đăng nhập')),
                PopupMenuItem(value: 'register', child: Text('Đăng ký')),
              ];
            }
            return [
              PopupMenuItem(
                enabled: false,
                child: Text(_currentUser!.fullName ?? _currentUser!.username),
              ),
              const PopupMenuItem(value: 'logout', child: Text('Đăng xuất')),
            ];
          },
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildHero() {
    final fullName = _currentUser?.fullName?.trim();
    final name = fullName != null && fullName.isNotEmpty
        ? fullName
        : _currentUser?.username;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 22),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.ink, Color(0xFF262B35)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: .16),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppColors.primary.withValues(alpha: .3)),
                ),
                child: const Text(
                  'TQG SELECT',
                  style: TextStyle(
                    color: Color(0xFFFFA189),
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: .8,
                  ),
                ),
              ),
              const Spacer(),
              const Icon(Icons.verified_rounded, color: AppColors.tertiaryGold, size: 17),
              const SizedBox(width: 5),
              const Text(
                'Chính hãng',
                style: TextStyle(color: Color(0xFFD5D8DE), fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 17),
          Text(
            name == null ? 'Nâng cấp góc làm việc\ncủa bạn.' : 'Chào $name,\nhôm nay bạn cần gì?',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              height: 1.12,
              letterSpacing: -.6,
            ),
          ),
          const SizedBox(height: 9),
          const Text(
            'Laptop, màn hình và linh kiện được chọn lọc cho học tập, công việc và gaming.',
            style: TextStyle(
              color: Color(0xFFB8BDC7),
              fontSize: 12.5,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 18),
          InkWell(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProductsScreen()),
            ),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 21),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Tìm laptop, thương hiệu, linh kiện...',
                      style: TextStyle(color: AppColors.textTertiary, fontSize: 12.5),
                    ),
                  ),
                  Icon(Icons.tune_rounded, color: AppColors.primary, size: 19),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _HeroMetric(icon: Icons.local_shipping_outlined, label: 'Giao nhanh'),
              _HeroDivider(),
              _HeroMetric(icon: Icons.shield_outlined, label: 'Bảo hành'),
              _HeroDivider(),
              _HeroMetric(icon: Icons.cached_rounded, label: 'Đổi trả'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategories() {
    final categories = <({String label, IconData icon})>[
      (label: 'Tất cả', icon: Icons.apps_rounded),
      (label: 'Gaming', icon: Icons.sports_esports_rounded),
      (label: 'Văn phòng', icon: Icons.business_center_rounded),
      (label: 'Màn hình', icon: Icons.monitor_rounded),
      (label: 'Linh kiện', icon: Icons.memory_rounded),
    ];

    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final category = categories[index];
          final selected = index == 0;
          return InkWell(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProductsScreen()),
            ),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              width: 78,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
              decoration: BoxDecoration(
                color: selected ? AppColors.ink : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: selected ? AppColors.ink : AppColors.borderSubtle,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    category.icon,
                    size: 20,
                    color: selected ? Colors.white : AppColors.primary,
                  ),
                  const SizedBox(height: 7),
                  Text(
                    category.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: selected ? Colors.white : AppColors.textSecondary,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = <({IconData icon, String title, String subtitle, Color color, VoidCallback onTap})>[
      (
        icon: Icons.laptop_mac_rounded,
        title: 'Sản phẩm',
        subtitle: 'Khám phá ngay',
        color: AppColors.primary,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ProductsScreen()),
        ),
      ),
      (
        icon: Icons.shopping_bag_outlined,
        title: 'Giỏ hàng',
        subtitle: _totalCartCount == 0 ? 'Chưa có món' : '$_totalCartCount sản phẩm',
        color: const Color(0xFF6C63FF),
        onTap: () {
          _openCart();
        },
      ),
      (
        icon: Icons.receipt_long_rounded,
        title: 'Đơn hàng',
        subtitle: 'Theo dõi đơn',
        color: AppColors.successGreen,
        onTap: () {
          if (_currentUser == null) {
            _showLoginRequired('Bạn cần đăng nhập để xem lịch sử đơn hàng.');
            return;
          }
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
          );
        },
      ),
    ];

    return Row(
      children: List.generate(actions.length, (index) {
        final action = actions[index];
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index == actions.length - 1 ? 0 : 9),
            child: InkWell(
              onTap: action.onTap,
              borderRadius: BorderRadius.circular(18),
              child: Container(
                height: 122,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: action.color.withValues(alpha: .1),
                        borderRadius: BorderRadius.circular(11),
                      ),
                      child: Icon(action.icon, color: action.color, size: 20),
                    ),
                    const Spacer(),
                    Text(
                      action.title,
                      maxLines: 1,
                      style: const TextStyle(
                        color: AppColors.textMain,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      action.subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildPromoCard() {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: AppColors.surfaceWarm,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFFFDDD2)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(17),
            ),
            child: const Icon(Icons.local_offer_rounded, color: Colors.white, size: 25),
          ),
          const SizedBox(width: 13),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Deal dành cho setup mới',
                  style: TextStyle(
                    color: AppColors.textMain,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Giảm 10% cho đơn từ 8 triệu và hỗ trợ giao hàng nhanh.',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_forward_rounded, color: AppColors.primary),
        ],
      ),
    );
  }

  Widget _buildProducts() {
    if (_isLoading) {
      return Column(
        children: List.generate(
          3,
          (index) => Container(
            height: 108,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderSubtle),
            ),
          ),
        ),
      );
    }

    if (_error != null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          children: [
            const Icon(Icons.cloud_off_rounded, color: AppColors.error, size: 34),
            const SizedBox(height: 8),
            Text(
              'Không thể tải sản phẩm lúc này.',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 5),
            Text(
              _error!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _loadProducts,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Tải lại'),
            ),
          ],
        ),
      );
    }

    if (_products.isEmpty) {
      return const StoreEmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'Chưa có sản phẩm',
        message: 'Sản phẩm mới sẽ xuất hiện tại đây khi backend có dữ liệu.',
      );
    }

    return Column(
      children: _products
          .map(
            (product) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: StoreProductCard(
                product: product,
                compact: true,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
                ),
                onAdd: () => _addToCart(product),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: const Color(0xFFD5D8DE), size: 15),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xFFD5D8DE), fontSize: 10.5),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroDivider extends StatelessWidget {
  const _HeroDivider();

  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 18, color: Colors.white12);
  }
}
