import logging

logger = logging.getLogger("fcm_service")

async def send_caregiver_alert(fcm_token: str, patient_name: str, medication_name: str, scheduled_time: str):
    """
    Simulates Firebase Cloud Messaging (FCM) high-priority notification to caregiver's phone.
    In production, this initializes firebase_admin.messaging and dispatches a Messaging Multicast or Token payload.
    """
    logger.info(f"Sending FCM Push Alert to Caregiver [Token: {fcm_token[:8]}...]")
    
    notification_title = f"🚨 Dose Alert: {patient_name} Missed Medication"
    notification_body = f"{patient_name} did not confirm taking {medication_name} scheduled for {scheduled_time}. Tap to call or check in."

    # Return structured FCM payload dispatch confirmation
    return {
        "fcm_message_id": f"projects/dosebuddy-ai/messages/fcm_{int(scheduled_time.replace(':', '') or '1200')}_alert",
        "status": "DELIVERED",
        "recipient_token": fcm_token,
        "notification": {
            "title": notification_title,
            "body": notification_body,
            "sound": "high_priority_alert.mp3",
            "priority": "HIGH"
        },
        "data": {
            "patient_name": patient_name,
            "medication": medication_name,
            "scheduled_time": scheduled_time,
            "action": "CALL_PATIENT"
        }
    }
