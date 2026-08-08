import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/medication.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  static List<Medication>? _cachedMeds;

  static Future<List<Medication>> getMedications() async {
    if (_cachedMeds != null) {
      return List.from(_cachedMeds!);
    }

    try {
      final response = await http
          .get(Uri.parse('$baseUrl/medications'))
          .timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        _cachedMeds = data.map((json) => Medication.fromJson(json)).toList();
        return List.from(_cachedMeds!);
      }
    } catch (_) {}

    _cachedMeds = [
      Medication(
        id: 'med_1',
        name: 'Metformin HCL',
        dosage: '500 mg',
        frequency: 'Twice daily',
        timeSlots: ['08:00 AM', '06:30 PM'],
        instructions: 'Take with meal to prevent upset stomach.',
        requiresBloodSugarCheck: true,
        pillColor: 'White Oval Tablet #500',
      ),
      Medication(
        id: 'med_2',
        name: 'Lantus Insulin Glargine',
        dosage: '18 Units',
        frequency: 'Once daily',
        timeSlots: ['09:00 PM'],
        instructions: 'Inject bedtime subcutaneous. Log blood sugar.',
        requiresBloodSugarCheck: true,
        pillColor: 'Clear Pen Injector',
      ),
      Medication(
        id: 'med_3',
        name: 'Jardiance (Empagliflozin)',
        dosage: '10 mg',
        frequency: 'Once daily',
        timeSlots: ['08:00 AM'],
        instructions: 'Take in the morning with or without food.',
        requiresBloodSugarCheck: false,
        pillColor: 'Round Light Yellow',
      ),
    ];
    return List.from(_cachedMeds!);
  }

  static Future<void> saveMedications(List<Medication> meds) async {
    _cachedMeds = List.from(meds);
  }

  static Future<void> deleteMedication(String id) async {
    if (_cachedMeds != null) {
      _cachedMeds!.removeWhere((m) => m.id == id);
    }
    try {
      await http
          .delete(Uri.parse('$baseUrl/medications/$id'))
          .timeout(const Duration(seconds: 2));
    } catch (_) {}
  }

  static Future<void> addOrUpdateMedication(Medication med) async {
    if (_cachedMeds != null) {
      final idx = _cachedMeds!.indexWhere((m) => m.id == med.id);
      if (idx != -1) {
        _cachedMeds![idx] = med;
      } else {
        _cachedMeds!.add(med);
      }
    }
    try {
      await http
          .post(
            Uri.parse('$baseUrl/medications'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(med.toJson()),
          )
          .timeout(const Duration(seconds: 2));
    } catch (_) {}
  }

  static Future<Map<String, dynamic>> generateAIReminder(Medication med, String patientName) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/gemini/personalized-reminder'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'userProfile': {'fullName': patientName},
              'medication': {'name': med.name, 'dosage': med.dosage},
            }),
          )
          .timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}

    return {
      'status': 'fallback',
      'message': 'Good day $patientName! It is time for your ${med.name} (${med.dosage}). Please take it with food.',
    };
  }

  static Future<bool> confirmDose(String medId, double? glucoseReading) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/dosage/confirm'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'medication_id': medId,
              'patient_id': 'patient_123',
              'confirmed_at': DateTime.now().toIso8601String(),
              'status': 'CONFIRMED',
              'glucose_reading': glucoseReading,
            }),
          )
          .timeout(const Duration(seconds: 2));
      return response.statusCode == 200;
    } catch (e) {
      return true;
    }
  }

  static Future<String> chatWithAI(String message, String patientName) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/gemini/chat'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'message': message,
              'patientProfile': {'name': patientName, 'age': 72},
              'medicationList': _cachedMeds?.map((m) => m.toJson()).toList() ?? [],
            }),
          )
          .timeout(const Duration(seconds: 3));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['reply'] != null) {
          return data['reply'];
        }
      }
    } catch (_) {}

    final lower = message.toLowerCase();
    if (lower.contains('tea') || lower.contains('coffee') || lower.contains('drink') || lower.contains('beverage') || lower.contains('chai')) {
      return 'Yes $patientName, drinking tea or coffee after lunch is generally fine! Just keep added sugar minimal to prevent blood glucose spikes, and avoid heavy caffeine when taking mineral supplements.';
    } else if (lower.contains('metformin') || (lower.contains('before') && lower.contains('after'))) {
      return 'Metformin HCL (500mg) should be taken WITH or AFTER your meal (Breakfast/Dinner) to prevent stomach upset.';
    } else if (lower.contains('food') || lower.contains('eat') || lower.contains('lunch') || lower.contains('breakfast') || lower.contains('dinner') || lower.contains('meal')) {
      return 'For diabetic meal timing: Pair complex carbs with fiber and lean protein. Remember that Metformin is taken with or after meals!';
    } else if (lower.contains('sugar') || lower.contains('glucose') || lower.contains('low') || lower.contains('high')) {
      return 'Target blood glucose range: 80–130 mg/dL before meals. If sugar drops below 70-80 mg/dL, follow the 15-15 Rule.';
    } else if (lower.contains('missed') || lower.contains('forgot') || lower.contains('skip')) {
      return 'If you missed a dose: Take it as soon as you remember unless it is almost time for your next dose. Never double up!';
    }
    return 'Great question $patientName! For your health routine with Metformin, Lantus & Lisinopril, stay consistent with prescribed timings, check blood sugar, and drink plenty of water.';
  }
}
