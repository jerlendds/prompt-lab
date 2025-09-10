import Sidebar from "./components/Sidebar.jsx"
import MainContent from "./components/MainContent.jsx"
import TransferModal from "./components/TransferModal.jsx"
import { useEffect, useState } from "react"
import { checkForResync, finishAuth } from "./components/js/cloudSyncing.js"
import Toast from "./components/Toast.jsx"
import { getObject, sendMessageToParent, setObject } from "./components/js/utils.js"
import OnboardingModal from "./components/OnboardingModal.jsx"
import i18next from "i18next"
import HotkeyUpdateModal from "./components/HotkeyUpdateModal.jsx"
import ReactGA from "react-ga4"
import Logo from "./components/Logo.jsx"
import { useLocalStorage } from "./components/useLocalStorage.js"

function App() {
  ReactGA.initialize("G-MNCY2VNTDC")
  ReactGA.send({ hitType: "pageview", page: "/", title: "PromptLab Home" })

  const [prompts, setPrompts] = useLocalStorage("prompts", [])
  const [folders, setFolders] = useLocalStorage("folders", [])

  const tags = prompts.length > 0 ? new Set(prompts.flatMap(obj => obj.tags)) : []

  const [filteredPrompts, setFilteredPrompts] = useState(prompts)
  const [selectedFolder, setSelectedfolder] = useState("")
  const [filterTags, setFilterTags] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const cloudSyncing = getObject("cloudSyncing", false)
  if (cloudSyncing) {
    checkForResync()
  }

  // get the "transfer" and onboarding URL parameters
  const transferring = new URLSearchParams(window.location.search).get("transfer") ?? false
  const onboarding = new URLSearchParams(window.location.search).get("onboarding") ?? false

  // Hotkey Update Modal 12/13
  const lang = localStorage.getItem("lng") ?? "en"
  const seenHotkeyUpdate = true
  const showHotkeyUpdate = lang === "en" && !onboarding && !transferring && !seenHotkeyUpdate

  function filterPrompts(folder = "", tags = [], searchTerm = "") {
    let newFiltered = prompts
    if (tags.length > 0) {
      newFiltered = newFiltered.filter(prompt => {
        // Check if all tags in the filterTags array are included in each prompt's tags array
        return tags.every(filterTag => prompt.tags.includes(filterTag))
      })
    }

    if (folder !== "") {
      newFiltered = newFiltered.filter(obj => obj.folder === folder)
    }

    if (searchTerm !== "") {
      searchTerm = searchTerm.toLowerCase() // convert search term to lowercase
      newFiltered = newFiltered.filter(
        prompt =>
          prompt.text?.toLowerCase().includes(searchTerm) ||
          prompt.description?.toLowerCase().includes(searchTerm) ||
          prompt.title?.toLowerCase().includes(searchTerm),
      )
    }

    setFilteredPrompts(newFiltered)
  }

  function pollLocalStorage() {
    const intervalId = setInterval(() => {
      const finishedAuthValue = localStorage.getItem("finishedAuthEvent")

      if (finishedAuthValue && finishedAuthValue !== "") {
        filterPrompts()
        setFilteredPrompts(getObject("prompts", []))
        showToast(finishedAuthValue)
        localStorage.setItem("finishedAuthEvent", "")
        clearInterval(intervalId)
      }
    }, 1000)
  }

  useEffect(() => {
    const handleMessage = async function (event) {
      const data = JSON.parse(event.data)
      if (data.message === "newAuthToken") {
        localStorage.setItem("GOOGLE_API_TOKEN", data.token)
        console.log("API TOKEN UPDATED")
        finishAuth()
        pollLocalStorage()
      } else if (data.message === "transfer") {
        console.log(data.prompts)
        console.log("recieved transfer prompts")
        await i18next.changeLanguage(data.lang)
        localStorage.setItem("lng", data.lang)
        const prompts = data.prompts
        setObject("transferPrompts", prompts)
        setObject("transferred", true)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  })

  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === "prompts") {
        const value = event.newValue
        if (value) {
          sendMessageToParent({ message: "sync_prompts", data: JSON.parse(value) })
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  function showToast(message) {
    setToast(true)
    setToastMessage(message)
    setTimeout(() => {
      setToast(false)
      setToastMessage("")
    }, 3000)
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between border-b border-beaker-800 w-full">
        {/* Top left logo and tagline */}
        <div className="flex items-end">
          <div className="flex -top-1.5 relative">
            <Logo />
            <div className="flex flex-col items-start justify-end">
              <h2 className="text-slate-200 font-sans font-semibold mt-auto">
                Prompt<span className="font-light">Lab</span>
              </h2>
              <p className="text-beaker-400 text-nowrap font-body font-normal text-[8px] uppercase">
                Browser Prompt Library
              </p>
            </div>
          </div>

          {/* tabs */}
          <nav className="ml-20 relative bottom-0 gap-x-2 flex items-center text-sm">
            {[
              { key: "promptlab-prompts", label: "Prompts" },
              { key: "promptlab-history", label: "History" },
              { key: "promptlab-stats", label: "Analytics" },
            ].map((t, idx) => (
              <a
                key={t.key}
                className="py-4 font-medium px-6 rounded text-drab-300 font-sans text-[13px] active:bg-dark-700/60 focus:bg-dark-700/60 hover:text-emerald-500 transition bg-dark-950 hover:bg-dark-800"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </div>

        {/* search bar */}
        <div className="flex ml-20 w-full py-2">
          <label className="relative w-full max-w-xl">
            <input
              className="w-full rounded-full bg-dark-800 border border-dark-600 px-10 py-1.5 text-sm outline-none placeholder:text-slate-600 focus:border-beaker-400 text-drab-300"
              placeholder="Search prompts, tags, and more..."
            />
            {/* search icon */}
            <svg
              className="pointer-events-none  text-beaker-400 absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </label>
        </div>
        {/* settings button */}
        <button
          title="Open PromptLab's settings"
          aria-label="Settings"
          className="rounded grid place-items-center text-drab-300  focus:bg-dark-700/60 hover:bg-dark-800 hover:text-beaker-500 transition p-3 py-4 px-6"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1Z" />
          </svg>
        </button>
      </header>

      <main className="flex h-full">
        <Sidebar
          filteredPrompts={filteredPrompts}
          setFilteredPrompts={setFilteredPrompts}
          filterPrompts={filterPrompts}
          setPrompts={setPrompts}
          setFolders={setFolders}
          folders={folders}
          setSelectedFolder={setSelectedfolder}
          selectedFolder={selectedFolder}
          setFilterTags={setFilterTags}
          filterTags={filterTags}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showToast={showToast}
        />

        <MainContent
          filteredPrompts={filteredPrompts}
          setFilteredPrompts={setFilteredPrompts}
          filterPrompts={filterPrompts}
          setPrompts={setPrompts}
          prompts={prompts}
          tags={tags}
          folders={folders}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          setSelectedFolder={setSelectedfolder}
          selectedFolder={selectedFolder}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </main>

      {toast && <Toast message={toastMessage} />}
      {transferring && <TransferModal />}
      {onboarding && <OnboardingModal />}
      {showHotkeyUpdate && <HotkeyUpdateModal />}
    </div>
  )
}

export default App
