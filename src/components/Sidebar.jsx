/* eslint-disable react/prop-types */
import i18n from "i18next"
import k from "./../i18n/keys"
import Logo from "./Logo.jsx"
import Folder from "./Folder.jsx"
import FolderModal from "./FolderModal.jsx"
import { getCurrentTimestamp, newBlankPrompt, newFilteredPrompt, uuid } from "./js/utils.js"
import { ArrowNewWindow, Cog, CollectionIcon, EditedIcon, FingerIcon, HeartIcon, HomeIcon, PlusDoc, PlusFolder, PromptIcon, TerminalIcon } from "./icons/Icons.jsx"
import { useState } from "react"
import SettingsModal from "./SettingsModal.jsx"

export default function Sidebar({
  setPrompts,
  setFolders,
  folders,
  filteredPrompts,
  filterPrompts,
  setFilteredPrompts,
  setSelectedFolder,
  selectedFolder,
  filterTags,
  setFilterTags,
  searchTerm,
  setSearchTerm,
  showToast,
}) {
  const t = i18n.t

  const [folderModal, setFolderModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)

  function newPrompt() {
    const folder = selectedFolder
    const promptObj = {
      title: "",
      text: "",
      tags: [],
      folder,
      id: uuid(),
      lastChanged: getCurrentTimestamp(),
      description: "",
    }
    setPrompts(newBlankPrompt(promptObj))
    setFilteredPrompts(newFilteredPrompt(promptObj, filteredPrompts))
    setTimeout(() => {
      const btn = document.querySelector(".edit")
      if (btn) btn.click()
    }, 50)
  }

  const urlParams = new URLSearchParams(window.location.search)
  const isFullScreen = urlParams.get("fullscreen") === "true"

  function openFolderModal() {
    setFolderModal(true)
  }

  function closeFolderModal() {
    setFolderModal(false)
  }

  function openSettings() {
    setSettingsModal(true)
  }

  function selectFolder(name) {
    setSelectedFolder(name)
    filterPrompts(name, filterTags, searchTerm)
    document.querySelectorAll(".folder").forEach(folder => {
      folder.classList.remove("selected")
    })
    document.getElementById(`folder-${name}`).classList.add("selected")
  }

  function openFullscreen() {
    console.log("OPENING!")
    // Create the message object
    var message = { message: "openFullScreen" }

    // Stringify the object to send via postMessage
    var messageString = JSON.stringify(message)

    // Send the message to the parent window
    window.parent.postMessage(messageString, "*")
  }

  return (
    <>
      <div className="z-30 flex !w-[290px] flex-col overflow-hidden h-full text-drab-300 text-[14px]">
        {/* Quick add section */}
        <div className="flex flex-col justify-between h-full border-r border-beaker-800 bg-base-200">
          <div className="px-2 pt-2  pb-3 bg-gradient-to-br from-beaker-500/10 via-cyan-500/2 to-transparent border border-emerald-500/20">
            <div className="text-xs uppercase tracking-widest text-beaker-400/80">Quick Add</div>
            {[{icon: <PromptIcon />, name: "Prompt"},  {icon: <TerminalIcon />, name: "Template"},{icon: <CollectionIcon />, name: "Collection"}].map(({ icon, name}) => (
              <button className="mt-2 w-full rounded-md border border-emerald-400/40 bg-black/40 px-3 py-1.5 text-left text-sm hover:border-beaker-400/70 hover:text-beaker-200 flex items-center">
                {icon}
                {name}
                <span className="font-bold ml-auto">+</span>
              </button>
            ))}
          
          </div>
          <div className="flex grow flex-col overflow-y-auto">
            {/* Smart Lists */}
            <ul className="menu px-2 pt-3 gap-y-1.5 flex flex-col text-base-content sticky">
              <h2 className=" font-body uppercase text-drab-800">Smart Lists</h2>
              {[
                { name: "Favorites", to: "", icon: <HeartIcon /> },
                { name: "Recently Used", to: "", icon: <FingerIcon /> },
                { name: "Latest Edits", to: "", icon: <EditedIcon />  },
              ].map(({ name, to, icon }) => (
                <>
                  <Folder id={name} key={name} folder={name} onClick={() => selectFolder(name)} icon={<span className="ml-auto">{icon}</span>} />
                  
                </>
              ))}
            </ul>
            {/* Prompt Tags */}
            <ul className="menu px-2 pt-6 text-base-content sticky">
              <h2 className=" font-body uppercase text-drab-800">Tags</h2>
              <div className=" gap-2 grid grid-cols-2 row-auto">
                {["All", "Research", "Coding", "Writing", "CLI", "Data Viz"].map(tag => (
                  <button className="bg-dark-800 rounded py-px">{tag}
                  </button>
                ))}
              </div>
            </ul>
            {/* Folders */}
            <ul className="menu px-2 pt-6 text-base-content sticky">
              <h2 className=" font-body uppercase text-drab-800">Collections</h2>
              {folders.map(folder => (
                <Folder
                  showFolder={true}
                  id={`${t(k.FOLDER)}${folder}`}
                  key={folder}
                  folder={folder}
                  onClick={() => selectFolder(folder)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {folderModal && <FolderModal setFolders={setFolders} onClose={closeFolderModal} />}

      {settingsModal && (
        <SettingsModal
          setSettingsVisible={setSettingsModal}
          setSelectedFolder={setSelectedFolder}
          setFilterTags={setFilterTags}
          setSearchTerm={setSearchTerm}
          setFolders={setFolders}
          setFilteredPrompts={setFilteredPrompts}
          showToast={showToast}
          folders={folders}
          setPrompts={setPrompts}
          filterPrompts={filterPrompts}
        />
      )}
    </>
  )
}
