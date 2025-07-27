from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Song, Playlist, Notification, RecentlyPlayed
import json
from django.contrib.auth import authenticate
import re
from django.contrib.auth import logout, login
import os

from django.shortcuts import redirect
from . import settings
import mutagen
from django.shortcuts import get_object_or_404
import random


pattern = r"^(?=.*[A-Z])(?=.*\d).{8,}$"


def index(request):
    return render(request, "index.html")


def register(request):

    # Password validation regex:
    # - at least 8 characters
    # - at least one uppercase letter
    # - at least one digit

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")
            c_password = data.get("cPassword")

            name = data.get("name")

            if not re.match(pattern, password):
                return JsonResponse(
                    {
                        "error": "Password must be at least 8 characters long, "
                        "contain at least one uppercase letter and one number."
                    },
                    status=400,
                )

            if not name or not password or not c_password or not name:
                return JsonResponse({"error": "Missing fields."}, status=400)

            if password != c_password:
                return JsonResponse({"error": "Passwords do not match."}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already registered."}, status=400)

            user = User.objects.create_user(
                email=email, password=password, name=name)

            return JsonResponse(
                {"message": "User created successfully."},
                status=201,
            )

        except Exception as e:

            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"error": "Missing fields."}, status=400)

            user = authenticate(username=email, password=password)

            if user is None:
                return JsonResponse({"error": "Invalid credentials."}, status=400)

            login(request, user)

            return JsonResponse(
                {"message": "User logged in successfully."},
                status=200,
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def current_user(request):
    user = request.user
    if user.is_authenticated:
        data = {
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar.url,
            "id": user.id,
            "about": user.about,
        }
    else:
        data = {"error": "User not authenticated"}

    return JsonResponse(data)


def logout_view(request):
    print("Logout view called")
    if request.method == "POST":
        logout(request)
        response = JsonResponse({"message": "Logged out"})
        response.delete_cookie("sessionid")
        return response
    return JsonResponse({"error": "Invalid request method."}, status=405)


def update_view(request):
    if request.method == "POST":
        # If simulating PUT:
        if request.POST.get("_method") == "PUT":
            try:
                user = request.user
                if not user or not user.is_authenticated:
                    return JsonResponse({"error": "Invalid credentials."}, status=401)

                data = request.POST
                avatar_file = request.FILES.get("avatar")

                username = data.get("username")
                password = data.get("password")
                passwordC = data.get("cpassword")
                about = data.get("about")

                if not username:
                    return JsonResponse({"error": "Missing username"}, status=400)

                user.name = username
                user.about = about

                if password:
                    if not re.match(pattern, password):
                        return JsonResponse(
                            {
                                "error": "Password must be at least 8 characters long, "
                                "contain at least one uppercase letter and one number."
                            },
                            status=400,
                        )

                if password and passwordC:
                    if password == passwordC:
                        user.set_password(password)
                    else:
                        return JsonResponse(
                            {"error": "Passwords do not match."}, status=400
                        )

                if avatar_file:
                    if user.avatar and hasattr(user.avatar, "path"):
                        old_avatar_path = user.avatar.path
                    if os.path.exists(old_avatar_path):
                        os.remove(old_avatar_path)

                    user.avatar = avatar_file
                    user.save()

                    user.avatar = "assets/images/{}".format(avatar_file.name)

                user.save()
                return JsonResponse(
                    {"message": "User updated successfully."}, status=200
                )

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse(
            {"error": "Missing or incorrect _method override."}, status=400
        )

    return JsonResponse({"error": "Invalid request method."}, status=405)


def create_song(request):

    if request.method == "POST":
        try:

            songName = request.POST.get("name")
            imgFile = request.FILES.get("image")
            audioFile = request.FILES.get("audio")
            visibilty = request.POST.get("visibility")
            userID = request.POST.get("id")

            visibiltyBoolean = False

            if visibilty == "true":
                visibiltyBoolean = True
            else:
                visibiltyBoolean = False

            if not visibilty:
                visibiltyBoolean = False

            if not songName or not imgFile or not audioFile:
                return JsonResponse({"error": "Missing fields."}, status=400)

            owner = User.objects.get(id=userID)

            songInstance = Song.objects.create(
                owner=owner,
                img=imgFile,
                visibility=visibiltyBoolean,
                name=songName,
                audio=audioFile,
            )

            followers = owner.followers.all()
            if visibiltyBoolean:
                for follower in followers:
                    Notification.objects.create(
                        owner=follower,
                        image=imgFile,
                        title=f"{owner.name} has released {songName}",
                        is_read=False,
                        song=songInstance,
                        artist=owner,
                    )

            return JsonResponse(
                {
                    "message": "User created successfully.",
                    "imagePath": songInstance.img.url,
                    "audioPath": songInstance.audio.url,
                },
                status=201,
            )

        except Exception as e:

            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def get_song(request):
    if request.method == "GET":
        # Use .GET for query parameters (e.g., /api/get-song/?id=5)
        song_id = request.GET.get("id")
        if not song_id:
            return JsonResponse({"error": "Missing song ID."}, status=400)

        try:
            song = Song.objects.get(id=song_id)
            data = {
                "id": song.id,
                "name": song.name,
                "owner": song.owner.id if song.owner else None,
                "visibility": song.visibility,
                "img": song.img.url if song.img else None,
                "audio": song.audio.url if song.audio else None,
            }
            return JsonResponse(data)
        except Song.DoesNotExist:
            return JsonResponse({"error": "Song not found."}, status=404)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def get_user_songs(request):
    if request.method == "GET":
        user_id = request.GET.get("id")
        if not user_id:
            return JsonResponse({"error": "Missing user ID."}, status=400)

        try:
            user = User.objects.get(id=user_id)

            songs = Song.objects.filter(owner__id=user_id)

            songs_data = []

            for song in songs:
                duration = None
                try:
                    # Use mutagen to open the audio file by its path
                    audio_file_path = song.audio.path  # get file path on disk
                    audio = mutagen.File(audio_file_path)
                    if audio and audio.info:
                        # duration in seconds (float)
                        duration = audio.info.length
                except Exception as e:
                    # Could not read duration, log or ignore
                    print(f"Error getting duration for song {song.id}: {e}")

                songs_data.append(
                    {
                        "id": song.id,
                        "name": song.name,
                        "owner": song.owner.name if song.owner else None,
                        "owner_id": song.owner.id,
                        "visibility": song.visibility,
                        "image": song.img.url if song.img else None,
                        "audio": song.audio.url if song.audio else None,
                        "duration": duration,  # add duration here
                    }
                )

            return JsonResponse({"songs": songs_data})

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def update_song(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    song_id = request.POST.get("id")
    song_name = request.POST.get("name")
    img_file = request.FILES.get("image")
    visibility = request.POST.get("visibility")

    if not song_id:
        return JsonResponse({"error": "Missing song ID."}, status=400)

    if not song_name:
        return JsonResponse({"error": "Name cannot be empty."}, status=400)

    try:
        song = Song.objects.get(id=song_id)
    except Song.DoesNotExist:
        return JsonResponse({"error": "Song not found."}, status=404)

    # Parse visibility to boolean
    visibility_bool = visibility.lower() == "true" if visibility else False

    # Delete old image if a new one is provided
    if img_file:
        old_img_path = song.img.path if song.img else None
        song.img = img_file
        if old_img_path and os.path.isfile(old_img_path):
            os.remove(old_img_path)

    # Update other fields
    song.name = song_name
    song.visibility = visibility_bool
    song.save()

    # Send notifications if visibility is True
    if visibility_bool:
        followers = song.owner.followers.all()
        for follower in followers:
            Notification.objects.create(
                owner=follower,
                image=img_file,
                title=f"{song.owner.name} has released {song_name}",
                is_read=False,
                song=song,
                artist=song.owner,
            )

    return JsonResponse({"success": "Song updated successfully"})


def delete_song(request):
    if request.method == "POST" and request.POST.get("_method") == "DELETE":
        song_id = request.POST.get("id")

        if not song_id:
            return JsonResponse({"error": "Missing song ID."}, status=400)

        try:
            song = Song.objects.get(id=song_id)
            song.delete()
            return JsonResponse({"success": "Song deleted successfully"})
        except Song.DoesNotExist:
            return JsonResponse({"error": "Song not found."}, status=404)

    return JsonResponse(
        {"error": "Invalid request method or missing _method=DELETE"}, status=405
    )


def create_playlist(request):
    if request.method == "POST":
        try:
            playlistName = request.POST.get("name")
            imgFile = request.FILES.get("image")
            visibilty = request.POST.get("visibility")
            userID = request.POST.get("id")

            visibiltyBoolean = False

            user = User.objects.get(id=userID)

            if visibilty == "true":
                visibiltyBoolean = True
            else:
                visibiltyBoolean = False

            if not visibilty:
                visibiltyBoolean = False

            if not playlistName or not imgFile:
                return JsonResponse({"error": "Missing fields."}, status=400)

            # Prevent user from creating a playlist with the same name and image as their own artist profile
            if playlistName == user.name or imgFile.name == user.avatar.name:
                return JsonResponse(
                    {
                        "error": "You cannot create a playlist with the same name and image as your artist profile."
                    },
                    status=400,
                )

            owner = User.objects.get(id=userID)

            playlistInstance = Playlist.objects.create(
                owner=owner,
                img=imgFile,
                visibility=visibiltyBoolean,
                name=playlistName,
            )

            user.playlists.add(playlistInstance)

            song_data = []

            followers = owner.followers.all()
            if visibiltyBoolean:
                for follower in followers:
                    Notification.objects.create(
                        owner=follower,
                        image=imgFile,
                        title=f"{owner.name} has released playlist: {playlistName}",
                        is_read=False,
                        playlist=playlistInstance,
                        artist=owner,
                    )

            for song in playlistInstance.songs.all():
                song_data.append(
                    {
                        "id": song.id,
                        "name": song.name,
                        "img": song.img.url if song.img else "",
                        "audio": song.audio.url if song.audio else "",
                        "visibility": song.visibility,
                        "duration": song.duration,
                        "owner": song.owner.id if song.owner else None,
                    }
                )

            return JsonResponse(
                {
                    "message": "Playlist created successfully.",
                    "imagePath": playlistInstance.img.url,
                    "id": playlistInstance.id,
                    "owner": playlistInstance.owner.id,
                    "songs": song_data,
                },
                status=201,
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def get_user(request):
    userID = request.GET.get("id")

    try:
        user = User.objects.get(id=userID)
        return JsonResponse(
            {
                "message": "Found user successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "avatar": user.avatar.url,
                    "about": user.about,
                },
            }
        )

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def update_playlist(request):
    if request.method == "POST":
        override_method = request.POST.get("_method", "").upper()

        if override_method == "PUT":
            playlistID = request.POST.get("id")
            name = request.POST.get("name")
            visibility = request.POST.get("visibility")
            image = request.FILES.get("image")

            visibilityBoolean = visibility == "true"

            try:
                playlistModel = Playlist.objects.get(id=playlistID)
                owner = playlistModel.owner  # Get owner from playlist

                if not name:
                    return JsonResponse({"error": "Playlist name is required"}, status=400)

                playlistModel.name = name
                if image:
                    playlistModel.img = image
                playlistModel.visibility = visibilityBoolean
                playlistModel.save()

                if visibilityBoolean:
                    followers = owner.followers.all()
                    for follower in followers:
                        Notification.objects.create(
                            owner=follower,
                            image=playlistModel.img,  # Use playlistModel.img here
                            title=f"{owner.name} has released playlist: {name}",
                            is_read=False,
                            playlist=playlistModel,
                            artist=owner,
                        )

                return JsonResponse(
                    {
                        "message": "Playlist updated successfully",
                        "image": playlistModel.img.url if playlistModel.img else None,
                    },
                    status=200,
                )

            except Playlist.DoesNotExist:
                return JsonResponse({"error": "Playlist not found"}, status=404)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def delete_playlist(request):
    if request.method == "POST" and request.POST.get("_method") == "DELETE":
        playlist_id = request.POST.get("id")

        if not playlist_id:
            return JsonResponse({"error": "Missing Playlist ID."}, status=400)

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            playlist.delete()
            return JsonResponse({"success": "Playlist deleted successfully"})
        except Song.DoesNotExist:
            return JsonResponse({"error": "Playlist not found."}, status=404)

    return JsonResponse(
        {"error": "Invalid request method or missing _method=DELETE"}, status=405
    )


def get_user_playlists(request):
    user_id = request.GET.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        playlists = user.playlists.all()
        data = {
            str(playlist.id): {
                "name": playlist.name,
                "img": playlist.img.url if playlist.img else None,
                "visibility": playlist.visibility,
                "owner": playlist.owner.id,
                "id": playlist.id,
                "songs": [
                    {
                        "id": song.id,
                        "name": song.name,
                        "owner": song.owner.name,
                        "owner_id": song.owner.id,
                        "audio": song.audio.url,
                        "visibility": song.visibility,
                        "image": song.img.url,
                        "duration": song.duration,
                    }
                    for song in playlist.songs.all()
                ],
            }
            for playlist in playlists
        }

        return JsonResponse({"playlists": data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_user_profile(request):
    user_id = request.GET.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID"}, status=400)

    try:
        playlists = Playlist.objects.filter(owner=user_id)
        data = {
            str(playlist.id): {
                "name": playlist.name,
                "img": playlist.img.url if playlist.img else None,
                "visibility": playlist.visibility,
                "owner": playlist.owner.id,
                "owner_name": playlist.owner.name,
                "id": playlist.id,
                "songs": [
                    {
                        "id": song.id,
                        "name": song.name,
                        "owner": song.owner.name,
                        "owner_id": song.owner.id,
                        "audio": song.audio.url,
                        "visibility": song.visibility,
                        "image": song.img.url,
                        "duration": song.duration,
                    }
                    for song in playlist.songs.all()
                ],
            }
            for playlist in playlists
        }

        return JsonResponse({"playlists": data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def add_song_to_playlist(request):
    playlist_id = request.POST.get("playlist_id")
    song_id = request.POST.get("song_id")

    if not playlist_id or not song_id:
        return JsonResponse({"error": "playlist_id or song_id is missing"}, status=400)

    try:
        playlist = Playlist.objects.get(id=playlist_id)
        song = Song.objects.get(id=song_id)
    except Playlist.DoesNotExist:
        return JsonResponse({"error": "Playlist not found"}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({"error": "Song not found"}, status=404)

    playlist.songs.add(song)

    return JsonResponse({"message": "Successfully added to playlist"})


def remove_song_from_playlist(request):
    playlist_id = request.POST.get("playlist_id")
    song_id = request.POST.get("song_id")

    if not playlist_id or not song_id:
        return JsonResponse({"error": "playlist_id or song_id is missing"}, status=400)

    try:
        playlist = Playlist.objects.get(id=playlist_id)
        song = Song.objects.get(id=song_id)
    except Playlist.DoesNotExist:
        return JsonResponse({"error": "Playlist not found"}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({"error": "Song not found"}, status=404)

    playlist.songs.remove(song)

    return JsonResponse({"message": "Successfully removed from playlist"})


def add_song_to_favorites(request):
    user_id = request.POST.get("user_id")
    song_id = request.POST.get("song_id")

    if not user_id or not song_id:
        return JsonResponse({"error": "user_id or song_id is missing"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        song = Song.objects.get(id=song_id)
    except user.DoesNotExist:
        return JsonResponse({"error": "user_id not found"}, status=404)
    except song.DoesNotExist:
        return JsonResponse({"error": "song_id not found"}, status=404)

    user.favorites.add(song)

    return JsonResponse({"message": "Successfully added to favorites"})


def get_user_favorites(request):
    if request.method == "GET":
        user_id = request.GET.get("id")
        if not user_id:
            return JsonResponse({"error": "Missing user ID."}, status=400)

        try:
            user = User.objects.get(id=user_id)

            songs = user.favorites.all()

            songs_data = []

            for song in songs:
                duration = None
                try:
                    # Use mutagen to open the audio file by its path
                    audio_file_path = song.audio.path  # get file path on disk
                    audio = mutagen.File(audio_file_path)
                    if audio and audio.info:
                        # duration in seconds (float)
                        duration = audio.info.length
                except Exception as e:
                    # Could not read duration, log or ignore
                    print(f"Error getting duration for song {song.id}: {e}")

                songs_data.append(
                    {
                        "id": song.id,
                        "name": song.name,
                        "owner": song.owner.id if song.owner else None,
                        "visibility": song.visibility,
                        "img": song.img.url if song.img else None,
                        "audio": song.audio.url if song.audio else None,
                        "duration": duration,  # add duration here
                        "owner_name": song.owner.name,
                        'owner_id': song.owner.id
                    }
                )

            return JsonResponse({"songs": songs_data})

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

    return JsonResponse({"error": "Invalid request method."}, status=405)


def remove_song_from_favorites(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    user_id = request.POST.get("user_id")
    song_id = request.POST.get("song_id")

    if not user_id or not song_id:
        return JsonResponse({"error": "Missing user_id or song_id"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        song = Song.objects.get(id=song_id)
        user.favorites.remove(song)
        return JsonResponse({"message": "Successfully removed song from favorites"})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({"error": "Song not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_all_users(request):
    users = User.objects.all()
    data = [
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "about": user.about,
            "avatar": user.avatar.url if user.avatar else None,
        }
        for user in users
    ]
    return JsonResponse({"users": data})


def toggle_follow(request):
    follow_id = request.POST.get("follow_id")
    user_id = request.POST.get("user_id")

    if not follow_id or not user_id:
        return JsonResponse({"error": "Missing user_id or follow_id"}, status=400)

    user = User.objects.get(id=user_id)
    follow_user = User.objects.get(id=follow_id)

    if follow_user in user.following.all():
        user.following.remove(follow_user)
        action = "unfollowed"
        follow_user.followers.remove(user_id)

    else:
        user.following.add(follow_user)
        action = "followed"
        follow_user.followers.add(user_id)

    return JsonResponse(
        {
            "status": "success",
            "action": action,
            "followed_user_id": follow_id,
            "current_following_count": user.following.count(),
        }
    )


def is_following(request):
    follow_id = request.POST.get("follow_id")
    user_id = request.POST.get("user_id")

    if not follow_id or not user_id:
        return JsonResponse({"error": "Missing user_id or follow_id"}, status=400)

    user = User.objects.get(id=user_id)
    follow_user = User.objects.get(id=follow_id)

    if follow_user in user.following.all():
        return JsonResponse(
            {
                "status": "following",
            }
        )

    return JsonResponse(
        {
            "status": "not following",
        }
    )


def get_user_followers(request):
    user_id = request.GET.get("id")

    user = User.objects.get(id=user_id)

    followers = user.followers.all()

    return JsonResponse({"followers_count": followers.count()})


def recently_liked(request):
    user_id = request.GET.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    # Reverse to get most recent at the top
    favorites = list(user.favorites.all())
    favorites = favorites[:10]  # Take only the latest 10

    data = []

    for fav in favorites:
        data.append(
            {
                "id": fav.id,
                "name": fav.name,
                "owner": fav.owner.id if fav.owner else None,
                "owner_name": fav.owner.name if fav.owner else None,
                "img": fav.img.url if fav.img else None,
                "audio": fav.audio.url,
                "duration": fav.duration,
            }
        )

    return JsonResponse({"recently_liked": data})


def get_users_following(request):
    user_id = request.GET.get("id")

    try:
        user = User.objects.get(id=user_id)

        following = user.following.all()

        followingArray = []

        for f in following:
            followingArray.append(
                {
                    "id": f.id,
                    "avatar": f.avatar.url,
                    "name": f.name,
                }
            )

        return JsonResponse({"users": followingArray})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def change_music_playing(request):
    userID = request.POST.get("user_id")
    musicID = request.POST.get("music_id")

    if not userID or not musicID:
        return JsonResponse({"error": "Missing user id or music id"})

    user = User.objects.get(id=userID)
    music = Song.objects.get(id=musicID)

    user.playing_music = music

    user.save()

    return JsonResponse(
        {"message": "Successfully changed playing music in the database"}
    )


def set_playlist_index(request):
    id = request.POST.get("id")
    amount = request.POST.get("amount")

    if not id or not amount:
        return JsonResponse({"error": "User ID missing or amount is missing"})

    user = User.objects.get(id=id)

    user.playing_list_music_id = amount

    user.save()

    return JsonResponse({"message": "Succesfully setted the value to"})


def get_all_songs(request):
    try:
        songs = Song.objects.all()
        songs_array = []

        for song in songs:
            if song.visibility == True:
                songs_array.append(
                    {
                        "id": song.id,
                        "name": song.name,
                        "img": song.img.url if song.img else "",
                        "audio": song.audio.url if song.audio else "",
                        "visibility": song.visibility,
                        "duration": song.duration,
                        "owner": song.owner.id,
                        "owner_name": song.owner.name,
                    }
                )

        return JsonResponse({"songs": songs_array})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_all_playlists(request):
    playlists = Playlist.objects.all()
    playlist_array = []

    for pl in playlists:
        if pl.visibility is True:
            raw_songs = (
                list(pl.songs.values()) if hasattr(
                    pl.songs, "values") else pl.songs
            )

            modified_songs = []
            for song in raw_songs:
                if isinstance(song, dict):
                    song_id = song.get("id")
                    try:
                        song_obj = Song.objects.get(id=song_id)
                        song["image"] = song_obj.img.url if song_obj.img else None
                        song["owner"] = song_obj.owner.name
                        # ✅ added this line
                        song["audio"] = song_obj.audio.url if song_obj.audio else None
                    except Song.DoesNotExist:
                        song["image"] = song.get("img")
                        song["owner"] = None
                        song["audio"] = None
                    modified_songs.append(song)
                else:
                    modified_songs.append(song)

            playlist_array.append(
                {
                    "owner": str(pl.owner.id),
                    "name": pl.name,
                    "img": pl.img.url if pl.img else None,
                    "songs": modified_songs,
                    "visibility": pl.visibility,
                    "id": pl.id,
                    "owner_name": pl.owner.name,
                }
            )

    return JsonResponse({"playlists": playlist_array})


def add_existing_playlist(request):
    if request.method == "POST":
        playlist_id = request.POST.get("playlist_id")
        user_id = request.POST.get("user_id")

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            user = User.objects.get(id=user_id)

            user.playlists.add(playlist)  #
            return JsonResponse({"message": "Playlist added successfully"})
        except Playlist.DoesNotExist:
            return JsonResponse({"error": "Playlist not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=400)


def remove_existing_playlist(request):
    if request.method == "POST":
        playlist_id = request.POST.get("playlist_id")
        user_id = request.POST.get("user_id")

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            user = User.objects.get(id=user_id)

            user.playlists.remove(playlist)  #
            return JsonResponse({"message": "Playlist added successfully"})
        except Playlist.DoesNotExist:
            return JsonResponse({"error": "Playlist not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=400)


def is_existing_exist_on_me(request):
    if request.method == "POST":
        playlist_id = request.POST.get("playlist_id")
        user_id = request.POST.get("user_id")

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            user = User.objects.get(id=user_id)

            if user.playlists.filter(id=playlist.id).exists():
                return JsonResponse({"message": "Does exist"})
            else:
                return JsonResponse({"message": "Does not exist"})
        except Playlist.DoesNotExist:
            return JsonResponse({"error": "Playlist not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=400)


def load_start_music(request):
    user_id = request.GET.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID"}, status=400)

    try:
        user = User.objects.get(id=user_id)

        # Handle ManyToManyField with songs added
        playing_list = (
            [
                {
                    "id": pl.id,
                    "name": pl.name,
                    "img": pl.img.url if pl.img else None,
                    "owner": pl.owner.id,
                    "songs": [
                        {
                            "id": song.id,
                            "name": song.name,
                            "owner": song.owner.name,
                            "owner_id": song.owner.id,
                            "audio": song.audio.url if song.audio else None,
                            "image": song.img.url if song.img else None,
                            "duration": song.duration,
                        }
                        for song in pl.songs.all()
                    ],
                }
                for pl in user.playing_list.all()
            ]
            if user.playing_list.exists()
            else []
        )

        # Handle playing_music safely
        if user.playing_music:
            playing_music = {
                "id": user.playing_music.id,
                "name": user.playing_music.name,
                "owner": user.playing_music.owner.name,
                "owner_id": user.playing_music.owner.id,
                "audio": (
                    user.playing_music.audio.url if user.playing_music.audio else None
                ),
                "image": user.playing_music.img.url if user.playing_music.img else None,
                "duration": user.playing_music.duration,
            }
        else:
            playing_music = None

        return JsonResponse(
            {
                "playing_music": playing_music,
                "playing_list_music_id": user.playing_list_music_id,
                "playing_list": playing_list,
            }
        )

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


def set_playing_list(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    user_id = request.POST.get("user_id")
    playlist_id = request.POST.get("playlist_id")

    if not user_id or not playlist_id:
        return JsonResponse({"error": "Missing required fields"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        playlist = Playlist.objects.get(id=playlist_id)

        # If playing_list is ManyToManyField
        # Replace previous, or use .add() if you want to keep existing
        user.playing_list.set([playlist])

        user.save()

        return JsonResponse({"message": "Successfully set in database"})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Playlist.DoesNotExist:
        return JsonResponse({"error": "Playlist not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_playlist(request):
    playlist_id = request.GET.get("id")
    playlist = Playlist.objects.get(id=playlist_id)

    playlist_data = {
        "id": playlist.id,
        "owner_name": playlist.owner.name,
        "owner": playlist.owner.id,
        "name": playlist.name,
        "image": playlist.img.url if playlist.img else None,
        "visibility": playlist.visibility,
    }

    # Serialize all songs related to this playlist
    songs_data = []
    for song in playlist.songs.all():
        songs_data.append(
            {
                "id": song.id,
                "owner_id": song.owner.id,
                "owner": song.owner.name,
                "owner_name": song.owner.name,
                "image": song.img.url if song.img else None,
                "audio": song.audio.url if song.audio else None,
                "name": song.name,
                "visibility": song.visibility,
                "duration": song.duration,
            }
        )

    playlist_data["songs"] = songs_data

    return JsonResponse(playlist_data)


def add_artist_as_playlist(request):
    try:
        artist_id = request.POST.get("artist_id")
        user_id = request.POST.get("user_id")

        if not artist_id or not user_id:
            return JsonResponse(
                {"success": False, "error": "Missing artist_id or user_id"}, status=400
            )

        artist = get_object_or_404(User, id=artist_id)
        user = get_object_or_404(User, id=user_id)

        # Create or fetch playlist
        created_playlist, created = Playlist.objects.get_or_create(
            owner=artist,
            name=artist.name,
            defaults={
                "img": artist.avatar,
                "visibility": True,
            },
        )

        # Add artist's songs to playlist
        artist_songs = Song.objects.filter(owner=artist, visibility=True)

        created_playlist.songs.set(artist_songs)

        # Update if already exists
        if not created:
            created_playlist.img = artist.avatar
            created_playlist.visibility = False
            created_playlist.save()
            if created_playlist not in user.playlists.all():
                user.playlists.add(created_playlist)
            message = "Playlist fetched and updated"
        else:
            created_playlist.save()
            user.playlists.add(created_playlist)
            message = "Playlist created"

        # ✅ Build the response data with the required structure
        playlist_data = {
            "id": created_playlist.id,
            "img": created_playlist.img.url if created_playlist.img else "",
            "name": created_playlist.name,
            "owner": created_playlist.owner.id,
            "owner_name": created_playlist.owner.username,
            'visibility': False,
            "songs": [
                {
                    "id": song.id,
                    "name": song.name,
                    "owner": song.owner.username,
                    "owner_id": song.owner.id,
                    "audio": song.audio.url if song.audio else "",
                    # Add more fields if needed
                }
                for song in created_playlist.songs.all()
            ],
        }

        return JsonResponse(
            {"success": True, "playlist": playlist_data, 'playlist' "message": message, 'playlist_id': created_playlist.id}
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


def remove_artist_as_playlist(request):
    playlist_id = request.POST.get("playlist_id")
    user_id = request.POST.get("user_id")

    if not playlist_id or not user_id:
        return JsonResponse(
            {"success": False, "error": "Missing playlist_id or user_id"}, status=400
        )

    user = get_object_or_404(User, id=user_id)
    playlist = get_object_or_404(Playlist, id=playlist_id)

    if user.playlists.filter(id=playlist.id).exists():
        user.playlists.remove(playlist)
        return JsonResponse({"success": True, "playlist_id": playlist.id})
    else:
        return JsonResponse(
            {"success": False, "error": "Playlist not found in user's playlists"},
            status=404,
        )


def does_it_have_artist(request):
    user_id = request.POST.get("user_id")
    artist_id = request.POST.get("artist_id")

    if not user_id or not artist_id:
        return JsonResponse(
            {"success": False, "error": "Missing user_id or artist_id"}, status=400
        )

    user = get_object_or_404(User, id=user_id)
    artist = get_object_or_404(User, id=artist_id)

    # Debug print all playlists for the user
    print(f"User {user.id} playlists:")
    for pl in user.playlists.all():
        print(
            f"  Playlist id: {pl.id}, name: '{pl.name}', img: '{pl.img}', type(img): {type(pl.img)}")

    print(f"Artist avatar: '{artist.avatar}', type: {type(artist.avatar)}")

    playlist = None

    if user.id == artist.id:
        # Try to find by exact or case-insensitive name first
        playlist = user.playlists.filter(name__iexact=artist.name).first()

        if not playlist:
            # If no match by name, try filtering by img field carefully
            # Assuming img and avatar are FileField/ImageField, compare by file name
            avatar_name = getattr(artist.avatar, 'name', None)
            if avatar_name:
                playlist = user.playlists.filter(img=avatar_name).first()
    else:
        # When user and artist differ, try both filters
        avatar_name = getattr(artist.avatar, 'name', None)
        if avatar_name:
            playlist = user.playlists.filter(
                img=avatar_name, name=artist.name).first()
        else:
            # fallback if avatar_name is not available
            playlist = user.playlists.filter(name=artist.name).first()

    if playlist:
        return JsonResponse(
            {"success": True, "has_playlist": True, "playlist_id": playlist.id}
        )
    else:
        return JsonResponse({"success": True, "has_playlist": False, "playlist_id": None})


def get_random_list(request):
    songs = Song.objects.filter(visibility=True)
    random_songs = random.sample(list(songs), min(len(songs), 6))

    songs_array = []

    for song in random_songs:
        if song.visibility == True:
            songs_array.append(
                {
                    "id": song.id,
                    "name": song.name,
                    "image": song.img.url if song.img else "",
                    "audio": song.audio.url if song.audio else "",
                    "visibility": song.visibility,
                    "duration": song.duration,
                    "owner": song.owner.name,
                    "owner_id": song.owner.id,
                }
            )

    return JsonResponse(songs_array, safe=False)


def get_user_notifications(request):
    user_id = request.GET.get("id")

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    notifications = Notification.objects.filter(
        owner=user).select_related("song")

    data = []
    for n in notifications:
        data.append(
            {
                "id": n.id,
                "title": n.title,
                "image": n.image.url if n.image else None,
                "is_read": n.is_read,
                "created_at": n.created_at,
                "song": (
                    {
                        "id": n.song.id,
                        "name": n.song.name,
                        "image": n.song.img.url if n.song and n.song.img else None,
                        "audio": n.song.audio.url,
                        "visibility": n.song.visibility,
                        "duration": n.song.duration,
                        "owner_id": n.artist.id,
                        "owner": n.artist.name,
                        "owner_data": {
                            "id": n.artist.id,
                            "name": n.artist.name,
                            "avatar": n.artist.avatar.url,
                        },
                    }
                    if n.song
                    else None
                ),

                "playlist": (
                    {
                        'id': n.playlist.id,
                        "owner": n.playlist.owner.name,
                        "name": n.playlist.name,
                        "image": n.playlist.img.url if n.playlist and n.playlist.img else None,
                        "visibility": n.playlist.visibility,
                        "owner_id": n.playlist.owner.id,
                        "owner_data": {
                            "id": n.artist.id,
                            "name": n.artist.name,
                            "avatar": n.artist.avatar.url,
                        },

                        "songs": [
                            {
                                "id": song.id,
                                "name": song.name,
                                "image": song.img.url if song.img else None,
                                "audio": song.audio.url if song.audio else None,
                                "visibility": song.visibility,
                                'duration': song.duration,
                                'owner': song.owner.name,
                                'owner_id': song.owner.id,
                            }
                            # if it's a queryset
                            for song in n.playlist.songs.all()
                        ]
                    }
                    if n.playlist
                    else None
                ),
            }
        )

    return JsonResponse({"notifications": data})


def remove_user_notifications(request):
    user_id = request.GET.get("id")

    user = User.objects.get(id=user_id)

    notifcations = Notification.objects.filter(owner=user)

    notifcations.delete()

    return JsonResponse({"msg": "Successfully deleted the notifcations"})


def add_recently_played(request):
    user_id = request.POST.get('user_id')
    song_id = request.POST.get('song_id')

    try:
        user = User.objects.get(id=user_id)
        song = Song.objects.get(id=song_id)

        # Delete any existing entry
        RecentlyPlayed.objects.filter(user=user, song=song).delete()

        # Create new (most recent)
        RecentlyPlayed.objects.create(user=user, song=song)

        # Keep only 10 most recent
        recent_entries = RecentlyPlayed.objects.filter(
            user=user).order_by('-created_at')
        if recent_entries.count() > 10:
            # Skip first 10, delete the rest
            for old_entry in recent_entries[10:]:
                old_entry.delete()

        return JsonResponse({'status': 'success'})

    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Song not found'}, status=404)


def return_recently_played(request):
    user_id = request.GET.get('id')

    if not user_id:
        return JsonResponse({'error': 'User ID missing!'}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found!'}, status=404)

    # Get recent songs ordered by created_at DESC
    recent_entries = RecentlyPlayed.objects.filter(
        user=user).select_related('song').order_by('-created_at')

    songs_array = []
    for entry in recent_entries:
        song = entry.song
        if song.visibility:
            songs_array.append({
                "id": song.id,
                "name": song.name,
                "image": song.img.url if song.img else None,
                "audio": song.audio.url if song.audio else None,
                "visibility": song.visibility,
                'duration': song.duration,
                'owner': song.owner.name if song.owner else None,
                'owner_id': song.owner.id if song.owner else None,
                'user': {
                    'name': song.owner.name if song.owner else None,
                    'id': song.owner.id if song.owner else None
                }
            })

    return JsonResponse({'songs': songs_array})
