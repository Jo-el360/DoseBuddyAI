import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole { patient, caregiver, doctor, admin }

class UserModel {
  final String uid;
  final String email;
  final String fullName;
  final UserRole role;
  final String? phoneNumber;
  final String? photoUrl;
  final int age;
  final String gender;
  final String country;
  final String timeZone;
  final String preferredLanguage;
  final String height;
  final String weight;
  final String bloodGroup;
  final List<String> medicalConditions;
  final List<String> allergies;
  final String emergencyContact;
  final String caregiverContact;
  
  // Routine & Onboarding Preferences
  final String dailyRoutine;
  final String wakeTime;
  final String sleepTime;
  final String breakfastTime;
  final String lunchTime;
  final String dinnerTime;
  final bool isOnboarded;
  final bool emailVerified;
  final DateTime createdAt;

  UserModel({
    required this.uid,
    required this.email,
    required this.fullName,
    this.role = UserRole.patient,
    this.phoneNumber,
    this.photoUrl,
    this.age = 70,
    this.gender = 'Female',
    this.country = 'United States',
    this.timeZone = 'EST (UTC-5)',
    this.preferredLanguage = 'English',
    this.height = "5'4\"",
    this.weight = "154 lbs",
    this.bloodGroup = 'O+',
    this.medicalConditions = const ['Type 2 Diabetes', 'Hypertension'],
    this.allergies = const ['Penicillin'],
    this.emergencyContact = '+1 555-911-0000',
    this.caregiverContact = '+1 555-888-9999',
    this.dailyRoutine = 'Retired / Low Activity',
    this.wakeTime = '07:30 AM',
    this.sleepTime = '09:30 PM',
    this.breakfastTime = '08:00 AM',
    this.lunchTime = '01:00 PM',
    this.dinnerTime = '06:30 PM',
    this.isOnboarded = true,
    this.emailVerified = true,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory UserModel.fromMap(Map<String, dynamic> map, String uid) {
    return UserModel(
      uid: uid,
      email: map['email'] ?? '',
      fullName: map['fullName'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.name == (map['role'] ?? 'patient'),
        orElse: () => UserRole.patient,
      ),
      phoneNumber: map['phoneNumber'],
      photoUrl: map['photoUrl'],
      age: map['age'] ?? 70,
      gender: map['gender'] ?? 'Female',
      country: map['country'] ?? 'United States',
      timeZone: map['timeZone'] ?? 'EST',
      preferredLanguage: map['preferredLanguage'] ?? 'English',
      height: map['height'] ?? "5'4\"",
      weight: map['weight'] ?? "154 lbs",
      bloodGroup: map['bloodGroup'] ?? 'O+',
      medicalConditions: List<String>.from(map['medicalConditions'] ?? []),
      allergies: List<String>.from(map['allergies'] ?? []),
      emergencyContact: map['emergencyContact'] ?? '',
      caregiverContact: map['caregiverContact'] ?? '',
      dailyRoutine: map['dailyRoutine'] ?? 'Retired',
      wakeTime: map['wakeTime'] ?? '07:30 AM',
      sleepTime: map['sleepTime'] ?? '09:30 PM',
      breakfastTime: map['breakfastTime'] ?? '08:00 AM',
      lunchTime: map['lunchTime'] ?? '01:00 PM',
      dinnerTime: map['dinnerTime'] ?? '06:30 PM',
      isOnboarded: map['isOnboarded'] ?? true,
      emailVerified: map['emailVerified'] ?? true,
      createdAt: map['createdAt'] != null
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'fullName': fullName,
      'role': role.name,
      'phoneNumber': phoneNumber,
      'photoUrl': photoUrl,
      'age': age,
      'gender': gender,
      'country': country,
      'timeZone': timeZone,
      'preferredLanguage': preferredLanguage,
      'height': height,
      'weight': weight,
      'bloodGroup': bloodGroup,
      'medicalConditions': medicalConditions,
      'allergies': allergies,
      'emergencyContact': emergencyContact,
      'caregiverContact': caregiverContact,
      'dailyRoutine': dailyRoutine,
      'wakeTime': wakeTime,
      'sleepTime': sleepTime,
      'breakfastTime': breakfastTime,
      'lunchTime': lunchTime,
      'dinnerTime': dinnerTime,
      'isOnboarded': isOnboarded,
      'emailVerified': emailVerified,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
