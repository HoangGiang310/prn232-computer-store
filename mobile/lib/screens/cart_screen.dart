import 'package:flutter/material.dart';

import '../models/cart_item.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import '../theme/app_theme.dart';
import '../widgets/store_ui.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> _items = [];
  Set<String> _selectedProductIds = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    final user = await AuthService.getCurrentUser();
    if (user == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bạn cần đăng nhập để xem giỏ hàng.')),
      );
      Navigator.pop(context);
      return;
    }

    final items = await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _items = items;
      _selectedProductIds = _selectedProductIds
          .where((id) => items.any((item) => item.productId == id))
          .toSet();
      _isLoading = false;
    });
  }

  Future<void> _persistCart(List<CartItem> items) async {
    await CartService.saveCart(items);
    if (!mounted) return;
    setState(() {
      _items = items;
      _selectedProductIds = _selectedProductIds
          .where((id) => items.any((item) => item.productId == id))
          .toSet();
    });
  }

  Future<void> _changeQuantity(String productId, int delta) async {
    final nextItems = _items.map((item) {
      if (item.productId != productId) return item;
      final nextQuantity = item.quantity + delta;
      if (nextQuantity <= 0) return null;
      if (nextQuantity > item.stockQuantity) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sản phẩm ${item.name} chỉ còn ${item.stockQuantity} cái trong kho.')),
        );
        return item;
      }
      return item.copyWith(quantity: nextQuantity);
    }).whereType<CartItem>().toList();

    await _persistCart(nextItems);
  }

  Future<void> _removeItem(String productId) async {
    final nextItems = _items.where((item) => item.productId != productId).toList();
    await _persistCart(nextItems);
  }

  Future<void> _clearCart() async {
    await CartService.clearCart();
    if (!mounted) return;
    setState(() {
      _items = [];
      _selectedProductIds.clear();
    });
  }

  double get _totalPrice => _items
      .where((item) => _selectedProductIds.contains(item.productId))
      .fold(0.0, (sum, item) => sum + item.price * item.quantity);

  int get _selectedItemQuantity => _items
      .where((item) => _selectedProductIds.contains(item.productId))
      .fold(0, (sum, item) => sum + item.quantity);

  String _formatPrice(double value) => '${value.toStringAsFixed(0)} ₫';

  @override
  Widget build(BuildContext context) {
    final allSelected = _items.isNotEmpty && _selectedProductIds.length == _items.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng'),
        actions: [
          if (_items.isNotEmpty)
            IconButton(
              onPressed: _clearCart,
              tooltip: 'Xóa giỏ hàng',
              icon: const Icon(Icons.delete_sweep_outlined),
            ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        top: false,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _items.isEmpty
                ? _buildEmptyCart()
                : Column(
                    children: [
                      _buildSelectionBar(allSelected),
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 18),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (_, index) => _buildCartItem(_items[index]),
                        ),
                      ),
                      _buildCheckoutBar(),
                    ],
                  ),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return StoreEmptyState(
      icon: Icons.shopping_bag_outlined,
      title: 'Giỏ hàng đang trống',
      message: 'Thêm sản phẩm bạn thích để bắt đầu đơn hàng.',
      key: const ValueKey('empty-cart'),
    );
  }

  Widget _buildSelectionBar(bool allSelected) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10, 8, 16, 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: Row(
        children: [
          Checkbox(
            value: allSelected,
            onChanged: (checked) {
              setState(() {
                _selectedProductIds = checked == true
                    ? _items.map((item) => item.productId).toSet()
                    : <String>{};
              });
            },
          ),
          Text(
            'Chọn tất cả',
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(width: 5),
          Text(
            '(${_items.length})',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const Spacer(),
          if (_selectedProductIds.isNotEmpty)
            TextButton(
              onPressed: () => setState(() => _selectedProductIds.clear()),
              child: const Text('Bỏ chọn'),
            ),
        ],
      ),
    );
  }

  Widget _buildCartItem(CartItem item) {
    final selected = _selectedProductIds.contains(item.productId);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 160),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: selected ? const Color(0xFFFFC8B8) : AppColors.borderSubtle,
          width: selected ? 1.4 : 1,
        ),
        boxShadow: const [
          BoxShadow(color: Color(0x08101828), blurRadius: 16, offset: Offset(0, 5)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 23),
            child: Checkbox(
              value: selected,
              onChanged: (checked) {
                setState(() {
                  if (checked == true) {
                    _selectedProductIds.add(item.productId);
                  } else {
                    _selectedProductIds.remove(item.productId);
                  }
                });
              },
            ),
          ),
          const SizedBox(width: 3),
          Container(
            width: 78,
            height: 78,
            decoration: BoxDecoration(
              color: AppColors.surfaceWarm,
              borderRadius: BorderRadius.circular(15),
            ),
            clipBehavior: Clip.antiAlias,
            child: item.imageUrl.isNotEmpty
                ? Image.network(
                    item.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(
                      Icons.laptop_mac_rounded,
                      color: AppColors.primary,
                      size: 34,
                    ),
                  )
                : const Icon(
                    Icons.laptop_mac_rounded,
                    color: AppColors.primary,
                    size: 34,
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textMain,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          height: 1.3,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    InkWell(
                      onTap: () => _removeItem(item.productId),
                      borderRadius: BorderRadius.circular(10),
                      child: const Padding(
                        padding: EdgeInsets.all(5),
                        child: Icon(
                          Icons.close_rounded,
                          color: AppColors.textTertiary,
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  '${item.brand} · ${item.category}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        _formatPrice(item.price),
                        style: AppTheme.priceDisplaySmall,
                      ),
                    ),
                    _QuantityControl(
                      quantity: item.quantity,
                      onMinus: () => _changeQuantity(item.productId, -1),
                      onPlus: () => _changeQuantity(item.productId, 1),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutBar() {
    final hasSelection = _selectedProductIds.isNotEmpty;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 13, 16, 15),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        boxShadow: [
          BoxShadow(color: Color(0x0A101828), blurRadius: 18, offset: Offset(0, -5)),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$_selectedItemQuantity sản phẩm đã chọn',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(_formatPrice(_totalPrice), style: AppTheme.priceDisplay),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 154,
                child: ElevatedButton(
                  onPressed: hasSelection ? _checkout : null,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Thanh toán'),
                      SizedBox(width: 6),
                      Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _checkout() {
    final selectedItems = _items
        .where((item) => _selectedProductIds.contains(item.productId))
        .toList();

    if (selectedItems.isEmpty) return;

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => CheckoutScreen(selectedItems: selectedItems)),
    ).then((_) => _loadCart());
  }
}

class _QuantityControl extends StatelessWidget {
  const _QuantityControl({
    required this.quantity,
    required this.onMinus,
    required this.onPlus,
  });

  final int quantity;
  final VoidCallback onMinus;
  final VoidCallback onPlus;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(11),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _QtyButton(icon: Icons.remove_rounded, onTap: onMinus),
          SizedBox(
            width: 30,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textMain,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          _QtyButton(icon: Icons.add_rounded, onTap: onPlus),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(5),
          child: Icon(icon, size: 15, color: AppColors.textMain),
        ),
      ),
    );
  }
}
