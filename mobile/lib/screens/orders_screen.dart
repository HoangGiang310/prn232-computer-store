import 'package:flutter/material.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đơn hàng')),
      body: const SafeArea(
        child: Center(
          child: Text('Màn hình đơn hàng đang được đồng bộ với backend.'),
        ),
      ),
    );
  }
}
