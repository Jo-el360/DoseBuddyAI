import 'package:flutter/material.dart';
import '../models/medication.dart';
import '../services/api_service.dart';

class MedicationManagementScreen extends StatefulWidget {
  const MedicationManagementScreen({super.key});

  @override
  State<MedicationManagementScreen> createState() => _MedicationManagementScreenState();
}

class _MedicationManagementScreenState extends State<MedicationManagementScreen> {
  List<Medication> _medications = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchMeds();
  }

  Future<void> _fetchMeds() async {
    final meds = await ApiService.getMedications();
    setState(() {
      _medications = meds;
      _isLoading = false;
    });
  }

  void _showMedicationFormDialog({Medication? medicationToEdit}) {
    final nameCtrl = TextEditingController(text: medicationToEdit?.name ?? '');
    final brandCtrl = TextEditingController(text: medicationToEdit?.brand ?? '');
    final genericCtrl = TextEditingController(text: medicationToEdit?.genericName ?? '');
    final dosageCtrl = TextEditingController(text: medicationToEdit?.dosage ?? '');
    final timeCtrl = TextEditingController(text: medicationToEdit?.timeSlots.join(', ') ?? '08:00 AM');
    final instructionsCtrl = TextEditingController(text: medicationToEdit?.instructions ?? '');
    final notesCtrl = TextEditingController(text: medicationToEdit?.notes ?? '');

    String medicineType = medicationToEdit?.medicineType ?? 'Tablet';
    String frequency = medicationToEdit?.frequency ?? 'Once Daily';
    String foodRelation = medicationToEdit?.foodRelation ?? 'after_food';
    bool checkGlucose = medicationToEdit?.requiresBloodSugarCheck ?? false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Icon(
                medicationToEdit == null ? Icons.add_circle : Icons.edit_note,
                color: const Color(0xFF0369A1),
              ),
              const SizedBox(width: 8),
              Text(
                medicationToEdit == null ? 'Add New Medication' : 'Edit Medication',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Medicine Name *',
                    hintText: 'e.g. Metformin ER',
                    prefixIcon: Icon(Icons.medication),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: brandCtrl,
                        decoration: const InputDecoration(labelText: 'Brand Name', hintText: 'Glucophage'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: genericCtrl,
                        decoration: const InputDecoration(labelText: 'Generic Name', hintText: 'Metformin'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: dosageCtrl,
                        decoration: const InputDecoration(labelText: 'Dosage', hintText: '500 mg'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: medicineType,
                        decoration: const InputDecoration(labelText: 'Type'),
                        items: ['Tablet', 'Capsule', 'Insulin Injection', 'Syrup', 'Drops', 'Ointment']
                            .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                            .toList(),
                        onChanged: (val) => setDlgState(() => medicineType = val ?? 'Tablet'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: frequency,
                  decoration: const InputDecoration(labelText: 'Frequency'),
                  items: ['Once Daily', 'Twice Daily (Morning/Night)', 'Three Times Daily', 'Weekly', 'As Needed']
                      .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                      .toList(),
                  onChanged: (val) => setDlgState(() => frequency = val ?? 'Once Daily'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: timeCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Reminder Times (comma separated)',
                    hintText: '08:00 AM, 08:00 PM',
                    prefixIcon: Icon(Icons.access_time),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Food Relation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Wrap(
                  spacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('Before Food'),
                      selected: foodRelation == 'before_food',
                      onSelected: (_) => setDlgState(() => foodRelation = 'before_food'),
                    ),
                    ChoiceChip(
                      label: const Text('After Food'),
                      selected: foodRelation == 'after_food',
                      onSelected: (_) => setDlgState(() => foodRelation = 'after_food'),
                    ),
                    ChoiceChip(
                      label: const Text('With Food'),
                      selected: foodRelation == 'with_food',
                      onSelected: (_) => setDlgState(() => foodRelation = 'with_food'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Requires Blood Glucose Check First?'),
                  value: checkGlucose,
                  activeColor: const Color(0xFF0284C7),
                  onChanged: (val) => setDlgState(() => checkGlucose = val ?? false),
                ),
                TextField(
                  controller: instructionsCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Special Instructions',
                    hintText: 'Drink a full glass of water with meal',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Additional Notes',
                    hintText: 'Prescribed by Dr. Henderson',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                if (nameCtrl.text.trim().isEmpty) return;

                final newMed = Medication(
                  id: medicationToEdit?.id ?? "med_${DateTime.now().millisecondsSinceEpoch}",
                  name: nameCtrl.text.trim(),
                  brand: brandCtrl.text.trim(),
                  genericName: genericCtrl.text.trim(),
                  dosage: dosageCtrl.text.trim().isEmpty ? '1 Tablet' : dosageCtrl.text.trim(),
                  medicineType: medicineType,
                  frequency: frequency,
                  timeSlots: timeCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
                  instructions: instructionsCtrl.text.trim(),
                  foodRelation: foodRelation,
                  requiresBloodSugarCheck: checkGlucose,
                  pillColor: medicineType == 'Insulin Injection' ? 'Injection Pen' : 'White Tablet',
                  notes: notesCtrl.text.trim(),
                );

                setState(() {
                  if (medicationToEdit != null) {
                    final idx = _medications.indexWhere((m) => m.id == medicationToEdit.id);
                    if (idx != -1) _medications[idx] = newMed;
                  } else {
                    _medications.add(newMed);
                  }
                });
                ApiService.addOrUpdateMedication(newMed);

                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(medicationToEdit == null ? 'Medication saved successfully!' : 'Medication updated.'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              icon: const Icon(Icons.check),
              label: Text(medicationToEdit == null ? 'Save Medication' : 'Update'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredMeds = _medications.where((m) {
      final query = _searchQuery.toLowerCase();
      return m.name.toLowerCase().contains(query) ||
          m.brand.toLowerCase().contains(query) ||
          m.genericName.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar & Search
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Column(
                children: [
                  TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search cabinet (e.g., Metformin, Insulin)...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: const Color(0xFFF1F5F9),
                    ),
                  ),
                ],
              ),
            ),

            // Medication List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredMeds.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.medication_liquid_outlined, size: 64, color: Colors.grey.shade400),
                              const SizedBox(height: 12),
                              Text(
                                _searchQuery.isEmpty ? 'No medications added yet' : 'No matching medications found',
                                style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredMeds.length,
                          itemBuilder: (ctx, idx) {
                            final med = filteredMeds[idx];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 1,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: Colors.grey.shade200),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          width: 48,
                                          height: 48,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF0F9FF),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Icon(
                                            med.medicineType == 'Insulin Injection'
                                                ? Icons.vaccines
                                                : Icons.medication,
                                            color: const Color(0xFF0369A1),
                                            size: 26,
                                          ),
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: [
                                                  Expanded(
                                                    child: Text(
                                                      med.name,
                                                      style: const TextStyle(
                                                        fontSize: 18,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                    decoration: BoxDecoration(
                                                      color: const Color(0xFFE0F2FE),
                                                      borderRadius: BorderRadius.circular(8),
                                                    ),
                                                    child: Text(
                                                      med.dosage,
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.bold,
                                                        color: const Color(0xFF0C4A6E),
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              if (med.genericName.isNotEmpty || med.brand.isNotEmpty) ...[
                                                const SizedBox(height: 2),
                                                Text(
                                                  '${med.brand.isNotEmpty ? med.brand : med.name} (${med.genericName.isNotEmpty ? med.genericName : med.medicineType})',
                                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 6,
                                      children: [
                                        Chip(
                                          avatar: const Icon(Icons.access_time, size: 14),
                                          label: Text(med.timeSlots.join(', ')),
                                          backgroundColor: Colors.amber.shade50,
                                          side: BorderSide.none,
                                        ),
                                        Chip(
                                          avatar: const Icon(Icons.restaurant, size: 14),
                                          label: Text(med.foodRelation.replaceAll('_', ' ').toUpperCase()),
                                          backgroundColor: Colors.green.shade50,
                                          side: BorderSide.none,
                                        ),
                                        if (med.requiresBloodSugarCheck)
                                          Chip(
                                            avatar: const Icon(Icons.water_drop, size: 14, color: Colors.red),
                                            label: const Text('Check Blood Sugar First'),
                                            backgroundColor: Colors.red.shade50,
                                            side: BorderSide.none,
                                          ),
                                      ],
                                    ),
                                    if (med.instructions.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Text(
                                        'Note: ${med.instructions}',
                                        style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: const Color(0xFF334155)),
                                      ),
                                    ],
                                    const Divider(height: 24),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        TextButton.icon(
                                          onPressed: () => _showMedicationFormDialog(medicationToEdit: med),
                                          icon: const Icon(Icons.edit, size: 18),
                                          label: const Text('Edit'),
                                        ),
                                        const SizedBox(width: 8),
                                        TextButton.icon(
                                          onPressed: () {
                                            final idToDelete = med.id;
                                            setState(() => _medications.removeWhere((m) => m.id == idToDelete));
                                            ApiService.deleteMedication(idToDelete);
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('${med.name} deleted.')),
                                            );
                                          },
                                          icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                                          label: const Text('Delete', style: TextStyle(color: Colors.red)),
                                        ),
                                      ],
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showMedicationFormDialog(),
        icon: const Icon(Icons.add_circle_outline),
        label: const Text('Add Medicine'),
        backgroundColor: const Color(0xFF0284C7),
        foregroundColor: Colors.white,
      ),
    );
  }
}
