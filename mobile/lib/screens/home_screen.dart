import 'package:flutter/material.dart';
import 'customers_screen.dart';
import 'inventory_screen.dart';
import 'login_screen.dart';
import 'orders_screen.dart';
import 'products_screen.dart';
import 'reports_screen.dart';
import 'vouchers_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('TQG Computer Store'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1D4ED8), Color(0xFF2563EB)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('SIÊU ƯU ĐÃI',
                        style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            letterSpacing: 2)),
                    SizedBox(height: 8),
                    Text('Công nghệ mới, giá tốt, giao hàng nhanh',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text(
                        'Laptop - PC - Linh kiện cho game thủ, đồ họa và công việc.',
                        style: TextStyle(color: Colors.white70)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text('Chức năng chính',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.15,
                children: [
                  _homeFeatureCard(context, Icons.login_rounded, 'Đăng nhập',
                      'Truy cập hệ thống', const LoginScreen()),
                  _homeFeatureCard(context, Icons.inventory_2_outlined,
                      'Sản phẩm', 'Xem hàng tồn kho', const ProductsScreen()),
                  _homeFeatureCard(context, Icons.shopping_bag_outlined,
                      'Đơn hàng', 'Theo dõi đơn', const OrdersScreen()),
                  _homeFeatureCard(context, Icons.bar_chart_outlined, 'Báo cáo',
                      'Doanh thu và thống kê', const ReportsScreen()),
                  _homeFeatureCard(
                      context,
                      Icons.people_alt_outlined,
                      'Khách hàng',
                      'Danh sách khách mua',
                      const CustomersScreen()),
                  _homeFeatureCard(
                      context,
                      Icons.warehouse_outlined,
                      'Kho hàng',
                      'Điều chỉnh tồn kho',
                      const InventoryScreen()),
                  _homeFeatureCard(context, Icons.confirmation_num_outlined,
                      'Voucher', 'Quản lý khuyến mãi', const VouchersScreen()),
                ],
              ),
              const SizedBox(height: 20),
              const Text('Sản phẩm nổi bật',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _highlightTile(
                  'Laptop Gaming RTX 4060', '24.990.000 ₫', 'Bán chạy'),
              const SizedBox(height: 10),
              _highlightTile('PC Đồ họa Creator', '31.500.000 ₫', 'Mới'),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _homeFeatureCard(BuildContext context, IconData icon,
      String title, String subtitle, Widget destination) {
    return InkWell(
      onTap: () => Navigator.push(
          context, MaterialPageRoute(builder: (_) => destination)),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)
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
            Text(subtitle,
                style: const TextStyle(fontSize: 12, color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  static Widget _highlightTile(String title, String price, String tag) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)
        ],
      ),
      child: Row(
        children: [
          const CircleAvatar(child: Icon(Icons.computer)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(price,
                    style: const TextStyle(
                        color: Color(0xFF1D4ED8), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Chip(label: Text(tag), backgroundColor: const Color(0xFFDBEAFE)),
        ],
      ),
    );
  }
}
