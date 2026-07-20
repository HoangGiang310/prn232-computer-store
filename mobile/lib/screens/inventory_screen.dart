import 'package:flutter/material.dart';

class InventoryScreen extends StatelessWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kho hàng')),
      body: const SafeArea(
        child: Center(
          child: Text('Màn hình kho hàng đang được phát triển.'),
        ),
      ),
    );
  }
}
