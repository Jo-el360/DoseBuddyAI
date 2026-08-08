import 'package:flutter/material.dart';
import '../models/dosage_log.dart';

class DosageHistoryScreen extends StatefulWidget {
  const DosageHistoryScreen({super.key});

  @override
  State<DosageHistoryScreen> createState() => _DosageHistoryScreenState();
}

class _DosageHistoryScreenState extends State<DosageHistoryScreen> {
  final List<DosageLog> _logs = [];

  String _selectedFilter = 'ALL';

  double get _adherenceRate {
    if (_logs.isEmpty) return 100.0;
    final takenCount = _logs.where((l) => l.status == 'TAKEN').length;
    return (takenCount / _logs.length) * 100;
  }

  @override
  Widget build(BuildContext context) {
    final filteredLogs = _logs.where((log) {
      if (_selectedFilter == 'ALL') return true;
      return log.status == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Dosage History & Compliance'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Compliance Metric Header Card
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0369A1), Color(0xFF0C4A6E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0xFFBAE6FD),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '7-Day Adherence Score',
                            style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_adherenceRate.toStringAsFixed(1)}%',
                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.analytics, color: Colors.white, size: 32),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: _adherenceRate / 100,
                      minHeight: 10,
                      backgroundColor: Colors.white24,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _adherenceRate >= 80 ? Colors.lightGreenAccent : Colors.amberAccent,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Logged: ${_logs.length} doses',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      Text(
                        _adherenceRate >= 80 ? 'Excellent Control 🌟' : 'Needs Caregiver Follow-up ⚠️',
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Status Filter Pills
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'All Logs'),
                  const SizedBox(width: 8),
                  _buildFilterChip('TAKEN', 'Taken'),
                  const SizedBox(width: 8),
                  _buildFilterChip('SKIPPED', 'Skipped'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Log List
            Expanded(
              child: filteredLogs.isEmpty
                  ? const Center(child: Text('No dosage records found for selected filter.'))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filteredLogs.length,
                      itemBuilder: (context, index) {
                        final log = filteredLogs[index];
                        final isTaken = log.status == 'TAKEN';

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: isTaken ? Colors.green.shade100 : Colors.red.shade100,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: isTaken ? Colors.green.shade50 : Colors.red.shade50,
                                  child: Icon(
                                    isTaken ? Icons.check_circle : Icons.cancel,
                                    color: isTaken ? Colors.green : Colors.red,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            log.medicationName,
                                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: isTaken ? Colors.green.shade100 : Colors.red.shade100,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              log.status,
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: isTaken ? Colors.green.shade800 : Colors.red.shade800,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Dosage: ${log.dosage} • Scheduled: ${_formatTime(log.scheduledTime)}',
                                        style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                                      ),
                                      if (log.glucoseReading != null) ...[
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            const Icon(Icons.water_drop, size: 14, color: Colors.red),
                                            const SizedBox(width: 4),
                                            Text(
                                              'Blood Glucose: ${log.glucoseReading!.toInt()} mg/dL',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.redAccent,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                      if (log.notes != null && log.notes!.isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        Text(
                                          'Note: ${log.notes}',
                                           style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Color(0xFF475569)),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedFilter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: const Color(0xFF0284C7),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : const Color(0xFF334155),
        fontWeight: FontWeight.bold,
      ),
      onSelected: (_) {
        setState(() => _selectedFilter = value);
      },
    );
  }

  String _formatTime(DateTime dt) {
    final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }
}
