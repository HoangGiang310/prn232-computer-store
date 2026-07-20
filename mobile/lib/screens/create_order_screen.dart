import 'package:flutter/material.dart';

import '../models/product.dart';

class CreateOrderScreen extends StatefulWidget {
  final Product? selectedProduct;

  const CreateOrderScreen({super.key, this.selectedProduct});

  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  int quantity = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tạo đơn hàng')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.selectedProduct?.name ?? 'Sản phẩm được chọn',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(widget.selectedProduct?.formattedPrice ?? '0 ₫'),
              const SizedBox(height: 20),
              Row(
                children: [
                  IconButton(
                    onPressed: () => setState(() => quantity = quantity > 1 ? quantity - 1 : 1),
                    icon: const Icon(Icons.remove),
                  ),
                  Text('$quantity', style: const TextStyle(fontSize: 18)),
                  IconButton(
                    onPressed: () => setState(() => quantity++),
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Đã thêm $quantity sản phẩm vào đơn hàng.')),
                    );
                  },
                  child: const Text('Xác nhận đơn'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
