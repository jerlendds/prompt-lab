import { FolderIcon } from "./icons/Icons.jsx"
import chevron from "../assets/chevron-down.svg"
export default function Folder(props) {
  let folder = props.folder
  return (
    <li >
      <a className="flex w-full pl-1.5 items-center justify-between" onClick={() => props.onClick()}>
        
        <span className="mr-auto flex items-center">{props?.icon && props.icon}{folder}</span>
        {props?.showFolder && <FolderIcon />}
      </a>
    </li>
  )
}
