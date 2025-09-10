import { FolderIcon } from "./icons/Icons.jsx"
export default function Folder(props) {
  let folder = props.folder
  return (
    <li >
      <a className="flex hover:text-drab-50 w-full pl-1 items-center justify-between" onClick={() => props.onClick()}>
        
        <span className="mr-auto flex items-center">{props?.icon && props.icon}{folder}</span>
        {props?.showFolder && <span className="pl-1"><FolderIcon /></span>}
      </a>
    </li>
  )
}
