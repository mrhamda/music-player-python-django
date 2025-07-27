"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { useProjectContext } from "../context/ProjectContext";

export function AudioPlayer() {
  const [currentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const hasLoaded = useRef(false);

  const {
    setCurrentPageData,
    musicPlaying,
    user,
    playing,
    setPlaying,
    musicListPlaying,
    currentListIndexMusic,
    setMusicPlaying,
    setCurrentListIndexMusic,
    setNewList,
    addRecentlySong,
    currentPageData,
    setMusicListPlaying,
  } = useProjectContext();

  const audioRef = useRef<HTMLAudioElement>(null);

  function setMusicPlayingInDatabase() {
    localStorage.setItem(
      `music_playing_${user?.id}`,
      JSON.stringify(musicPlaying)
    );
  }

  async function loadStartMusic() {
    const music_playing = JSON.parse(
      (localStorage as any).getItem(`music_playing_${user?.id}`)
    );

    const list_playing = JSON.parse(
      (localStorage as any).getItem(`music_list_${user?.id}`)
    );

    const current_index = JSON.parse(
      (localStorage as any).getItem(`current_index_${user?.id}`)
    );

    if (music_playing !== null) {
      setMusicPlaying(music_playing);
    }

    if (list_playing !== null) {
      setMusicListPlaying(list_playing);
    }

    if (current_index !== null) {
      setCurrentListIndexMusic(current_index);
    }

    setIsPlaying(false);
    setPlaying(() => false);
    console.log("music_playing load", music_playing);
  }

  useEffect(() => {
    if (!hasLoaded.current && user !== null) {
      hasLoaded.current = true;
      loadStartMusic();
    }
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    setTimeout(() => {
      setPlaying(() => false);
      setIsPlaying(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (user !== null) {
      if (audioRef.current) {
        isPlaying ? audioRef.current.play() : audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, user]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  useEffect(() => {
    console.log(musicPlaying);
    if (user !== null) {
      setMusicPlayingInDatabase();
      audioRef.current!.play();
      setIsPlaying(true);

      addRecentlySong(user!.id, (musicPlaying as any).id);
    }

    if (
      currentPageData[0] &&
      currentPageData[0].target == "musicsingle" &&
      currentPageData[0].id !== musicPlaying.id
    ) {
      setCurrentPageData([
        {
          target: "musicsingle",
          song: { ...musicPlaying },
          user: { name: musicPlaying.owner, id: musicPlaying.owner_id },
        },
      ]);
    }

    console.log("CURRENT MUSIC PLAYING", musicPlaying);
  }, [musicPlaying]);

  useEffect(() => {
    if (
      musicListPlaying !== null &&
      musicListPlaying.length > 0 &&
      user !== null
    ) {
      const rmvTypeCheckSong: any = (musicListPlaying as any).songs[
        currentListIndexMusic
      ];

      setCurrentListIndexMusic(() => 0);

      setMusicPlaying(rmvTypeCheckSong);
      setIsPlaying(true);
      setPlaying(() => true);
    }

    console.log("MUSIC LIST PLAYING");

    console.log(musicListPlaying);
  }, [musicListPlaying]);

  useEffect(() => {
    const songsArray = Array.isArray(musicListPlaying)
      ? musicListPlaying
      : (musicListPlaying as any)?.songs || [];

    if (songsArray.length > 0 && user !== null) {
      const rmvTypeCheckSong: any = (musicListPlaying as any).songs[
        currentListIndexMusic
      ];

      setMusicPlaying(rmvTypeCheckSong);
      setIsPlaying(true);
      setPlaying(() => true);
    }

    console.log("MUSIC SONG SETTED");

    console.log(currentListIndexMusic);
  }, [currentListIndexMusic]);


  useEffect(() => {

    console.log("CURRENT MUSIC PLAYING MEE", console.log(musicPlaying))

  }, [musicPlaying])

  useEffect(() => {
    if (user !== null) {
      if (audioRef.current) {
        if (playing) {
          audioRef.current!.play();
          setIsPlaying(true);
        } else {
          audioRef.current!.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [playing]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  async function fetchUser(id: number) {
    try {
      const res = await fetch(`/api/get-user/?id=${id}`);

      const resJson = await res.json();

      if (resJson.error) {
        console.log(resJson.error);
      }

      return resJson.user;
    } catch (e) {
      console.log(e);
    }
  }

  const nextTrack = () => {
    const songs = Array.isArray(musicListPlaying)
      ? musicListPlaying
      : (musicListPlaying as any)?.songs;

    console.log("SONGS", songs);
    console.log("EXCUTING NEXT");

    if (currentListIndexMusic < songs.length - 1) {
      setCurrentListIndexMusic((prev) => prev + 1);
    } else {
      setNewList();
      console.log("SETTING LIST");
    }
  };

  const prevTrack = () => {
    const songs = Array.isArray(musicListPlaying)
      ? musicListPlaying
      : (musicListPlaying as any)?.songs;

    if (!songs || songs.length === 0) return;

    if (currentListIndexMusic > 0) {
      setCurrentListIndexMusic((prev) => prev - 1);
    }
  };

  const formatTime = (time: number) =>
    isNaN(time)
      ? "0:00"
      : `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(
          2,
          "0"
        )}`;

  // FIX CLICKING ON MUSIC

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white px-15 py-2 shadow-xl z-50">
      {musicPlaying && (
        <>
          <audio
            ref={audioRef}
            src={musicPlaying.audio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={nextTrack}
          />

          {/* Container */}
          <div className="flex flex-col items-center gap-4 md:gap-6 md:items-center">
            {/* Combine Image + Song Info + Controls side by side */}
            <div className="flex items-center gap-6 cursor-pointer">
              {/* Profile Image + Song Info */}
              <div className="flex items-center gap-3">
                <img
                  src={musicPlaying.image}
                  alt={musicPlaying.name}
                  className="w-14 h-14 rounded-md object-cover"
                  onClick={async () => {
                    const user = await fetchUser(musicPlaying.owner_id);

                    if (user !== null) {
                      setCurrentPageData([
                        {
                          target: "musicsingle",
                          song: musicPlaying,
                          user: user,
                        },
                      ]);
                    }
                  }}
                />
                <div
                  onClick={async () => {
                    const user = await fetchUser(musicPlaying.owner_id);

                    if (user !== null) {
                      setCurrentPageData([
                        {
                          target: "musicsingle",
                          song: musicPlaying,
                          user: user,
                        },
                      ]);
                    }
                  }}
                  className="text-center"
                >
                  <div className="text-sm font-semibold">
                    {musicPlaying.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {musicPlaying.owner}
                  </div>
                </div>
              </div>

              {/* Controls (play, prev, next) */}
              <div className="flex justify-center items-center gap-5 text-lg ">
                <button onClick={prevTrack}>
                  <FontAwesomeIcon icon={faBackward} />
                </button>
                <button
                  onClick={() => {
                    setIsPlaying((prev) => !prev);
                    setPlaying((prev) => !prev);
                  }}
                >
                  <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </button>
                <button onClick={nextTrack}>
                  <FontAwesomeIcon icon={faForward} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4 w-full max-w-lg mt-4">
              {/* Current time */}
              <span className="text-xs w-10">{formatTime(currentTime)}</span>

              {/* Playing progress slider */}
              <input
                type="range"
                className="flex-1 h-1 accent-green-500"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
              />

              {/* Duration */}
              <span className="text-xs w-10 text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume control on separate line */}
            <div className="flex items-center gap-2 w-full max-w-lg mt-2">
              <FontAwesomeIcon icon={faVolumeUp} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-green-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
