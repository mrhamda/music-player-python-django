from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
import os
from mutagen.mp3 import MP3


def avatar_upload_path(instance, filename):
    return os.path.join("assets/images", filename)


def audio_upload_path(instance, filename):
    return os.path.join("assets/audio/{filename}.mp3")


class Song(models.Model):
    owner = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="owned_song",
        null=True,
        blank=True,
    )
    img = models.ImageField(
        _("songImg"),
        upload_to=avatar_upload_path,
        default="assets/images/profile.png",
        blank=True,
        null=True,
    )
    audio = models.FileField(
        _("song file"),
        upload_to=audio_upload_path,
        blank=True,
        null=True,
    )
    name = models.TextField(_("name"), default="None")
    visibility = models.BooleanField(default=False)

    duration = models.FloatField(_("duration (seconds)"), null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save first to ensure file is available

        if self.audio:
            audio_path = self.audio.path
            if os.path.isfile(audio_path):
                try:
                    audio_file = MP3(audio_path)
                    self.duration = audio_file.info.length
                    # Save only duration
                    super().save(update_fields=["duration"])
                except Exception as e:
                    print(f"Error reading audio duration: {e}")
                    self.duration = None

    def __str__(self):
        return self.name


class Playlist(models.Model):
    owner = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="owned_playlists"
    )
    name = models.CharField(max_length=100)
    img = models.ImageField(
        _("Playlist Image"),
        upload_to=avatar_upload_path,
        default="/assets/images/profile.png",
        blank=True,
        null=True,
    )
    songs = models.ManyToManyField("Song", related_name="playlists")
    visibility = models.BooleanField(default=False)

    class Meta:
        unique_together = ("owner", "name")
        # unique_together = ('owner', 'name')

    def __str__(self):
        return self.name


class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    name = models.TextField(_("name"), default="Unnamed User")
    about = models.TextField(_("about"), default="No bio yet")
    avatar = models.ImageField(
        _("avatar"),
        upload_to=avatar_upload_path,
        default="assets/profile.png",
        blank=True,
        null=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    favorites = models.ManyToManyField(
        "Song", symmetrical=False, related_name="favorites", blank=True
    )

    followers = models.ManyToManyField(
        "self", symmetrical=False, related_name="followers_set", blank=True
    )
    following = models.ManyToManyField(
        "self", symmetrical=False, related_name="following_set", blank=True
    )

    # ADD RECENTLY PLAYED

    recently = models.ManyToManyField("Song", related_name="users", blank=True)

    songs = models.ManyToManyField("Song", related_name="recently", blank=True)

    playlists = models.ManyToManyField("Playlist", related_name="playist", blank=True)

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Notification(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    artist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="artist_notifications",
        default=1,  #
    )
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(_("Notification Image"), blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Optional: link to a song, post, or action source
    song = models.ForeignKey(
        "Song",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )

    # Optional: link to a song, post, or action source
    playlist = models.ForeignKey(
        "Playlist",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )

    def __str__(self):
        return f"To: {self.owner.username} - {self.title or 'Notification'}"


class RecentlyPlayed(models.Model):
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="recently_played"
    )
    song = models.ForeignKey("Song", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "song")
        ordering = ["-created_at"]  # Most recent first
