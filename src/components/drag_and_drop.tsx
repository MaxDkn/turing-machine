import { ReactNode } from "react";
import {useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";

type DragElementProps = {
  id: string;
  text: string;
  color: string;
};

export function DraggableElement({ id, text, color }: DragElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    backgroundColor: color,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border border-gray-500 px-3 py-1 rounded font-bold cursor-grab"
      style={style}
    >
      {text}
    </div>
  );
};


type DropCellProps = {
  id: string;
  children?: ReactNode;
};

export function DroppableCell({ id, children } : DropCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <td
      ref={setNodeRef}
      className={`border p-4 min-w-[60px] ${
        isOver ? "bg-blue-100" : "bg-white"
      }`}
    >
      {children}
    </td>
  );
}
