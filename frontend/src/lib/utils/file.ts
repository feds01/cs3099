import * as LangIcons from 'react-icons/si';
import { IconType } from "react-icons/lib";

export function getExtension(path: string): string | null {
    const components = path.split(".");

    if ( components.length < 2) return null;
    return components[components.length - 1];
}


// The Icon map is a mapping between file extension to the icons that
// are provided in the react-icons folder. 
export const IconMap: {[index: string]: IconType }  = {
    "c": LangIcons.SiC,
    "hs": LangIcons.SiHaskell,
    "js": LangIcons.SiJavascript,
    "java": LangIcons.SiJava,
    "md": LangIcons.SiMarkdown,
    "ts": LangIcons.SiTypescript,
    "py": LangIcons.SiPython,
    "r": LangIcons.SiR,
    "rs": LangIcons.SiRust,
    "v": LangIcons.SiV,
    "json": LangIcons.SiJson,
}
