from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe

from sports.models import *

class MySportClassAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'active', 'created_at', 'coach']
    search_fields = ['name']
    list_filter = ['id', 'created_at']
    list_editable = ['name']
    readonly_fields = ['image_view']

    def image_view(self, sportclass):
        if sportclass:
            return mark_safe(f"<img src='/static/{sportclass.image.name}' width='200' />")

admin.site.register(SportClass, MySportClassAdmin)
admin.site.register(Category)
admin.site.register(Schedule)
admin.site.register(Order)
admin.site.register(MemberJoinClass)
admin.site.register(Discount)
admin.site.register(Notification)
admin.site.register(NewFeed)
admin.site.register(Coach_Category)
admin.site.register(User)
