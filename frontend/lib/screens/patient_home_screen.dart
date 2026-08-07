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

  void _triggerInstantReminderTest() async {
    try {
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.speak("Attention Maria! This is an instant test reminder for your scheduled dose of Metformin 500 milligrams.");
    } catch (_) {}

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.notifications_active, color: Colors.white, size: 28),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("🔔 INSTANT REMINDER ALARM", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text("Time to take Metformin 500mg (1 Tablet with Water)!"),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF0369A1),
          duration: const Duration(seconds: 5),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _loadData();
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
