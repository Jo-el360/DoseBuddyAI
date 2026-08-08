import 'package:flutter/material.dart';
import 'screens/patient_home_screen.dart';
import 'screens/medication_management_screen.dart';
import 'screens/caregiver_dashboard_screen.dart';
import 'screens/ai_assistant_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const DoseBuddyApp());
}

class DoseBuddyApp extends StatefulWidget {
  const DoseBuddyApp({super.key});

  @override
  State<DoseBuddyApp> createState() => _DoseBuddyAppState();
}

class _DoseBuddyAppState extends State<DoseBuddyApp> {
  bool _isHighContrast = false;
  bool _isLargeText = false;
  bool _isLoggedIn = false;

  void toggleHighContrast(bool val) {
    setState(() => _isHighContrast = val);
  }

  void toggleLargeText(bool val) {
    setState(() => _isLargeText = val);
  }

  void handleLoginSuccess() {
    setState(() => _isLoggedIn = true);
  }

  void handleLogout() {
    setState(() => _isLoggedIn = false);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DoseBuddy AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0284C7),
          primary: _isHighContrast ? Colors.black : const Color(0xFF0369A1),
          secondary: const Color(0xFF0D9488),
          surface: _isHighContrast ? const Color(0xFFFFFFE0) : const Color(0xFFF8FAFC),
        ),
        textTheme: TextTheme(
          displayLarge: TextStyle(fontSize: _isLargeText ? 36 : 30, fontWeight: FontWeight.bold),
          titleLarge: TextStyle(fontSize: _isLargeText ? 26 : 22, fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(fontSize: _isLargeText ? 22 : 18, height: 1.4),
          bodyMedium: TextStyle(fontSize: _isLargeText ? 18 : 15),
        ),
        cardTheme: CardThemeData(
          elevation: _isHighContrast ? 8 : 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: _isHighContrast ? const BorderSide(color: Colors.black, width: 3) : BorderSide.none,
          ),
        ),
      ),
      home: _isLoggedIn
          ? NavigationWrapper(
              isHighContrast: _isHighContrast,
              isLargeText: _isLargeText,
              onToggleHighContrast: toggleHighContrast,
              onToggleLargeText: toggleLargeText,
              onLogout: handleLogout,
            )
          : LoginScreen(
              onLoginSuccess: handleLoginSuccess,
            ),
    );
  }
}

class NavigationWrapper extends StatefulWidget {
  final bool isHighContrast;
  final bool isLargeText;
  final Function(bool) onToggleHighContrast;
  final Function(bool) onToggleLargeText;
  final VoidCallback onLogout;

  const NavigationWrapper({
    super.key,
    required this.isHighContrast,
    required this.isLargeText,
    required this.onToggleHighContrast,
    required this.onToggleLargeText,
    required this.onLogout,
  });

  @override
  State<NavigationWrapper> createState() => _NavigationWrapperState();
}

class _NavigationWrapperState extends State<NavigationWrapper> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      PatientHomeScreen(
        isHighContrast: widget.isHighContrast,
        isLargeText: widget.isLargeText,
      ),
      const MedicationManagementScreen(),
      const AIAssistantScreen(),
      const CaregiverDashboardScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('DoseBuddy AI 🩺', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  CircleAvatar(
                    radius: 9,
                    backgroundColor: Color(0xFF0284C7),
                    child: Text('M', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(width: 4),
                  Text(
                    'Maria Miller',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: widget.isHighContrast ? Colors.yellow[300] : const Color(0xFFE0F2FE),
        actions: [
          ElevatedButton.icon(
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout, size: 16, color: Colors.white),
            label: const Text('Logout', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(width: 8),
          Row(
            children: [
              const Icon(Icons.text_fields, size: 18),
              Switch(
                value: widget.isLargeText,
                onChanged: widget.onToggleLargeText,
                activeColor: const Color(0xFF0369A1),
              ),
              const Icon(Icons.contrast, size: 18),
              Switch(
                value: widget.isHighContrast,
                onChanged: widget.onToggleHighContrast,
                activeColor: Colors.black,
              ),
              const SizedBox(width: 8),
            ],
          )
        ],
      ),
      body: screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined, size: 28),
            selectedIcon: Icon(Icons.home, size: 30),
            label: 'My Dose',
          ),
          NavigationDestination(
            icon: Icon(Icons.medication_outlined, size: 28),
            selectedIcon: Icon(Icons.medication, size: 30),
            label: 'Medicines',
          ),
          NavigationDestination(
            icon: Icon(Icons.smart_toy_outlined, size: 28),
            selectedIcon: Icon(Icons.smart_toy, size: 30),
            label: 'AI Assistant',
          ),
          NavigationDestination(
            icon: Icon(Icons.family_restroom_outlined, size: 28),
            selectedIcon: Icon(Icons.family_restroom, size: 30),
            label: 'Caregiver',
          ),
        ],
      ),
    );
  }
}
