class Medication {
  final String id;
  final String name;
  final String brand;
  final String genericName;
  final String dosage;
  final String medicineType;
  final String frequency;
  final List<String> timeSlots;
  final String instructions;
  final String foodRelation; // 'before_food', 'after_food', 'with_food', 'no_relation'
  final bool requiresBloodSugarCheck;
  final int targetGlucoseMin;
  final int targetGlucoseMax;
  final String pillColor;
  final String? imageUrl;
  final String notes;

  Medication({
    required this.id,
    required this.name,
    this.brand = '',
    this.genericName = '',
    required this.dosage,
    this.medicineType = 'Tablet',
    required this.frequency,
    required this.timeSlots,
    required this.instructions,
    this.foodRelation = 'after_food',
    this.requiresBloodSugarCheck = false,
    this.targetGlucoseMin = 80,
    this.targetGlucoseMax = 130,
    required this.pillColor,
    this.imageUrl,
    this.notes = '',
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      brand: json['brand'] ?? '',
      genericName: json['generic_name'] ?? json['genericName'] ?? '',
      dosage: json['dosage'] ?? '',
      medicineType: json['medicine_type'] ?? json['medicineType'] ?? 'Tablet',
      frequency: json['frequency'] ?? '',
      timeSlots: List<String>.from(json['time_slots'] ?? json['timeSlots'] ?? []),
      instructions: json['instructions'] ?? '',
      foodRelation: json['food_relation'] ?? json['foodRelation'] ?? 'after_food',
      requiresBloodSugarCheck: json['requires_blood_sugar_check'] ?? json['requiresBloodSugarCheck'] ?? false,
      targetGlucoseMin: json['target_glucose_min'] ?? json['targetGlucoseMin'] ?? 80,
      targetGlucoseMax: json['target_glucose_max'] ?? json['targetGlucoseMax'] ?? 130,
      pillColor: json['pill_color'] ?? json['pillColor'] ?? 'White Pill',
      imageUrl: json['image_url'] ?? json['imageUrl'],
      notes: json['notes'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'generic_name': genericName,
      'dosage': dosage,
      'medicine_type': medicineType,
      'frequency': frequency,
      'time_slots': timeSlots,
      'instructions': instructions,
      'food_relation': foodRelation,
      'requires_blood_sugar_check': requiresBloodSugarCheck,
      'target_glucose_min': targetGlucoseMin,
      'target_glucose_max': targetGlucoseMax,
      'pill_color': pillColor,
      'image_url': imageUrl,
      'notes': notes,
    };
  }
}
