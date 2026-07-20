import 'package:flutter/material.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Báo cáo')),
      body: const SafeArea(
        child: Center(
          child: Text('Màn hình báo cáo đang được phát triển.'),
        ),
      ),
    );
  }
}
