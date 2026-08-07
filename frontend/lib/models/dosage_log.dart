class DosageLog {
  final String id;
  final String medicationId;
  final String medicationName;
  final String dosage;
  final DateTime scheduledTime;
  final DateTime? confirmedAt;
  final String status; // 'TAKEN', 'SKIPPED', 'SNOOZED', 'PENDING'
  final double? glucoseReading;
  final String? notes;

  DosageLog({
    required this.id,
    required this.medicationId,
    required this.medicationName,
    required this.dosage,
    required this.scheduledTime,
    this.confirmedAt,
    this.status = 'PENDING',
    this.glucoseReading,
    this.notes,
  });

  factory DosageLog.fromJson(Map<String, dynamic> json) {
    return DosageLog(
      id: json['id'] ?? '',
      medicationId: json['medication_id'] ?? json['medicationId'] ?? '',
      medicationName: json['medication_name'] ?? json['medicationName'] ?? '',
      dosage: json['dosage'] ?? '',
      scheduledTime: json['scheduled_time'] != null
          ? DateTime.parse(json['scheduled_time'])
          : DateTime.now(),
      confirmedAt: json['confirmed_at'] != null
          ? DateTime.parse(json['confirmed_at'])
          : null,
      status: json['status'] ?? 'PENDING',
      glucoseReading: json['glucose_reading']?.toDouble(),
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'medication_id': medicationId,
      'medication_name': medicationName,
      'dosage': dosage,
      'scheduled_time': scheduledTime.toIso8601String(),
      'confirmed_at': confirmedAt?.toIso8601String(),
      'status': status,
      'glucose_reading': glucoseReading,
      'notes': notes,
    };
  }
}
