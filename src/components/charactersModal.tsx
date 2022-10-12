import { BsPlusSquareDotted } from "react-icons/bs";
import { Character } from "../types";
import CharacterSelect from "./characterSelect";

type Props = {
  characters: Character[];
  onSelect: (Character: Character) => void;
  onNewCharacter: () => void;
  onClose: () => void;
};

function CharactersModal({
  characters,
  onSelect,
  onNewCharacter,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40"
      onClick={() => onClose()}
    >
      <div
        className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 max-h-96 p-4 grid grid-cols-4 gap-2 bg-white rounded-3xl overflow-y-scroll`}
      >
        <button
          className="relative w-40 h-40 p-4 rounded-3xl border bg-pastel-blue cursor-pointer"
          onClick={() => onNewCharacter()}
        >
          <BsPlusSquareDotted className="w-full h-full" />
        </button>
        {characters.map((character) => {
          return (
            <CharacterSelect
              key={character.name}
              character={character}
              onSelect={() => onSelect(character)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CharactersModal;
