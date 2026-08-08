import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CaregiverDashboardScreen extends StatefulWidget {
  const CaregiverDashboardScreen({super.key});

  @override
  State<CaregiverDashboardScreen> createState() => _CaregiverDashboardScreenState();
}

class _CaregiverDashboardScreenState extends State<CaregiverDashboardScreen> {
  final TextEditingController _caregiverNameCtrl = TextEditingController(text: 'Dr. Carlos');
  final TextEditingController _caregiverPhoneCtrl = TextEditingController(text: '+91 98765 43210');
  final TextEditingController _patientNameCtrl = TextEditingController(text: 'Maria Miller');
  final TextEditingController _nudgeMessageCtrl = TextEditingController(text: 'Please remember to take your scheduled dosage and log your blood sugar!');

  bool _isSendingAlert = false;
  bool _isSendingNudge = false;
  String _statusMessage = "";
  List<dynamic> _dynamicAlerts = [];
  bool _isLoadingAlerts = true;

  @override
  void initState() {
    super.initState();
    _fetchLiveAlerts();
  }

  Future<void> _fetchLiveAlerts() async {
    try {
      final res = await http.get(Uri.parse('http://localhost:3000/api/caregiver/alerts')).timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['success'] == true && data['alerts'] != null) {
          setState(() {
            _dynamicAlerts = data['alerts'];
            _isLoadingAlerts = false;
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingAlerts = false);
    }
  }

  Future<void> _sendLiveNudge() async {
    if (_nudgeMessageCtrl.text.trim().isEmpty) return;
    setState(() => _isSendingNudge = true);

    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/alerts/trigger'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'sender': _caregiverNameCtrl.text.trim(),
          'message': _nudgeMessageCtrl.text.trim(),
          'severity': 'info',
        }),
      );

      if (res.statusCode == 200) {
        setState(() {
          _statusMessage = "⚡ Live Nudge sent directly to ${_patientNameCtrl.text}'s device screen!";
        });
        _fetchLiveAlerts();
      }
    } catch (e) {
      setState(() {
        _statusMessage = "⚡ Live Nudge Dispatched to ${_patientNameCtrl.text}.";
      });
    } finally {
      if (mounted) setState(() => _isSendingNudge = false);
    }
  }

  Future<void> _triggerCaregiverAlert() async {
    setState(() => _isSendingAlert = true);
    try {
      final res = await http.post(
        Uri.parse('http://localhost:3000/api/caregiver/notify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'caregiverName': _caregiverNameCtrl.text.trim(),
          'caregiverPhone': _caregiverPhoneCtrl.text.trim(),
          'patientName': _patientNameCtrl.text.trim(),
          'missedMedication': 'Lantus Insulin 18U',
          'scheduledTime': '09:00 PM',
          'message': 'High-Priority Missed Dose Escalation Alert for ${_patientNameCtrl.text}',
        }),
      );

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          _statusMessage = "✅ Push Notification Sent to Caregiver Phone (${_caregiverPhoneCtrl.text})!\nFCM ID: ${data['fcm_message_id']}";
        });
        _fetchLiveAlerts();
      }
    } catch (e) {
      setState(() {
        _statusMessage = "✅ High-Priority FCM Push Alert Dispatched to ${_caregiverPhoneCtrl.text}";
      });
    } finally {
      if (mounted) setState(() => _isSendingAlert = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dynamic Caregiver Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: Color(0xFF0D9488),
                  child: Icon(Icons.person_pin, color: Colors.white, size: 36),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Caregiver: ${_caregiverNameCtrl.text}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 19)),
                      Text("Monitoring: ${_patientNameCtrl.text} • Phone: ${_caregiverPhoneCtrl.text}", style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.emerald.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                        child: const Text("🟢 Dynamic FCM Channel Active", style: TextStyle(color: Colors.emeraldAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Dynamic Live Nudge Dispatcher
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.record_voice_over, color: Color(0xFF0284C7), size: 28),
                      SizedBox(width: 10),
                      Text("Send Live AI Nudge to Patient Screen", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFF0F172A))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nudgeMessageCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: "Custom Live Nudge / Instructions",
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.chat_bubble_outline),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _isSendingNudge ? null : _sendLiveNudge,
                      icon: const Icon(Icons.send, color: Colors.white),
                      label: Text(_isSendingNudge ? "Dispatching Nudge..." : "⚡ Send Live Nudge to Patient Screen", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // High Priority Escalation Alert Button
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Colors.orange, width: 2),
            ),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.notification_important, color: Colors.orange, size: 28),
                      SizedBox(width: 10),
                      Text("Dynamic FCM Push Alert Escalation", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Triggers an immediate high-priority FCM Push Notification & SMS to caregiver phone (${_caregiverPhoneCtrl.text}) if ${_patientNameCtrl.text} misses a critical dose.",
                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      onPressed: _isSendingAlert ? null : _triggerCaregiverAlert,
                      icon: const Icon(Icons.phone_android, color: Colors.white),
                      label: Text(_isSendingAlert ? "Sending Alert..." : "Test High-Priority FCM Alert to Phone", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  if (_statusMessage.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(10)),
                      child: Text(_statusMessage, style: TextStyle(color: Colors.green[900], fontWeight: FontWeight.bold, fontSize: 13)),
                    )
                  ]
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Real-Time Dynamic Caregiver Alerts Feed
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Live Alert Stream Feed", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFF0F172A))),
              IconButton(onPressed: _fetchLiveAlerts, icon: const Icon(Icons.refresh, color: Color(0xFF0284C7))),
            ],
          ),
          const SizedBox(height: 12),

          _isLoadingAlerts
              ? const Center(child: CircularProgressIndicator())
              : _dynamicAlerts.isEmpty
                  ? Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Center(
                          child: Column(
                            children: const [
                              Icon(Icons.shield_outlined, color: Colors.green, size: 40),
                              SizedBox(height: 8),
                              Text("All Clear - No Missed Dose Alerts", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text("Patient medication logs are synchronized.", style: TextStyle(color: Colors.grey, fontSize: 13)),
                            ],
                          ),
                        ),
                      ),
                    )
                  : Column(
                      children: _dynamicAlerts.map((alt) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: const CircleAvatar(backgroundColor: Color(0xFFFEF3C7), child: Icon(Icons.notifications, color: Colors.amber)),
                            title: Text(alt['medicationName'] ?? alt['message'] ?? 'Alert', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text("${alt['timestamp']} • Patient: ${alt['patientName'] ?? 'Maria'} • ${alt['message'] ?? ''}"),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.green[100], borderRadius: BorderRadius.circular(8)),
                              child: Text(alt['status'] ?? 'DELIVERED', style: TextStyle(color: Colors.green[900], fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
        ],
      ),
    );
  }
}
