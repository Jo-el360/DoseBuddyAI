import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onLogout;
  const ProfileScreen({super.key, this.onLogout});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final FlutterTts _flutterTts = FlutterTts();

  // Profile Form Controllers
  final TextEditingController _fullNameController = TextEditingController(text: 'Maria Miller');
  final TextEditingController _emailController = TextEditingController(text: 'maria.miller@example.com');
  final TextEditingController _ageController = TextEditingController(text: '68');
  final TextEditingController _caregiverController = TextEditingController(text: '+91 98765 43210 (Dr. Carlos)');
  final TextEditingController _emergencyController = TextEditingController(text: '+91 98111 91100');
  final TextEditingController _wakeTimeController = TextEditingController(text: '07:30 AM');
  final TextEditingController _sleepTimeController = TextEditingController(text: '09:30 PM');

  // Reminder Option Switches
  bool _autoRemindersEnabled = true;
  bool _audioChimeEnabled = true;
  bool _voiceNudgesEnabled = true;
  String _selectedRoutine = 'Home Routine';

  bool _isSaving = false;

  void _testVoiceNudge() async {
    try {
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.85);
      await _flutterTts.speak(
        "Hello ${_fullNameController.text}! System Voice Reminders are enabled and ready for your daily medication schedule."
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🗣️ Test Voice Nudge Played Successfully!'),
            backgroundColor: Color(0xFF0284C7),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Audio Test Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _saveProfile() {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Profile & Reminder Settings Saved!'),
          backgroundColor: Colors.green,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Profile & Reminder Options ⚙️', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFE0F2FE),
        actions: [
          if (widget.onLogout != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: ElevatedButton.icon(
                onPressed: widget.onLogout,
                icon: const Icon(Icons.logout, size: 16, color: Colors.white),
                label: const Text('Logout', style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade600,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.white,
                      child: Text('👵', style: TextStyle(fontSize: 36)),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _fullNameController.text,
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_ageController.text} yrs • Senior Patient • Type 2 Diabetes',
                            style: const TextStyle(color: Color(0xFFBAE6FD), fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Section 1: Reminder Options & Alarm Controls
              const Text('🔔 Reminder Options & Alarms', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 12),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Auto-Reminder Real-Time Alarms', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Triggers alarms when medication time arrives'),
                        value: _autoRemindersEnabled,
                        activeColor: const Color(0xFF0284C7),
                        onChanged: (val) => setState(() => _autoRemindersEnabled = val),
                      ),
                      const Divider(),
                      SwitchListTile(
                        title: const Text('Audible Medical Alarm Chime', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Plays loud medical chime sound when due'),
                        value: _audioChimeEnabled,
                        activeColor: const Color(0xFF0284C7),
                        onChanged: (val) => setState(() => _audioChimeEnabled = val),
                      ),
                      const Divider(),
                      SwitchListTile(
                        title: const Text('AI Speech Voice Nudges', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Spoken instructions via Text-To-Speech'),
                        value: _voiceNudgesEnabled,
                        activeColor: const Color(0xFF0284C7),
                        onChanged: (val) => setState(() => _voiceNudgesEnabled = val),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: _testVoiceNudge,
                        icon: const Icon(Icons.volume_up, color: Color(0xFF0284C7)),
                        label: const Text('Test Voice Speech Nudge Now'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 44),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Section 2: Patient Profile Details
              const Text('👤 Patient Details & Contacts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 12),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _fullNameController,
                        decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person)),
                        validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(labelText: 'Email Address', prefixIcon: Icon(Icons.email)),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _ageController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'Age', prefixIcon: Icon(Icons.cake)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedRoutine,
                              decoration: const InputDecoration(labelText: 'Routine Context'),
                              items: ['Home Routine', 'Work Routine', 'Night Shift'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                              onChanged: (val) => setState(() => _selectedRoutine = val!),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _caregiverController,
                        decoration: const InputDecoration(labelText: 'Caregiver Contact Phone', prefixIcon: Icon(Icons.phone_android)),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _emergencyController,
                        decoration: const InputDecoration(labelText: 'Emergency Phone', prefixIcon: Icon(Icons.contact_phone)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Section 3: Daily Routine Times
              const Text('⏰ Routine Times', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 12),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _wakeTimeController,
                          decoration: const InputDecoration(labelText: 'Wake Time', prefixIcon: Icon(Icons.wb_sunny)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _sleepTimeController,
                          decoration: const InputDecoration(labelText: 'Sleep Time', prefixIcon: Icon(Icons.nights_stay)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Save Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _isSaving ? null : _saveProfile,
                  icon: const Icon(Icons.save, color: Colors.white),
                  label: _isSaving
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Profile & Reminder Options', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
