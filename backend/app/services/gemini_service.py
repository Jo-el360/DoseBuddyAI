import os
from google import genai
from app.config import settings

def get_genai_client():
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    return genai.Client(api_key=api_key)

async def generate_personalized_reminder(req):
    """
    Generates a personalized, gentle reminder for elderly diabetic patients using Gemini 3.6 Flash.
    """
    try:
        client = get_genai_client()
        prompt = f"""
        You are DoseBuddy, a compassionate, warm AI audio voice companion for an elderly diabetic patient named {req.patient_name}.
        Generate a gentle, easy-to-understand medication reminder.

        Medication: {req.medication_name} ({req.dosage})
        Timing: {req.time_of_day}
        Meal Relation: {req.meal_relation}
        Instructions: {req.instructions}
        Blood Sugar Check Required: {req.blood_sugar_check_required}

        Rules:
        - Warm, encouraging, respectful tone.
        - Under 3 sentences.
        - Emphasize taking with meals or measuring blood glucose first if requested.
        """

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
        return {
            "status": "success",
            "message": response.text.strip() if response and response.text else f"Good day {req.patient_name}, remember to take your {req.medication_name} ({req.dosage}) with your meal!"
        }
    except Exception as e:
        print(f"Gemini Service Exception: {e}")
        return {
            "status": "fallback",
            "message": f"Hello {req.patient_name}, it's time for your {req.medication_name} ({req.dosage}). Please take it as instructed: {req.instructions}."
        }

async def chat_with_dosebuddy(message: str, patient_name: str = "Maria") -> str:
    try:
        client = get_genai_client()
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"Patient {patient_name} asks: {message}",
            config={
                "system_instruction": "You are DoseBuddy, an empathetic, encouraging healthcare AI helper for elderly diabetic patients. Answer concisely with clear guidance and remind them to keep their caregiver informed."
            }
        )
        return response.text if response and response.text else "I am here to help you stay healthy! Remember to check your blood sugar and take your medication with your meal."
    except Exception as e:
        return f"DoseBuddy AI is here to help you, {patient_name}! Remember to take your medications regularly with food."
