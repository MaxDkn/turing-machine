import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableElement, DroppableCell } from "./drag_and_drop";
import { useMachineStore } from "@/store/machine"; 


type CellButtonProps = {
  text: string;
  onClick: () => void;
  isActive: boolean;
};

function CellButton({ text, onClick, isActive }: CellButtonProps) {
  const activeClass = isActive
    ? "bg-blue-600 text-white"
    : "bg-gray-200 text-gray-700 hover:bg-gray-300";
  
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs font-semibold ${activeClass}`}
    >
      {text}
    </button>
  );
}


export default function ControlPanel() {
    const { states, addState, updateTransition } = useMachineStore();
  
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        const activeId = active.id.toString();

        const isOverCell = over && over.id.toString().startsWith("cell-");

        if (activeId.startsWith("source-")) {
            if (isOverCell) {
                const overId = over.id.toString();
                const [, targetStateName, targetIndexStr] = overId.split("-");
                const targetIndex = parseInt(targetIndexStr, 10);
                const droppedContentId = activeId.replace("source-", "");
                
                updateTransition(targetStateName, targetIndex, { next: droppedContentId });
            }
            return;
        }
    
        if (activeId.startsWith("item-")) {
        const [, sourceStateName, sourceIndexStr, content] = activeId.split("-");
        const sourceIndex = parseInt(sourceIndexStr, 10);

        if (isOverCell) {
            const overId = over.id.toString();
            const [, targetStateName, targetIndexStr] = overId.split("-");
            const targetIndex = parseInt(targetIndexStr, 10);
            
            if (sourceStateName === targetStateName && sourceIndex === targetIndex) {
            return;
            }

            updateTransition(sourceStateName, sourceIndex, { next: null });
            updateTransition(targetStateName, targetIndex, { next: content });
        } else {
            updateTransition(sourceStateName, sourceIndex, { next: null });
        }
        }
    }

    const getStateColor = (id: string | null) => {
        if (id === "stop") return "#f87171"; // Rouge pour STOP
        if (id && states.some(s => s.name === id)) return "#0000ff"; // Bleu
        return "#ccc";
    };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="w-full p-4 bg-gray-100">
        <div className="top-controls sticky top-0 z-[1500] p-2 flex justify-between items-center bg-[#f9f9f9] border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white border border-blue-500 hover:bg-blue-600">
              <img src="green_flag.svg" className="w-4 h-4" />
              Lancer le script
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DraggableElement id="source-stop" text="STOP" color="#f87171" />    
            <button
              onClick={addState}
              className="px-3 py-1 bg-blue-500 text-white rounded border border-blue-500 hover:bg-blue-600"
            >
              + Ajouter un état
            </button>
          </div>
        </div>

        <div className="table-container p-3">
          <table className="w-full border-collapse text-[12px] mt-3 table-fixed">
            <thead className="bg-[#eee] sticky top-[44px] z-[2]">
              <tr className="text-blue-600">
                <th className="border border-[#ccc] p-1">État</th>
                <th className="border border-[#ccc] p-1">Lire</th>
                <th className="border border-[#ccc] p-1">Écrire</th>
                <th className="border border-[#ccc] p-1">Mouvement</th>
                <th className="border border-[#ccc] p-1">Aller vers</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state) => (
                state.transitions.map((transition, index) => {
                  const cellId = `cell-${state.name}-${index}`;
                  const contentId = transition.next;

                  return (
                    <tr key={cellId}>
                      {index === 0 && (
                        <td
                          className="border border-[#ccc] p-1 align-top"
                          rowSpan={state.transitions.length}
                        >
                          <DraggableElement
                            id={`source-${state.name}`}
                            text={state.name}
                            color="#0000ff"
                          />
                        </td>
                      )}
                      
                      <td className="border border-[#ccc] p-1 text-[#0000ff] text-center font-bold">
                        {transition.read}
                      </td>

                      <td className="border border-[#ccc] p-1 text-center">
                        <div className="flex justify-center gap-1">
                          {(["b", "0", "1"] as const).map((val) => (
                            <CellButton
                              key={val}
                              text={val}
                              isActive={transition.write === val}
                              onClick={() =>
                                updateTransition(state.name, index, { write: val })
                              }
                            />
                          ))}
                        </div>
                      </td>

                      <td className="border border-[#ccc] p-1 text-center">
                         <div className="flex justify-center gap-1">
                          {(["l", "r"] as const).map((val) => (
                            <CellButton
                              key={val}
                              text={val === "l" ? "←" : "→"}
                              isActive={transition.move === val}
                              onClick={() =>
                                updateTransition(state.name, index, { move: val })
                              }
                            />
                          ))}
                         </div>
                      </td>

                      <DroppableCell id={cellId}>
                        {contentId && (
                          <DraggableElement
                            id={`item-${state.name}-${index}-${contentId}`}
                            text={contentId === "stop" ? "STOP" : contentId}
                            color={getStateColor(contentId)}
                          />
                        )}
                      </DroppableCell>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DndContext>
  );
}