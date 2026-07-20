import 'package:flutter_test/flutter_test.dart';
import 'package:computer_store_mobile/main.dart';

void main() {
  testWidgets('App starts with the store title', (WidgetTester tester) async {
    await tester.pumpWidget(const ComputerStoreApp());
    expect(find.textContaining('TQG Computer Store'), findsOneWidget);
  });
}
