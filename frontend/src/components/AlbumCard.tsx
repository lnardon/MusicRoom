import { Album } from "@/types";
import { HandleFallbackImage } from "@/utils/helpers";

const AlbumCard = ({
  album,
  onClick,
  index,
}: {
  album: Album;
  onClick: () => void;
  index: number;
}) => {
  return (
    <div
      className="w-full p-1 rounded-sm cursor-pointer flex flex-col items-start shadow-md opacity-0 animate-slide-up"
      key={album.id}
      style={{
        animationDelay: `${index * 25}ms`,
      }}
      onClick={onClick}
    >
      {HandleFallbackImage(`/api/getCover?file=${album.id}`, "", null, {
        width: "100%",
        height: "max-content",
        borderRadius: "0.25rem",
        marginBottom: "0.5rem",
      })}
      <p className="w-full text-start text-[1rem] font-medium text-white">
        {album.title}
      </p>
    </div>
  );
};

export default AlbumCard;
