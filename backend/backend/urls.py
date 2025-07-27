"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, re_path
from . import views
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/register/", views.register),
    path("api/login/", views.login_view),
    path("api/current_user/", views.current_user),
    path("api/logout/", views.logout_view),
    path("api/update-user/", views.update_view),
    path("api/create-song/", views.create_song),
    path("api/get-song/", views.get_song, name="get-song"),
    path("api/get_user_songs/", views.get_user_songs, name="get_user_songs"),
    path("api/update-song/", views.update_song),
    path("api/delete-song/", views.delete_song),
    path("api/create-playlist/", views.create_playlist),
    path("api/get-user/", views.get_user),
    path("api/update-playlist/", views.update_playlist),
    path("api/delete-playlist/", views.delete_playlist),
    path("api/get-user-playlist/", views.get_user_playlists),
    path("api/add_song_to_playlist/", views.add_song_to_playlist),
    path("api/remove_song_from_playlist/", views.remove_song_from_playlist),
    path("api/add_song_to_favorites/", views.add_song_to_favorites),
    path("api/get_user_favorites/", views.get_user_favorites),
    path("api/remove_song_from_favorites/", views.remove_song_from_favorites),
    path("api/get_all_users/", views.get_all_users),
    path("api/toggle_follow/", views.toggle_follow),
    path("api/is_following/", views.is_following),
    path("api/get_user_followers/", views.get_user_followers),
    path("api/recently_liked/", views.recently_liked),
    path("api/get_users_following/", views.get_users_following),
    path("api/change_music_playing/", views.change_music_playing),
    path("api/set_playlist_index/", views.set_playlist_index),
    path("api/get_all_songs/", views.get_all_songs),
    path("api/get_all_playlists/", views.get_all_playlists),
    path("api/add_existing_playlist/", views.add_existing_playlist),
    path("api/remove_existing_playlist/", views.remove_existing_playlist),
    path("api/is_existing_exist_on_me/", views.is_existing_exist_on_me),
    path("api/load_start_music/", views.load_start_music),
    path("api/set_playing_list/", views.set_playing_list),
    path("api/get_user_profile/", views.get_user_profile),
    path("api/get_playlist/", views.get_playlist),
    path("api/add_artist_as_playlist/", views.add_artist_as_playlist),
    path("api/does_it_have_artist/", views.does_it_have_artist),
    path("api/remove_artist_as_playlist/", views.remove_artist_as_playlist),
    path("api/get_random_list/", views.get_random_list),
    path("api/get_user_notifications/", views.get_user_notifications),
    path("api/remove_user_notifications/", views.remove_user_notifications),
    path("api/add_recently_played/", views.add_recently_played),
    path("api/return_recently_played/", views.return_recently_played),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?:.*)/?$", views.index),
]
