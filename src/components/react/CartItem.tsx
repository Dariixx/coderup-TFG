import { formatPrice } from "../../lib/utils";
import type { CartItem as CartItemType } from "../../lib/types";

interface Props {
  item: CartItemType;
  onRemove: (slug: string) => void;
}

export default function CartItem({ item, onRemove }: Props) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
      <a
        href={`/cursos/${item.slug}`}
        className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} rounded-xl flex items-center justify-center shrink-0 overflow-hidden`}
      >
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <svg className={`w-10 h-10 ${item.iconColor} opacity-70`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </a>

      <div className="flex-1 min-w-0">
        <a href={`/cursos/${item.slug}`} className="text-white font-bold hover:text-[#00FF66] transition block truncate">
          {item.title}
        </a>
        {item.instructorName && <p className="text-[#888] text-sm mt-1">Por {item.instructorName}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-[#00FF66]/10 text-[#00FF66] px-2 py-0.5 rounded-full">{item.category}</span>
          <span className="text-xs bg-[#2A2A2A] text-[#E0E0E0] px-2 py-0.5 rounded-full">Premium</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-[#00FF66] font-bold text-lg">{formatPrice(item.price)}</span>
        <button type="button" onClick={() => onRemove(item.slug)} className="text-[#888] hover:text-red-400 transition p-1">
          Eliminar
        </button>
      </div>
    </div>
  );
}

