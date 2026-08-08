import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../models/medication.dart';
import '../services/api_service.dart';
import 'dosage_history_screen.dart';

class PatientHomeScreen extends StatefulWidget {
  final bool isHighContrast;
  final bool isLargeText;

  const PatientHomeScreen({
    super.key,
    this.isHighContrast = false,
    this.isLargeText = false,
  });

  @override
  State<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends State<PatientHomeScreen> {
  List<Medication> _medications = [];
  bool _isLoading = true;
  String _aiReminderMessage = "Loading your personalized DoseBuddy reminder...";
  final Map<String, bool> _takenToday = {};
  double? _bloodSugarInput;
  final FlutterTts _flutterTts = FlutterTts();

  void _triggerInstantReminderTest() {
    if (_medications.isNotEmpty) {
      _triggerReminderForMed(_medications.first, _formatTime(DateTime.now()));
    } else {
      _triggerReminderForMed(
        Medication(
          id: 'test_1',
          name: 'Metformin HCL',
          dosage: '500 mg',
          frequency: 'Once Daily',
          timeSlots: ['08:00 AM'],
          instructions: 'Take with meal and a glass of water.',
        ),
        _formatTime(DateTime.now()),
      );
    }
  }

  late final dynamic _timer;
  String _lastTriggeredTime = '';

  @override
  void initState() {
    super.initState();
    _loadData();
    _startRealtimeClock();
  }

  final Set<String> _triggeredKeys = {};

  int? _parseTimeToMinutes(String t) {
    if (t.trim().isEmpty) return null;
    final clean = t.replaceAll(RegExp(r'[\u202f\u00a0]'), ' ').trim();
    final match = RegExp(r'^(\d{1,2}):(\d{2})\s*(AM|PM)?$', caseSensitive: false).firstMatch(clean);
    if (match == null) return null;
    int hours = int.parse(match.group(1)!);
    final minutes = int.parse(match.group(2)!);
    final period = match.group(3)?.toUpperCase();

    if (period == 'PM' && hours < 12) hours += 12;
    if (period == 'AM' && hours == 12) hours = 0;

    return hours * 60 + minutes;
  }

  void _startRealtimeClock() {
    _timer = Stream.periodic(const Duration(seconds: 2)).listen((_) {
      final now = DateTime.now();
      final nowMinutes = now.hour * 60 + now.minute;
      final todayStr = "${now.year}-${now.month}-${now.day}";

      for (final med in _medications) {
        if (_takenToday[med.id] == true) continue;

        for (final slot in med.timeSlots) {
          final slotMinutes = _parseTimeToMinutes(slot);
          if (slotMinutes == null) continue;

          final diff = nowMinutes - slotMinutes;
          final key = "${med.id}_${slot}_$todayStr";

          if (diff >= 0 && diff <= 3 && !_triggeredKeys.contains(key)) {
            _triggeredKeys.add(key);
            _triggerReminderForMed(med, _formatTime(now));
            break;
          }
        }
      }
    });
  }

  String _formatTime(DateTime dt) {
    int hour = dt.hour;
    int minute = dt.minute;
    String period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    String hStr = hour < 10 ? '0$hour' : '$hour';
    String mStr = minute < 10 ? '0$minute' : '$minute';
    return '$hStr:$mStr $period';
  }

  void _triggerReminderForMed(Medication med, String timeStr) async {
    try {
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.speak("Attention Maria! It is now $timeStr. Time to take your scheduled dose of ${med.name} (${med.dosage}). ${med.instructions}");
    } catch (_) {}

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.notifications_active, color: Colors.white, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("🔔 REMINDER ALARM ($timeStr)", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text("${med.name} (${med.dosage}) - ${med.instructions}"),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF0369A1),
          duration: const Duration(seconds: 6),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    final meds = await ApiService.getMedications();
    setState(() {
      _medications = meds;
      _isLoading = false;
    });

    if (meds.isNotEmpty) {
      final aiRes = await ApiService.generateAIReminder(meds.first, "Maria");
      setState(() {
        _aiReminderMessage = aiRes['message'] ?? aiRes['fallback']?['reminderMessage'] ?? "Time for your morning medication!";
      });
    }
  }

  void _markTaken(Medication med) async {
    await ApiService.confirmDose(med.id, _bloodSugarInput);
    setState(() {
      _takenToday[med.id] = true;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Great job, Maria! Confirmed dose of ${med.name}.", style: const TextStyle(fontSize: 18)),
          backgroundColor: Colors.green[800],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Header Card
          Card(
            color: widget.isHighContrast ? Colors.yellow[100] : const Color(0xFFF0F9FF),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: const Color(0xFF0284C7), width: widget.isHighContrast ? 3 : 1),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 28,
                        backgroundColor: Color(0xFF0284C7),
                        child: Text("👵", style: TextStyle(fontSize: 28)),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Good Day, Maria!", style: Theme.of(context).textTheme.titleLarge),
                          const Text("72 years old • Type 2 Diabetes", style: TextStyle(color: Colors.grey, fontSize: 16)),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  // AI Companion Nudge
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF38BDF8)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.record_voice_over, color: Color(0xFF0284C7), size: 32),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text("DoseBuddy Voice Nudge", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0369A1))),
                              const SizedBox(height: 4),
                              Text(_aiReminderMessage, style: TextStyle(fontSize: widget.isLargeText ? 20 : 16, height: 1.4)),
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: _triggerInstantReminderTest,
                                  icon: const Icon(Icons.notifications_active, size: 20),
                                  label: const Text("Test Instant Reminder & Audio Voice", style: TextStyle(fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0284C7),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Blood Glucose Quick Entry
          Text("Blood Glucose Check", style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.bloodtype, color: Colors.red, size: 36),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      keyboardType: TextInputType.number,
                      style: TextStyle(fontSize: widget.isLargeText ? 22 : 18),
                      decoration: const InputDecoration(
                        labelText: "Enter Glucose Level (mg/dL)",
                        border: OutlineInputBorder(),
                        suffixText: "mg/dL",
                      ),
                      onChanged: (val) {
                        setState(() {
                          _bloodSugarInput = double.tryParse(val);
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Today's Medication Checklist
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Today's Medications", style: Theme.of(context).textTheme.titleLarge),
              Row(
                children: [
                  TextButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const DosageHistoryScreen()),
                      );
                    },
                    icon: const Icon(Icons.history, color: Color(0xFF0284C7)),
                    label: const Text("Compliance History", style: TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Column(
                  children: _medications.map((med) {
                    final isTaken = _takenToday[med.id] ?? false;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      color: isTaken ? Colors.green[50] : Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  isTaken ? Icons.check_circle : Icons.medication_liquid,
                                  color: isTaken ? Colors.green[700] : const Color(0xFF0284C7),
                                  size: 36,
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        med.name,
                                        style: TextStyle(
                                          fontSize: widget.isLargeText ? 24 : 20,
                                          fontWeight: FontWeight.bold,
                                          decoration: isTaken ? TextDecoration.lineThrough : null,
                                        ),
                                      ),
                                      Text(
                                        "${med.dosage} • ${med.frequency} (${med.timeSlots.join(', ')})",
                                        style: TextStyle(fontSize: widget.isLargeText ? 18 : 15, color: Colors.grey[700]),
                                      ),
                                    ],
                                  ),
                                ),
                                if (med.requiresBloodSugarCheck)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.red[100],
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text("🩸 Check Sugar", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
                                  )
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text("💡 Instruction: ${med.instructions}", style: TextStyle(fontSize: widget.isLargeText ? 18 : 15, fontStyle: FontStyle.italic)),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              height: 54,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isTaken ? Colors.grey[400] : const Color(0xFF0284C7),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: isTaken ? null : () => _markTaken(med),
                                icon: Icon(isTaken ? Icons.done_all : Icons.check, size: 28),
                                label: Text(
                                  isTaken ? "Dose Confirmed Today" : "I TOOK THIS MEDICINE",
                                  style: TextStyle(fontSize: widget.isLargeText ? 20 : 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                            )
                          ],
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
