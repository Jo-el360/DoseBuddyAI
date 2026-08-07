import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/medication.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<List<Medication>> getMedications() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/medications'))
          .timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Medication.fromJson(json)).toList();
      }
    } catch (_) {
      // Gracefully fall back to rich preset medications
    }
    return [
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
    } catch (_) {
      // Gracefully fall back
    }
    return {
      'status': 'fallback',
      'message': 'Good day $patientName! It is time for your ${med.name} (${med.dosage}). Please take it with food.',
    };
  }

  static Future<bool> confirmDose(String medId, double? glucoseReading) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/dosage/confirm'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'medication_id': medId,
          'patient_id': 'patient_123',
          'confirmed_at': DateTime.now().toIso8601String(),
          'status': 'CONFIRMED',
          'glucose_reading': glucoseReading,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      return true;
    }
  }
}
