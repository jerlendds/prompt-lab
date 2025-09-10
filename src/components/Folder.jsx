import { FolderIcon } from "./icons/Icons.jsx"
import chevron from "../assets/chevron-down.svg"
export default function Folder(props) {
  let folder = props.folder
  return (
    <li id={`folder-${folder}`} data-folder-name={folder}>
      <a className="flex w-full items-center justify-between" onClick={() => props.onClick()}>
          {folder}

          {props?.showFolder && <FolderIcon />}
      </a>
    </li>
  )
}
