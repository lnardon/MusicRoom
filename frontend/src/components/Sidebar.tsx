import { Home, Search, Settings, BarChart2, ListMusicIcon } from "lucide-react";
import { useChangeView } from "../utils/hooks";

export default function Sidebar({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) {
  const handleViewUpdate = useChangeView();

  const options = [
    { title: "Home", icon: Home },
    { title: "Search", icon: Search },
    { title: "Playlists", icon: ListMusicIcon },
    { title: "Stats", icon: BarChart2 },
    { title: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-[#131313] flex flex-col items-start px-4 py-8">
      <h1 className="mb-8 leading-[3rem] font-black text-4xl border-l-4 border-[#ffd000] pl-3 rounded-lg text-white">
        Music
      </h1>

      {options.map(({ title, icon: Icon }) => {
        const lower = title.toLowerCase();
        const active = currentView === lower;

        return (
          <div
            key={title}
            onClick={() => {
              setCurrentView(lower);
              handleViewUpdate(lower);
            }}
            className={`
              w-full flex items-center gap-2 rounded 
              transition-all duration-300 mb-1 px-1 py-2 cursor-pointer
              ${active ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"}
            `}
          >
            <Icon size={22} color={active ? "#ffd000" : "white"} />
            <span
              className={`text-base ${
                active ? "font-bold text-[#ffd000]" : "font-normal text-white"
              }`}
            >
              {title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
