import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../models/auth_user.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final List<CartItem>? selectedItems;

  const CheckoutScreen({super.key, this.selectedItems});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _shippingNameController = TextEditingController();
  final _shippingPhoneController = TextEditingController();
  final _specificAddressController = TextEditingController();

  List<Map<String, dynamic>> _provinces = [];
  List<Map<String, dynamic>> _districts = [];
  List<Map<String, dynamic>> _wards = [];

  String? _selectedProvinceCode;
  String? _selectedDistrictCode;
  String? _selectedWardCode;
  bool _isAddressOffline = false;

  List<Map<String, dynamic>> _vouchers = [];
  Map<String, dynamic>? _selectedVoucher;
  double _discountAmount = 0.0;

  AuthUser? _currentUser;
  List<CartItem> _items = [];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadUserAndCart();
  }

  @override
  void dispose() {
    _shippingNameController.dispose();
    _shippingPhoneController.dispose();
    _specificAddressController.dispose();
    super.dispose();
  }

  Future<void> _loadUserAndCart() async {
    final user = await AuthService.getCurrentUser();
    final items = widget.selectedItems ?? await CartService.getCart();
    if (!mounted) return;
    setState(() {
      _currentUser = user;
      _items = items;
    });

    if (_currentUser != null) {
      _shippingNameController.text = _currentUser!.fullName ?? _currentUser!.username;
    }

    await _loadProvinces();
    await _loadVouchers();
  }

  // Vietnam Address administrative division database fallback (Offline)
  static const Map<String, Map<String, dynamic>> _fallbackData = {
    "1": {
      "name": "Thành phố Hà Nội",
      "districts": {
        "1": {
          "name": "Quận Ba Đình",
          "wards": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cống Vị", "Phường Kim Mã", "Phường Ngọc Khánh"]
        },
        "2": {
          "name": "Quận Hoàn Kiếm",
          "wards": ["Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào", "Phường Hàng Bồ", "Phường Cửa Đông"]
        },
        "3": {
          "name": "Quận Tây Hồ",
          "wards": ["Phường Phú Thượng", "Phường Nhật Tân", "Phường Quảng An", "Phường Xuân La", "Phường Bưởi", "Phường Thụy Khuê"]
        }
      }
    },
    "79": {
      "name": "Thành phố Hồ Chí Minh",
      "districts": {
        "760": {
          "name": "Quận 1",
          "wards": ["Phường Tân Định", "Phường Đa Kao", "Phường Bến Nghé", "Phường Bến Thành", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão"]
        },
        "764": {
          "name": "Quận Gò Vấp",
          "wards": ["Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8"]
        },
        "769": {
          "name": "Thành phố Thủ Đức",
          "wards": ["Phường Linh Xuân", "Phường Linh Trung", "Phường Linh Chiểu", "Phường Trường Thọ", "Phường Bình Thọ", "Phường Linh Đông"]
        }
      }
    },
    "48": {
      "name": "Thành phố Đà Nẵng",
      "districts": {
        "490": {
          "name": "Quận Hải Châu",
          "wards": ["Phường Thanh Bình", "Phường Thuận Phước", "Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II"]
        },
        "492": {
          "name": "Quận Thanh Khê",
          "wards": ["Phường Tam Thuận", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung"]
        }
      }
    }
  };

  Future<void> _loadProvinces() async {
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/?depth=1'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _provinces = data.map((item) => {
            'code': item['code'].toString(),
            'name': item['name'].toString(),
          }).toList();
          _provinces.sort((a, b) => a['name']!.compareTo(b['name']!));
          _isAddressOffline = false;
        });
      } else {
        throw Exception();
      }
    } catch (_) {
      setState(() {
        _provinces = _fallbackData.entries.map((e) => {
          'code': e.key,
          'name': e.value['name'].toString(),
        }).toList();
        _provinces.sort((a, b) => a['name']!.compareTo(b['name']!));
        _isAddressOffline = true;
      });
    }
  }

  Future<void> _loadDistricts(String provinceCode) async {
    if (_isAddressOffline) {
      final provData = _fallbackData[provinceCode];
      if (provData != null && provData['districts'] != null) {
        final Map<String, dynamic> distMap = provData['districts'];
        setState(() {
          _districts = distMap.entries.map((e) => {
            'code': e.key,
            'name': e.value['name'].toString(),
          }).toList();
          _districts.sort((a, b) => a['name']!.compareTo(b['name']!));
          _selectedDistrictCode = null;
          _wards = [];
          _selectedWardCode = null;
        });
      }
      return;
    }

    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$provinceCode?depth=2'));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> distList = data['districts'] ?? [];
        setState(() {
          _districts = distList.map((item) => {
            'code': item['code'].toString(),
            'name': item['name'].toString(),
          }).toList();
          _districts.sort((a, b) => a['name']!.compareTo(b['name']!));
          _selectedDistrictCode = null;
          _wards = [];
          _selectedWardCode = null;
        });
      }
    } catch (e) {
      debugPrint('Lỗi tải quận/huyện: $e');
    }
  }

  Future<void> _loadWards(String districtCode) async {
    if (_isAddressOffline) {
      final provData = _fallbackData[_selectedProvinceCode];
      if (provData != null && provData['districts'] != null) {
        final distData = provData['districts'][districtCode];
        if (distData != null && distData['wards'] != null) {
          final List<dynamic> wardList = distData['wards'];
          setState(() {
            _wards = wardList.map((w) => {
              'code': w.toString(),
              'name': w.toString(),
            }).toList();
            _wards.sort((a, b) => a['name']!.compareTo(b['name']!));
            _selectedWardCode = null;
          });
        }
      }
      return;
    }

    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$districtCode?depth=2'));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> wardList = data['wards'] ?? [];
        setState(() {
          _wards = wardList.map((item) => {
            'code': item['code'].toString(),
            'name': item['name'].toString(),
          }).toList();
          _wards.sort((a, b) => a['name']!.compareTo(b['name']!));
          _selectedWardCode = null;
        });
      }
    } catch (e) {
      debugPrint('Lỗi tải phường/xã: $e');
    }
  }

  Future<void> _loadVouchers() async {
    try {
      final token = _currentUser?.token;
      if (token == null) return;
      final response = await ApiService.get('/api/vouchers', token: token);
      if (response is List) {
        final now = DateTime.now();
        setState(() {
          _vouchers = response.map((v) => Map<String, dynamic>.from(v)).where((v) {
            final start = DateTime.parse(v['startDate']);
            final end = DateTime.parse(v['endDate']);
            return now.isAfter(start) && now.isBefore(end) && (v['usedCount'] ?? 0) < (v['totalUsageLimit'] ?? 0);
          }).toList();
        });
      }
    } catch (e) {
      debugPrint('Lỗi tải voucher: $e');
    }
  }

  void _applyVoucher(Map<String, dynamic>? voucher) {
    if (voucher == null) {
      setState(() {
        _selectedVoucher = null;
        _discountAmount = 0.0;
      });
      return;
    }

    final totalAmount = _calculateTotalAmount();
    final minVal = double.tryParse(voucher['minOrderValue'].toString()) ?? 0.0;
    if (totalAmount < minVal) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đơn hàng chưa đạt giá trị tối thiểu ${minVal.toStringAsFixed(0)} ₫')),
      );
      return;
    }

    final discountVal = double.tryParse(voucher['discountValue'].toString()) ?? 0.0;
    final discountType = voucher['discountType'].toString();

    double discount = 0.0;
    if (discountType == 'Percentage') {
      discount = totalAmount * (discountVal / 100.0);
    } else {
      discount = discountVal;
    }

    if (discount > totalAmount) {
      discount = totalAmount;
    }

    setState(() {
      _selectedVoucher = voucher;
      _discountAmount = discount;
    });
  }

  double _calculateTotalAmount() {
    return _items.fold(0.0, (sum, item) => sum + item.price * item.quantity);
  }

  String? _findName(List<Map<String, dynamic>> list, String? code) {
    if (code == null) return null;
    for (final item in list) {
      if (item['code'] == code) {
        return item['name']?.toString();
      }
    }
    return null;
  }

  String _getCompiledAddress() {
    final provName = _findName(_provinces, _selectedProvinceCode);
    final distName = _findName(_districts, _selectedDistrictCode);
    final wardName = _findName(_wards, _selectedWardCode);
    final specific = _specificAddressController.text.trim();

    final List<String> parts = [];
    if (specific.isNotEmpty) parts.add(specific);
    if (wardName != null && wardName.isNotEmpty) parts.add(wardName);
    if (distName != null && distName.isNotEmpty) parts.add(distName);
    if (provName != null && provName.isNotEmpty) parts.add(provName);

    return parts.join(', ');
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không có sản phẩm nào để thanh toán.')),
      );
      return;
    }
    if (_selectedProvinceCode == null || _selectedDistrictCode == null || _selectedWardCode == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn đầy đủ Tỉnh, Huyện, Xã.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final token = _currentUser?.token;
      if (token == null || token.isEmpty) {
        throw Exception('Bạn cần đăng nhập để đặt hàng.');
      }

      // Kiểm tra lại tồn kho ngay trước khi tạo đơn (tránh mua sản phẩm đã hết hàng trong lúc đang thanh toán)
      final outOfStockItems = _items.where((item) => item.stockQuantity <= 0 || item.quantity > item.stockQuantity).toList();
      if (outOfStockItems.isNotEmpty) {
        throw Exception('Một số sản phẩm đã hết hàng hoặc không đủ tồn kho. Vui lòng cập nhật lại giỏ hàng.');
      }

      const paymentMethod = 'E-Wallet';
      final totalAmount = _calculateTotalAmount();

      final payload = {
        'orderChannel': 'Online',
        'orderStatus': 'New',
        'paymentMethod': paymentMethod,
        'isPaid': true,
        'shippingName': _shippingNameController.text.trim(),
        'shippingPhone': _shippingPhoneController.text.trim(),
        'shippingAddress': _getCompiledAddress(),
        'voucherCode': _selectedVoucher?['code'],
        'totalAmount': totalAmount,
        'discountAmount': _discountAmount,
        'shippingFee': 0,
        'finalAmount': totalAmount - _discountAmount,
        'orderItems': _items.map((item) => {
          'productId': item.productId,
          'quantity': item.quantity,
          'unitPrice': item.price,
        }).toList(),
      };

      final response = await ApiService.post(
        '/api/orders',
        body: payload,
        token: token,
      );

      // Remove ONLY the checked out items from the stored cart
      final allCartItems = await CartService.getCart();
      final remainingCartItems = allCartItems.where((cartItem) {
        return !_items.any((orderedItem) => orderedItem.productId == cartItem.productId);
      }).toList();
      await CartService.saveCart(remainingCartItems);

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(
            order: response is Map<String, dynamic> ? response : {},
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFFBA1A1A),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F9),
      appBar: AppBar(
        title: const Text('Thanh toán đơn hàng'),
        backgroundColor: const Color(0xFF171A20),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ordered Items Summary Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.shopping_bag_rounded, color: Color(0xFFF04A24), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Sản phẩm đã chọn (${_items.length})',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ..._items.map((item) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF9F9F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE6E8EC)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  Text(
                                    'Số lượng: ${item.quantity} x ${item.price.toStringAsFixed(0)} ₫',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF6F7785)),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '${(item.quantity * item.price).toStringAsFixed(0)} ₫',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF04A24),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Shipping Details Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_shipping_rounded, color: Color(0xFFF04A24), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Thông tin giao hàng',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _shippingNameController,
                        decoration: InputDecoration(
                          labelText: 'Tên người nhận',
                          prefixIcon: const Icon(Icons.person_outline_rounded),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập tên người nhận'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _shippingPhoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          labelText: 'Số điện thoại',
                          prefixIcon: const Icon(Icons.phone_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập số điện thoại'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      // Province Dropdown
                      DropdownButtonFormField<String>(
                        // ignore: deprecated_member_use
                        value: _selectedProvinceCode,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Tỉnh / Thành phố *',
                          prefixIcon: const Icon(Icons.map_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: _provinces.map((p) => DropdownMenuItem<String>(
                          value: p['code'],
                          child: Text(p['name']!),
                        )).toList(),
                        validator: (value) => value == null ? 'Vui lòng chọn Tỉnh/Thành phố' : null,
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _selectedProvinceCode = value;
                              _loadDistricts(value);
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      // District Dropdown
                      DropdownButtonFormField<String>(
                        // ignore: deprecated_member_use
                        value: _selectedDistrictCode,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Quận / Huyện *',
                          prefixIcon: const Icon(Icons.landscape_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: _districts.map((d) => DropdownMenuItem<String>(
                          value: d['code'],
                          child: Text(d['name']!),
                        )).toList(),
                        validator: (value) => value == null ? 'Vui lòng chọn Quận/Huyện' : null,
                        onChanged: _selectedProvinceCode == null ? null : (value) {
                          if (value != null) {
                            setState(() {
                              _selectedDistrictCode = value;
                              _loadWards(value);
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      // Ward Dropdown
                      DropdownButtonFormField<String>(
                        // ignore: deprecated_member_use
                        value: _selectedWardCode,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Phường / Xã *',
                          prefixIcon: const Icon(Icons.near_me_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: _wards.map((w) => DropdownMenuItem<String>(
                          value: w['code'],
                          child: Text(w['name']!),
                        )).toList(),
                        validator: (value) => value == null ? 'Vui lòng chọn Phường/Xã' : null,
                        onChanged: _selectedDistrictCode == null ? null : (value) {
                          if (value != null) {
                            setState(() {
                              _selectedWardCode = value;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      // Specific Address input
                      TextFormField(
                        controller: _specificAddressController,
                        decoration: InputDecoration(
                          labelText: 'Số nhà, ngõ ngách, tên đường *',
                          prefixIcon: const Icon(Icons.home_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        validator: (value) => (value == null || value.trim().isEmpty)
                            ? 'Vui lòng nhập địa chỉ cụ thể'
                            : null,
                      ),
                      if (_isAddressOffline) ...[
                        const SizedBox(height: 6),
                        const Text(
                          '* Đang hoạt động ở chế độ ngoại tuyến (dự phòng). Bạn có thể chọn Hà Nội, TP.HCM hoặc Đà Nẵng.',
                          style: TextStyle(color: Colors.amber, fontStyle: FontStyle.italic, fontSize: 11),
                        ),
                      ],
                      const SizedBox(height: 16),
                      // Voucher Dropdown Picker
                      DropdownButtonFormField<Map<String, dynamic>>(
                        // ignore: deprecated_member_use
                        value: _selectedVoucher,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Chọn voucher giảm giá',
                          prefixIcon: const Icon(Icons.discount_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: [
                          const DropdownMenuItem<Map<String, dynamic>>(
                            value: null,
                            child: Text('-- Không sử dụng voucher --'),
                          ),
                          ..._vouchers.map((v) {
                            final minVal = double.tryParse(v['minOrderValue'].toString()) ?? 0.0;
                            final isEligible = _calculateTotalAmount() >= minVal;
                            final discountDesc = v['discountType'] == 'Percentage'
                                ? '${double.tryParse(v['discountValue'].toString())?.toStringAsFixed(0)}%'
                                : '${double.tryParse(v['discountValue'].toString())?.toStringAsFixed(0)} ₫';
                            final condDesc = minVal > 0
                                ? ' (Đơn tối thiểu ${minVal.toStringAsFixed(0)} ₫)'
                                : '';
                            return DropdownMenuItem<Map<String, dynamic>>(
                              value: v,
                              enabled: isEligible,
                              child: Text(
                                '${v['code']} - Giảm $discountDesc$condDesc${!isEligible ? " [Không đủ đ.kiện]" : ""}',
                                style: TextStyle(
                                  color: isEligible ? Colors.black : Colors.grey,
                                  fontSize: 13,
                                ),
                              ),
                            );
                          }),
                        ],
                        onChanged: _applyVoucher,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                const SizedBox(height: 16),
                // Billing Summary Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.receipt_long_rounded, color: Color(0xFFF04A24), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Chi tiết thanh toán',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng tiền hàng', style: TextStyle(color: Color(0xFF6F7785))),
                          Text(
                            '${_calculateTotalAmount().toStringAsFixed(0)} ₫',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      if (_discountAmount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Giảm giá từ voucher (${_selectedVoucher?['code'] ?? ''})',
                              style: const TextStyle(color: Color(0xFF0F9D79)),
                            ),
                            Text(
                              '-${_discountAmount.toStringAsFixed(0)} ₫',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F9D79)),
                            ),
                          ],
                        ),
                      ],
                      const Divider(height: 24, thickness: 1, color: Color(0xFFF6F7F9)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Tổng thanh toán',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Text(
                            '${(_calculateTotalAmount() - _discountAmount).toStringAsFixed(0)} ₫',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Color(0xFFF04A24),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitOrder,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF04A24),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                          )
                        : const Text(
                            'Xác nhận đặt hàng',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
