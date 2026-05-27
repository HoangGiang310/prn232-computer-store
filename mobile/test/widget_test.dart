import 'package:flutter_test/flutter_test.dart';
import 'package:computer_store_mobile/main.dart';

void main() {
  testWidgets('App starts with title', (WidgetTester tester) async {
    await tester.pumpWidget(const ComputerStoreApp());
    expect(find.text('Computer Store'), findsOneWidget);
  });
}
