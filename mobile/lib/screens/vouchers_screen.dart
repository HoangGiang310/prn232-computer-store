import 'package:flutter/material.dart';

class VouchersScreen extends StatelessWidget {
  const VouchersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voucher')),
      body: const SafeArea(
        child: Center(
          child: Text('Màn hình voucher đang được phát triển.'),
        ),
      ),
    );
  }
}
