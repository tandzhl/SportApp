import requests
from django.contrib.auth.models import User
from sports.models import Device

class NotificationService:
    EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push"

    @staticmethod
    def send_notification(users, title, body):
        tokens = Device.objects.filter(user__in=users, active=True).values_list('token', flat=True)
        if not tokens:
            return {"status": "no devices"}

        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        payload = {"to": list(tokens), "title": title, "body": body, "data": {"type": "general_notification"}}
        response = requests.post(NotificationService.EXPO_PUSH_ENDPOINT, json=payload, headers=headers)
        return response.json()

    @staticmethod
    def send_schedule_reminder(user, schedule):
        device = Device.objects.filter(user=user, active=True).first()
        if not device:
            return {"status": "no device"}

        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        payload = {
            "to": device.token,
            "title": f"Class Reminder: {schedule.sportclass.name}",
            "body": f"Your class is scheduled for {schedule.datetime}",
            "data": {"type": "schedule", "schedule_id": str(schedule.id)},
        }
        response = requests.post(NotificationService.EXPO_PUSH_ENDPOINT, json=payload, headers=headers)
        return response.json()

    @staticmethod
    def send_promotion_notification(users, promotion):
        tokens = Device.objects.filter(user__in=users, active=True).values_list('token', flat=True)
        if not tokens:
            return {"status": "no devices"}

        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        payload = {
            "to": list(tokens),
            "title": f"New Promotion: {promotion.name}",
            "body": f"Get {promotion.percent}% off! Valid until {promotion.end_date}",
            "data": {"type": "promotion", "promotion_id": str(promotion.id)},
        }
        response = requests.post(NotificationService.EXPO_PUSH_ENDPOINT, json=payload, headers=headers)
        return response.json()
