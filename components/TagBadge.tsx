import { Tag } from '@/types';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export default function TagBadge({ tag, onClick, removable, onRemove }: TagBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        transition-all
        ${onClick ? 'cursor-pointer hover:opacity-80 hover:scale-105' : ''}
      `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: tag.color,
        borderWidth: '1px',
      }}
    >
      <span className="select-none">{tag.name}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-white/30 rounded-full w-3 h-3 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </span>
  );
}
