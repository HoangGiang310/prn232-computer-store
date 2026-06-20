# User Story

## Epic: Quản lý hệ thống bán hàng Laptop

### User Story 1

- As a system user (Admin, Sales, Accountant, Warehouse), I want to log in and log out securely so that I can access only the pages and functions allowed by my role.
- Acceptance Criteria:
  - Passwords are stored encrypted/hashed.
  - Role-based redirect takes users to the correct dashboard.
  - Unauthorized pages/API endpoints are blocked.
  - Sessions expire after inactivity.

### User Story 2

- As an Admin, I want to manage employee accounts and assign roles so that the right staff can access the right functions and the system remains secure.
- Acceptance Criteria:
  - Admin can create, edit, disable, and soft delete staff accounts.
  - Admin can assign roles: Admin, Sales, Accountant, Warehouse.
  - Admin can reset staff passwords and log account activity.
  - All user management actions are audit-logged.

### User Story 3

- As an Admin or Sales Staff, I want to manage products with full details and multiple images so that product information is complete and easy to maintain.
- Acceptance Criteria:
  - Product create/edit supports fields: name, code, brand, specs, import price, sale price, stock quantity, low stock threshold, images.
  - Multiple product images can be uploaded and main thumbnails are displayed.
  - Product detail page shows full specifications.
  - Soft delete is supported to preserve history.

### User Story 4

- As an Admin or Sales Staff, I want to search and filter products by name, code, brand, price, and stock status so that I can quickly find items to manage or sell.
- Acceptance Criteria:
  - Search supports name/code/brand keywords.
  - Filters include brand, price range, stock status (in stock, low stock, out of stock).
  - Product list supports pagination and fast response.

### User Story 5

- As a Sales Staff, I want to create offline POS orders and record payment and shipping information so that I can serve in-store customers accurately.
- Acceptance Criteria:
  - Staff can create orders with product selection, quantity, unit price, discount, tax, shipping fee.
  - The system checks stock before order confirmation.
  - Offline orders support payment methods: cash, card, e-wallet.
  - Stock is updated immediately after order confirmation.

### User Story 6

- As a Customer, I want to place online orders using a shopping cart and checkout flow so that I can buy laptops conveniently.
- Acceptance Criteria:
  - Customers can add/remove products, update quantities in cart.
  - Checkout collects shipping details, delivery option, and payment method.
  - The system validates stock availability in real time.
  - Online orders are stored with a clear status lifecycle.

### User Story 7

- As a Customer, I want to apply voucher codes and see discounts applied to my order so that I can save money with promotions.
- Acceptance Criteria:
  - Voucher input is available at checkout.
  - The system validates voucher conditions, expiry, and usage limit.
  - The order total updates correctly after voucher application.
  - Invalid or expired codes show clear error messages.

### User Story 8

- As a Warehouse Manager, I want to monitor inventory levels, receive low-stock alerts, and record stock movements so that inventory remains accurate.
- Acceptance Criteria:
  - Inventory dashboard displays current stock and low-stock warnings.
  - Warehouse staff can record inbound, outbound, and return adjustments.
  - Inventory history is saved for each adjustment.
  - Negative stock adjustments are prevented.

### User Story 9

- As a Warehouse Manager or Logistics Staff, I want to update order shipping status and tracking details so that customers can track delivery progress.
- Acceptance Criteria:
  - Shipping info includes carrier, tracking number, fees, and status updates.
  - Order status updates sync with the order lifecycle.
  - Customers can view tracking info in their order detail.

### User Story 10

- As a Customer, I want to view my order history and order details so that I can track past purchases and delivery status.
- Acceptance Criteria:
  - Customer can access a list of their orders with status, total, and date.
  - Order detail shows items, prices, shipping, payment, voucher, and tracking timeline.
  - Customers can request returns or support from the order detail screen.

### User Story 11

- As a Customer, I want to manage my account profile, saved addresses, and password so that I can use the site easily and securely.
- Acceptance Criteria:
  - Customer can register and log in. (Email verification/OTP is planned for a later phase.)
  - Customer can add/edit/delete shipping addresses and choose a default address.
  - Customer can request password reset and change password securely.
  - Personal data is stored and transmitted securely.

### User Story 12

- As an Admin, I want to create and manage vouchers/promotions with usage rules so that the business can run discounts and promotions safely.
- Acceptance Criteria:
  - Admin can define voucher code, type, value, minimum order, usage limit, validity dates, and applicable products.
  - Admin can disable vouchers without deleting them.
  - Voucher usage statistics are available.
  - Voucher validation is fast and reliable.

### User Story 13

- As an Accountant or Admin, I want to view and export reports for revenue, profit, products, and order status so that I can analyze business performance.
- Acceptance Criteria:
  - Reports support filters by date range, channel, product, and status.
  - Revenue, profit, best-selling, and inventory reports are available.
  - Reports can be exported to Excel/CSV/PDF.
  - Report generation is efficient and supports cached results.

### User Story 14

- As a Customer, I want to rate and review products I purchased so that I can share my experience and help future buyers.
- Acceptance Criteria:
  - Review is allowed only for purchased products.
  - Customer can submit star rating, comment, and optional images.
  - Reviews are displayed with average score and can be sorted/filtered.
  - Admin can moderate or hide inappropriate reviews.

### User Story 15

- As a new visitor, I want to register a customer account with my username, email, and password so that I can shop online, place orders, and track my purchases.
- Acceptance Criteria:
  - Registration form collects username, email, password, password confirmation, and optional full name, phone, and address.
  - The system validates input: username 3-50 characters, valid email format, password at least 6 characters, and matching password confirmation.
  - The system rejects registration if the username or email already exists, with a clear error message.
  - Public self-registration creates only the `customer` role; internal staff roles are created by an Admin (UC-10).
  - The password is hashed before storage and never stored as plaintext.
  - On success, a User record and a matching Customer record are created, a JWT token is issued, and the customer is redirected to the customer area.
  - The registration page is linked from both the login page and the home page.
