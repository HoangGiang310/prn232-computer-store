class AuthUser {
  final String username;
  final String role;
  final String? fullName;
  final String? token;

  const AuthUser({
    required this.username,
    required this.role,
    this.fullName,
    this.token,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      username: (json['username'] ?? json['userName'] ?? '').toString(),
      role: (json['role'] ?? '').toString(),
      fullName: json['fullName']?.toString(),
      token: json['token']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'role': role,
      'fullName': fullName,
      'token': token,
    };
  }
}
