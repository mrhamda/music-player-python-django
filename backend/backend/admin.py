from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from django.apps import apps


class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


admin.site.register(User)
admin.site.register(Playlist, PlaylistAdmin)
admin.site.register(Song)
admin.site.register(Notification)
