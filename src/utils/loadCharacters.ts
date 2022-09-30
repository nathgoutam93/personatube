import { BaseDirectory, readDir, readTextFile, exists, createDir } from "@tauri-apps/api/fs"
import assert from "assert";
import { Character } from "../types";

export default async function loadCharacters(){

    const res : Character[] = [];

    const isDir = await exists("data/characters", {dir: BaseDirectory.App}) as unknown as boolean
    
    if(!isDir){
      await createDir("data/assets", { dir: BaseDirectory.App, recursive: true });
      await createDir("data/characters", {
        dir: BaseDirectory.App,
        recursive: true,
      });
      return res;
    } 

    const characters = await readDir("data/characters", {
      dir: BaseDirectory.App,
    });

    for (const character of characters) {
      const contents = await readTextFile(`data/characters/${character.name}`, {
        dir: BaseDirectory.App,
      });
      const characterData = JSON.parse(contents);
      res.push(characterData)
    }

    return res
};