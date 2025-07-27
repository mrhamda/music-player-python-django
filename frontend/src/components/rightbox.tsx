import { useProjectContext } from "../context/ProjectContext";
import AboutUser from "./aboutUser";
import EditPlaylist from "./editPlaylist";
import EditSong from "./editSong";
import Following from "./following";
import HomeShow from "./homeShow";
import Likes from "./likes";
import MakePlaylist from "./makePlaylist";
import MakeSong from "./makeSong";
import MusicSingle from "./musicSingle";
import Notfications from "./notfications";
import Playlist from "./playlist";
import EditProfile from "./editProfile";


// FIX SERACH AFTER SONGS AND PLAYLIST

// FIX THAT YOU CAN START AUDIO ON PROFILE

// FIX CAN SET AUDIO VIDEO IN MUSIC SINGLE

// FIX NOTIFCATIONS

// FIX AUDIO IN GENERAL

// CLEAN DESIGN

export default function RightBox() {
  const { currentPageData: currentPageDataRaw } = useProjectContext();
  const currentPageData = currentPageDataRaw as any;

  const target =
    Array.isArray(currentPageData) && currentPageData.length > 0
      ? currentPageData[0].target
      : undefined;

  return (
    <div className="min-h-screen w-full dark:bg-gray-700 p-4 overflow-y-auto text-[20px] py-15 pb-25 overflow-x-hidden">
      <div className="p-10 lg:p-20 ">
        <div className="w-[92vw] flex justify-center items-center">
          {target == "musicsingle" && <MusicSingle />}

          {target == "profile" && <AboutUser />}

          {target == "playlist" && <Playlist />}

          {target == "following" && <Following />}

          {target == "likes" && <Likes />}

          {target == "notifcations" && <Notfications />}

          {target == "makeplaylist" && <MakePlaylist />}

          {target == "editplaylist" && <EditPlaylist />}

          {target == "makesong" && <MakeSong />}

          {target == "editsong" && <EditSong />}

          {target == "homeshow" && <HomeShow />}

          {target == null && <HomeShow />}

          {target == "settings" && <EditProfile />}
        </div>
      </div>
    </div>
  );
}
