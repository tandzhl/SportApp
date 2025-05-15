from django.contrib import admin
from .models import *
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.utils.safestring import mark_safe


class NewFeedForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)
    class Meta:
        model = NewFeed
        fields = '__all__'


class NewFeedAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'active', 'created_at']
    search_fields = ['title']
    list_filter = ['id', 'created_at']
    list_editable = ['title']
    readonly_fields = ['image_view']
    form = NewFeedForm

    def image_view(self, news):
        if news:
            return mark_safe(f"<img src='/static/{news.image.name}' width='200' />")

    class Media:
        css = {
            'all': ('/static/css/styles.css', )
        }


admin.site.register([User, Category, SportClass, Schedule, Order, Discount, Notification, Device, MemberJoinClass, Comment])
admin.site.register(NewFeed, NewFeedAdmin)

# Register your models here.
