import 'package:flutter/material.dart';

class CustomersScreen extends StatelessWidget {
  const CustomersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Khách hàng')),
      body: const SafeArea(
        child: Center(
          child: Text('Màn hình khách hàng đang được phát triển.'),
        ),
      ),
    );
  }
}
