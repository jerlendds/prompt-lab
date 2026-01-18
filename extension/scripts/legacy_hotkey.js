import { EditorState, RangeSetBuilder, StateField } from "@codemirror/state"
import {
  Decoration,
  EditorView,
  WidgetType,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLineGutter,
} from "@codemirror/view"
import { indentOnInput, bracketMatching, foldKeymap } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { unified } from "unified"
import remarkParse from "remark-parse"

const mdTheme = EditorView.theme(
  {
    "&": {
      color: "#94a3b8",
      backgroundColor: "transparent",
    },
    ".cm-content": {
      caretColor: "#94a3b8",
      fontFamily: "Lato",
      fontSize: "15px",
      lineHeight: "1.65",
      paddingBottom: "28px",
    },
    ".cm-scroller": {
      fontFamily: "Zx Gamut",
      paddingBottom: "20px",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#626b79",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
      color: "#b8c0d1",
    },
    ".cm-activeLineGutter": {
      color: "#b8c0d1",
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(243, 191, 122, 0.12)",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#f1f5f9",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(243, 191, 122, 0.2)",
    },
    ".cm-line": {
      padding: "0 5px",
    },
    ".cm-placeholder": {
      color: "var(--pg-light-400)",
      fontStyle: "italic",
    },
    ".cm-md-heading": {
      fontFamily: "Zx Gamut",
      color: "#b8c0d1",
      fontSize: "1.25em",
      padding: 0,
    },
    ".cm-md-heading-h1": {
      fontSize: "1.6em",
      letterSpacing: "0.02em",
    },
    ".cm-md-heading-h2": {
      fontSize: "1.45em",
      letterSpacing: "0.015em",
    },
    ".cm-md-heading-h3": {
      fontSize: "1.35em",
    },
    ".cm-md-divider": {
      display: "flex",
      alignItems: "center",
      gap: "7px 0",
      opacity: "0.9",
    },
    ".cm-md-divider-line": {
      flex: "1",
      height: "1px",
      background: "linear-gradient(90deg, #2b3441, transparent)",
    },
    ".cm-md-divider-label": {
      fontFamily:
        '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontSize: "10px",
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: "#9aa4b2",
    },
    ".cm-md-divider-h1 .cm-md-divider-label": {
      color: "#f1f5f9",
    },
    ".cm-md-divider-h2 .cm-md-divider-label": {
      color: "#e6b27a",
    },
    ".cm-md-divider-h3 .cm-md-divider-label": {
      color: "#d6a772",
    },
    ".cm-md-heading-marker": {
      color: "#6d7686",
      width: "auto",
    },
    ".cm-md-list-item": {
      color: "#aab4c3",
    },
    ".cm-md-list-item-ordered": {
      color: "#c7cfdc",
    },
    ".cm-md-list-item-unordered": {
      color: "#c7cfdc",
    },
    ".cm-md-list-marker": {
      color: "#7f8898",
      fontFamily:
        '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontSize: "0.9em",
      position: "relative",
      display: "inline-block",
    },
    ".cm-md-blockquote": {
      borderLeft: "2px solid #2b3441",
      paddingLeft: "12px",
      marginLeft: "4px",
      color: "#9aa4b2",
      fontStyle: "italic",
    },
    ".cm-md-blockquote-marker": {
      color: "#6d7686",
    },
    ".cm-md-inline-marker": {
      color: "#6d7686",
    },
    ".cm-line:not(.cm-activeLine) .cm-md-heading-marker": {
      display: "none",
    },
    ".cm-line:not(.cm-activeLine) .cm-md-inline-marker": {
      display: "none",
    },
    ".cm-line:not(.cm-activeLine) .cm-md-blockquote-marker": {
      display: "none",
    },
    ".cm-line:not(.cm-activeLine) .cm-md-list-marker": {
      color: "transparent",
    },
    ".cm-line:not(.cm-activeLine) .cm-md-list-marker::before": {
      content: "attr(data-md-marker)",
      color: "#7f8898",
      position: "absolute",
      left: 0,
    },
    ".cm-line.cm-activeLine .cm-md-list-marker::before": {
      content: '""',
    },
    ".cm-md-strong": {
      fontWeight: "700",
      color: "#e2e8f0",
    },
    ".cm-md-emphasis": {
      fontStyle: "italic",
      color: "#cbd5e1",
    },
    ".cm-md-inline-code": {
      fontFamily:
        '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontSize: "0.95em",
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      borderRadius: "4px",
      padding: "0 4px",
      color: "#e2e8f0",
    },
    ".cm-md-code-marker": {
      color: "#556070",
    },
    ".cm-md-codeblock": {
      backgroundColor: "rgba(9, 14, 20, 0.85)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      borderRadius: "8px",
      fontFamily:
        '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontSize: "0.95em",
      color: "#d9e3f1",
      padding: "4px 8px",
    },
    ".cm-md-codeblock-marker": {
      color: "#6b7686",
    },
  },
  { dark: true },
)

class HeadingDividerWidget extends WidgetType {
  constructor(depth) {
    super()
    this.depth = depth
  }

  eq(other) {
    return other.depth === this.depth
  }

  toDOM() {
    const wrap = document.createElement("div")
    wrap.className = `cm-md-divider cm-md-divider-h${this.depth}`
    return wrap
  }
}

const collectHeadings = (node, acc) => {
  if (node.type === "heading") {
    acc.push(node)
  }
  if (!node.children) return
  for (const child of node.children) {
    collectHeadings(child, acc)
  }
}

const remarkParser = unified().use(remarkParse)

const buildMarkdownDecorations = state => {
  const doc = state.doc
  const headings = []
  const listItems = []
  const blockquoteRanges = []
  const strongRanges = []
  const emphasisRanges = []
  const inlineCodeRanges = []
  const codeBlockRanges = []
  const tree = remarkParser.parse(doc.toString())

  collectHeadings(tree, headings)

  const getOffset = point => {
    if (!point?.line || !point?.column) return null
    if (point.line < 1 || point.line > doc.lines) return null
    const line = doc.line(point.line)
    const column = Math.max(1, point.column)
    const offset = line.from + column - 1
    return Math.min(line.to, Math.max(line.from, offset))
  }

  const getRange = position => {
    if (!position) return null
    const from = getOffset(position.start)
    const to = getOffset(position.end)
    if (from === null || to === null || to <= from) return null
    return { from, to }
  }

  const walk = (node, parentListOrdered) => {
    if (node.type === "list") {
      const ordered = Boolean(node.ordered)
      if (!node.children) return
      for (const child of node.children) {
        walk(child, ordered)
      }
      return
    }

    if (node.type === "listItem") {
      const lineNumber = node.position?.start?.line
      if (lineNumber) {
        listItems.push({
          line: lineNumber,
          ordered: Boolean(parentListOrdered),
        })
      }
    } else if (node.type === "blockquote") {
      const startLine = node.position?.start?.line
      const endLine = node.position?.end?.line
      if (startLine && endLine) {
        blockquoteRanges.push({ startLine, endLine })
      }
    } else if (node.type === "strong") {
      const range = getRange(node.position)
      if (range) strongRanges.push(range)
    } else if (node.type === "emphasis") {
      const range = getRange(node.position)
      if (range) emphasisRanges.push(range)
    } else if (node.type === "inlineCode") {
      const range = getRange(node.position)
      if (range) inlineCodeRanges.push(range)
    } else if (node.type === "code") {
      const startLine = node.position?.start?.line
      const endLine = node.position?.end?.line
      if (startLine && endLine) {
        codeBlockRanges.push({ startLine, endLine })
      }
    }

    if (!node.children) return
    for (const child of node.children) {
      walk(child, parentListOrdered)
    }
  }

  walk(tree)

  const builder = new RangeSetBuilder()
  const seenLines = new Set()
  const listLines = new Set()
  const blockquoteLines = new Set()
  const codeBlockLines = new Set()
  const inlineMarkerRanges = []
  const strongContentRanges = []
  const emphasisContentRanges = []
  const inlineCodeMarkerRanges = []
  const inlineCodeContentRanges = []
  const pending = []
  const addHeadingDecorations = (lineNumber, depth) => {
    const line = doc.line(lineNumber)
    const safeDepth = Math.min(Math.max(depth, 1), 6)
    const markerMatch = /^(#{1,6})\s+/.exec(line.text)

    pending.push({
      from: line.from,
      to: line.from,
      decoration: Decoration.line({
        class: `cm-md-heading cm-md-heading-h${safeDepth}`,
      }),
    })
    pending.push({
      from: line.from,
      to: line.from,
      decoration: Decoration.widget({
        widget: new HeadingDividerWidget(safeDepth),
        block: true,
        side: -1,
      }),
    })
    if (markerMatch) {
      const markerLength = markerMatch[1].length
      if (markerLength > 0) {
        pending.push({
          from: line.from,
          to: line.from + markerLength,
          decoration: Decoration.mark({
            class: "cm-md-heading-marker",
          }),
        })
      }
    }
  }
  for (const heading of headings) {
    const lineNumber = heading.position?.start?.line
    if (!lineNumber || lineNumber < 1 || lineNumber > doc.lines) continue
    const depth = heading.depth ?? 1
    seenLines.add(lineNumber)

    addHeadingDecorations(lineNumber, depth)
  }

  for (const range of strongRanges) {
    const slice = doc.sliceString(range.from, range.to)
    let markerLength = 0
    if (slice.startsWith("**") && slice.endsWith("**") && slice.length >= 4) {
      markerLength = 2
    } else if (slice.startsWith("__") && slice.endsWith("__") && slice.length >= 4) {
      markerLength = 2
    }

    if (markerLength > 0) {
      inlineMarkerRanges.push({
        from: range.from,
        to: range.from + markerLength,
      })
      inlineMarkerRanges.push({
        from: range.to - markerLength,
        to: range.to,
      })
      if (range.from + markerLength < range.to - markerLength) {
        strongContentRanges.push({
          from: range.from + markerLength,
          to: range.to - markerLength,
        })
      }
    } else {
      strongContentRanges.push(range)
    }
  }

  for (const range of emphasisRanges) {
    const slice = doc.sliceString(range.from, range.to)
    const marker = slice[0]
    const isValidMarker =
      (marker === "*" && !slice.startsWith("**")) ||
      (marker === "_" && !slice.startsWith("__"))
    if (isValidMarker && slice.endsWith(marker) && slice.length >= 2) {
      inlineMarkerRanges.push({
        from: range.from,
        to: range.from + 1,
      })
      inlineMarkerRanges.push({
        from: range.to - 1,
        to: range.to,
      })
      if (range.from + 1 < range.to - 1) {
        emphasisContentRanges.push({
          from: range.from + 1,
          to: range.to - 1,
        })
      }
    } else {
      emphasisContentRanges.push(range)
    }
  }

  for (const range of inlineCodeRanges) {
    const slice = doc.sliceString(range.from, range.to)
    const match = /^(`+)([\s\S]*)(`+)$/.exec(slice)
    if (match && match[1].length === match[3].length) {
      const markerLength = match[1].length
      inlineCodeMarkerRanges.push({
        from: range.from,
        to: range.from + markerLength,
      })
      inlineCodeMarkerRanges.push({
        from: range.to - markerLength,
        to: range.to,
      })
      if (range.from + markerLength < range.to - markerLength) {
        inlineCodeContentRanges.push({
          from: range.from + markerLength,
          to: range.to - markerLength,
        })
      }
    } else {
      inlineCodeContentRanges.push(range)
    }
  }

  for (const item of listItems) {
    if (item.line < 1 || item.line > doc.lines) continue
    if (!listLines.has(item.line)) {
      listLines.add(item.line)
      pending.push({
        from: doc.line(item.line).from,
        to: doc.line(item.line).from,
        decoration: Decoration.line({
          class: `cm-md-list-item cm-md-list-item-${item.ordered ? "ordered" : "unordered"}`,
        }),
      })
    }

    const line = doc.line(item.line)
    const lineText = line.text
    const markerMatch = item.ordered
      ? /^(\s*)(\d+[.)])\s+/.exec(lineText)
      : /^(\s*)([-*+])\s+/.exec(lineText)
    if (markerMatch) {
      const markerStart = markerMatch[1].length
      const markerLength = markerMatch[2].length
      const markerDisplay = item.ordered ? markerMatch[2] : "•"
      if (markerLength > 0) {
        pending.push({
          from: line.from + markerStart,
          to: line.from + markerStart + markerLength,
          decoration: Decoration.mark({
            class: "cm-md-list-marker",
            attributes: { "data-md-marker": markerDisplay },
          }),
        })
      }
    }
  }

  for (const range of blockquoteRanges) {
    const startLine = Math.max(1, range.startLine)
    const endLine = Math.min(doc.lines, range.endLine)
    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
      blockquoteLines.add(lineNumber)
    }
  }

  for (const lineNumber of blockquoteLines) {
    const line = doc.line(lineNumber)
    pending.push({
      from: line.from,
      to: line.from,
      decoration: Decoration.line({ class: "cm-md-blockquote" }),
    })

    const markerMatch = /^(\s*>+)\s?/.exec(line.text)
    if (markerMatch) {
      const markerLength = markerMatch[1].length
      if (markerLength > 0) {
        pending.push({
          from: line.from + markerMatch.index,
          to: line.from + markerMatch.index + markerLength,
          decoration: Decoration.mark({ class: "cm-md-blockquote-marker" }),
        })
      }
    }
  }

  for (const range of codeBlockRanges) {
    const startLine = Math.max(1, range.startLine)
    const endLine = Math.min(doc.lines, range.endLine)
    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
      codeBlockLines.add(lineNumber)
    }
  }

  for (const lineNumber of codeBlockLines) {
    const line = doc.line(lineNumber)
    pending.push({
      from: line.from,
      to: line.from,
      decoration: Decoration.line({ class: "cm-md-codeblock" }),
    })
    const markerMatch = /^(\s*)(`{3,}|~{3,})/.exec(line.text)
    if (markerMatch) {
      const markerLength = markerMatch[2].length
      if (markerLength > 0) {
        pending.push({
          from: line.from + markerMatch[1].length,
          to: line.from + markerMatch[1].length + markerLength,
          decoration: Decoration.mark({ class: "cm-md-codeblock-marker" }),
        })
      }
    }
  }

  for (const range of strongContentRanges) {
    pending.push({
      from: range.from,
      to: range.to,
      decoration: Decoration.mark({ class: "cm-md-strong" }),
    })
  }

  for (const range of emphasisContentRanges) {
    pending.push({
      from: range.from,
      to: range.to,
      decoration: Decoration.mark({ class: "cm-md-emphasis" }),
    })
  }

  for (const range of inlineCodeContentRanges) {
    pending.push({
      from: range.from,
      to: range.to,
      decoration: Decoration.mark({ class: "cm-md-inline-code" }),
    })
  }

  for (const range of inlineMarkerRanges) {
    pending.push({
      from: range.from,
      to: range.to,
      decoration: Decoration.mark({ class: "cm-md-inline-marker" }),
    })
  }

  for (const range of inlineCodeMarkerRanges) {
    pending.push({
      from: range.from,
      to: range.to,
      decoration: Decoration.mark({ class: "cm-md-code-marker" }),
    })
  }

  const lines = doc.toString().split("\n")
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i]
    const match = /^(#{1,6})(\s|$)/.exec(text)
    if (!match) continue
    const lineNumber = i + 1
    if (seenLines.has(lineNumber)) continue
    if (codeBlockLines.has(lineNumber)) continue
    const depth = match[1].length
    addHeadingDecorations(lineNumber, depth)
  }

  pending
    .sort((a, b) => {
      if (a.from !== b.from) return a.from - b.from
      const aSide = a.decoration?.startSide ?? 0
      const bSide = b.decoration?.startSide ?? 0
      if (aSide !== bSide) return aSide - bSide
      return a.to - b.to
    })
    .forEach(({ from, to, decoration }) => {
      builder.add(from, to, decoration)
    })

  return builder.finish()
}

const markdownStructure = StateField.define({
  create: buildMarkdownDecorations,
  update: (decorations, tr) => {
    if (!tr.docChanged) return decorations
    return buildMarkdownDecorations(tr.state)
  },
  provide: field => EditorView.decorations.from(field),
})

const buildMarkdownEditorExtensions = () => {
  const updateListener = EditorView.updateListener.of(update => {
    if (!update.docChanged) return
    if (window.pgPanelHydrating) return
    window.pgPanelEditingDirty = true
  })

  return [
    mdTheme,
    markdownStructure,
    EditorView.lineWrapping,
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSelectionMatches(),
    keymap.of([
      {
        key: "Mod-Enter",
        run: view => {
          view.contentDOM.blur()
          return true
        },
      },
      {
        key: "Escape",
        run: () => {
          if (typeof window.pgPanelCancelEdit === "function") {
            window.pgPanelCancelEdit()
          }
          return true
        },
      },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
    updateListener,
  ]
}

function ensurePromptEditor(container, value) {
  if (!container) return null
  if (!window.pgPanelEditorView) {
    window.pgPanelHydrating = true
    const state = EditorState.create({
      doc: value || "",
      extensions: buildMarkdownEditorExtensions(),
    })
    const view = new EditorView({ state, parent: container })
    window.pgPanelEditorView = view
    window.pgPanelHydrating = false
  } else if (typeof value === "string") {
    const view = window.pgPanelEditorView
    const current = view.state.doc.toString()
    if (current !== value) {
      window.pgPanelHydrating = true
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
      window.pgPanelHydrating = false
    }
  }
  return window.pgPanelEditorView
}

function getPromptEditorValue() {
  return window.pgPanelEditorView?.state?.doc?.toString?.() ?? ""
}

async function main(prompts) {
  console.log("main legacy_hotkey PROMPTS", prompts)
  const chatInput = document.getElementById("prompt-textarea")
  if (!chatInput) {
    setTimeout(() => main(prompts), 600)
    return
  }
  let textDiv = chatInput.parentElement
  let autocomplete = false
  let focusedIdx = 0

  function findVariables(str) {
    // thanks chatgpt
    const regex = /{{(.+?)}}/g
    const matches = new Set()
    let match
    while ((match = regex.exec(str))) {
      matches.add(match[1])
    }
    return Array.from(matches)
  }

  function replaceVariables(str, values) {
    // thanks chatgpt
    const variables = findVariables(str)
    variables.forEach((variable, index) => {
      const value = values[index % values.length]
      const regex = new RegExp(`{{${variable}}}`, "g")
      str = str.replace(regex, value)
    })
    return str
  }

  async function getVarsFromModal(varArray, promptText, onApply) {
    const template = `  
        <div id="var-modal" style="z-index: 100; background-color: rgb(0 0 0/.5)" class="fixed pg-outer items-center inset-0 flex items-center justify-center bg-opacity-50 z-100">
          <div class="fixed inset-0 z-10 overflow-y-auto pg-outer">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block pg-outer">
              <div style="width: 60%" class="dark:bg-gray-900 dark:text-gray-200 dark:border-netural-400 inline-block max-h-[ma400px] transform overflow-hidden rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:p-6 sm:align-middle" role="dialog">
            ${varArray
              .map(
                variable => `
                <div class="text-sm font-bold text-black dark:text-gray-200">${variable}</div>
                <textarea style="border-color: #8e8ea0; height: 45px" class="pg-variable my-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-gray-800 dark:text-neutral-100" 
                placeholder="${chrome.i18n.getMessage(
                  "enter_val",
                )} ${variable}..." value=""></textarea>
                `,
              )
              .join("")}
                <button id="save-vars" type="button" class="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-gray-800">${chrome.i18n.getMessage(
                  "submit",
                )}</button>   
              </div>
            </div>
          </div>
        </div>
        `
    document.body.insertAdjacentHTML("beforeend", template)
    document.querySelector(".pg-variable").focus()
    function handleKeyDown(event) {
      if ((event.key === "Enter" || event.keyCode === 13) && !event.shiftKey) {
        submitModal()
        document.removeEventListener("keydown", handleKeyDown)
      }
    }

    function handleClick(e) {
      if (e.target.classList.contains("pg-outer")) {
        closeModal()
      }
    }

    function closeModal() {
      const modal = document.getElementById("var-modal")
      if (modal) modal.remove()
    }

    document.querySelectorAll(".pg-outer").forEach(div => {
      div.addEventListener("click", e => handleClick(e))
    })

    document.addEventListener("keydown", handleKeyDown)
    document.getElementById("save-vars").addEventListener("click", submitModal)
    function submitModal() {
      const varInputs = document.querySelectorAll(".pg-variable")
      let variables = []
      for (const varIn of varInputs) {
        variables.push(varIn.value)
      }
      document.getElementById("var-modal").remove()
      const resolvedText = replaceVariables(promptText, variables)
      if (typeof onApply === "function") {
        onApply(resolvedText)
      } else {
        selectPrompt(resolvedText, false)
      }
      setTimeout(() => chatInput.focus(), 80) // so not to add a newline
    }
  }

  async function selectPrompt(promptText, hasVars = true) {
    let chatInput = document.getElementById("prompt-textarea")
    removeSuggestion()
    const vars = hasVars ? findVariables(promptText) : [] // so if the chosen variable has a variable within {{}}
    if (vars.length > 0) {
      getVarsFromModal(vars, promptText, resolved => selectPrompt(resolved, false))
      return ""
    }
    const searchTerm = chatInput.value.substring(chatInput.value.lastIndexOf("/") + 1).split(" ")[0]
    const lastSlashIndex = chatInput.value.lastIndexOf("/")
    const lastSearchTermIndex = lastSlashIndex + searchTerm.length + 1
    const submit_btn = chatInput.parentElement.parentElement.querySelector("button")
    if (submit_btn) {
      chatInput.style.height = "200px"
      submit_btn.addEventListener("click", () => {
        chatInput.style.height = "24px"
      })
    }
    const newText =
      chatInput.value.substring(0, lastSlashIndex) +
      promptText +
      chatInput.value.substring(lastSearchTermIndex)
    console.log(newText)
    chatInput.value = newText
    autocomplete = false
  }

  let lastKey = ""
  function autoComplete(event) {
    //console.log(lastKey)
    //console.log(event)
    if (!(event.target.id === "prompt-textarea")) {
      return true
    }
    // If keydown is a backslash / character, do this
    else if (event.key === "/" && lastKey !== "Shift" && !autocomplete) {
      // Set a flag to indicate that autoComplete was triggered by the slash
      autocomplete = true
      removeSuggestion()
      getSuggestedPrompts("")
      focusedIdx = 0
      focusEl(focusedIdx)
    }
    // If space is pressed, remove autoComplete suggestions and reset the autoComplete flag
    else if (
      event.key === " " ||
      (event.key === "Backspace" && chatInput.value.lastIndexOf("/") === -1)
    ) {
      autocomplete = false
      removeSuggestion()
    } else if (autocomplete && event.key === "Enter") {
      selectFocused()
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      lastKey = event?.key ?? ""
      return false
    } else if (autocomplete && event.key === "ArrowUp") {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      if (focusedIdx > 0) {
        focusedIdx -= 1
        const focused = focusEl(focusedIdx)
        focused.scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "start",
        })
      }
      lastKey = event?.key ?? ""
      return false
    } else if (autocomplete && event.key === "ArrowDown") {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      const searchTerm = chatInput.value
        .substring(chatInput.value.lastIndexOf("/") + 1)
        .split(" ")[0]
      let filtered = prompts.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (focusedIdx < filtered.length - 1) {
        focusedIdx += 1
        const focused = focusEl(focusedIdx)
        focused.scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "start",
        })
      }
      lastKey = event?.key ?? ""
      return false
    }
    // If autoComplete was triggered and a non-space character is pressed, process autoComplete
    else if (autocomplete && event.key !== " " && event.type !== "change") {
      const searchTerm = chatInput.value
        .substring(chatInput.value.lastIndexOf("/") + 1)
        .split(" ")[0]
      //textDiv.querySelector("button").disabled = true; // weird jerry rig to stop form from submitting
      //console.log(searchTerm)
      removeSuggestion()
      getSuggestedPrompts(searchTerm)
      focusedIdx = 0
      focusEl(focusedIdx)
    }
    //}
    // Else, return
    else {
      lastKey = event?.key ?? ""
      return true
    }
    lastKey = event?.key ?? ""
  }

  function selectFocused() {
    const focused = document.querySelector(".autocomplete-active")
    if (focused) {
      const promptId = focused.getAttribute("data-prompt-id4")
      selectPrompt(prompts.find(prompt => prompt.id === promptId)?.text)
    }
    removeSuggestion()
  }

  function preventEnter(event) {
    if (event.key === "Enter" && autocomplete && document.querySelector(".autocomplete-active")) {
      //textDiv.querySelector("button").disabled = true; // weird jerry rig to stop form from submitting
      event.preventDefault()
      event.stopPropagation()
      return false
    } else if ((event.key === "ArrowUp" || event.key === "ArrowDown") && autocomplete) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  function focusEl(idx) {
    document
      .querySelectorAll(".pg-suggestion")
      .forEach(each => each.classList.remove("autocomplete-active"))
    const focusedEl = document.querySelectorAll(".pg-suggestion")[idx]
    focusedEl?.classList.add("autocomplete-active")
    return focusedEl
  }

  const autocompleteStyles = `
    <style>

    .autocomplete-active {
        /*when navigating through the items using the arrow keys:*/
        background-color: #0BA37F;
        color: #ffffff;
    }
    .dark .autocomplete-active {
        background-color: #2A2B32 !important;
    }
    </style>
    `
  document.head.insertAdjacentHTML("beforeend", autocompleteStyles)

  const placeholder = chrome.i18n.getMessage("placeholder")
  function updatePlaceholder() {
    document.querySelector("#prompt-textarea").placeholder = placeholder
  }
  updatePlaceholder()
  setupFloatingPanel(prompts)
  applySiteThemeOverrides()
  setupLinkOverrides()
  setupSavePromptButtons()

  function setupFloatingPanel(promptsList) {
    window.pgPanelPrompts = Array.isArray(promptsList) ? promptsList : []
    if (!window.pgPanelActiveTab) window.pgPanelActiveTab = "All"

    if (!document.getElementById("pg-floating-style")) {
      document.head.insertAdjacentHTML("beforeend", floatingPanelStyles())
    }
    if (!document.getElementById("pg-floating-root")) {
      document.body.insertAdjacentHTML("beforeend", floatingPanelMarkup())
      bindFloatingPanelEvents()
    }
    const logoImg = document.getElementById("pg-pill-logo")
    if (logoImg) {
      logoImg.src = chrome.runtime.getURL("icons/logo.svg")
    }
    const panelLogo = document.getElementById("pg-panel-logo")
    if (panelLogo) {
      panelLogo.src = chrome.runtime.getURL("icons/logo.svg")
    }
    renderFloatingPanel()
  }

  function floatingPanelMarkup() {
    return `
      <div id="pg-floating-root" class="pg-floating-root">
        <button id="pg-floating-button" class="pg-floating-button" aria-label="Open Prompt Lab" aria-expanded="false">
          <span class="pg-pill-brand">
            <img id="pg-pill-logo" class="pg-pill-logo" alt="PromptLab logo" />
            <span class="pg-pill-text">
              <span>Prompt</span><span class="pg-pill-bold">Lab</span>
            </span>
          </span>
        </button>
        <div id="pg-floating-panel" class="pg-floating-panel" role="dialog" aria-label="Prompt templates">
          <div class="pg-panel-header">
            <div class="pg-panel-title">
              <img id="pg-panel-logo" class="pg-panel-title-logo" alt="PromptLab logo" />
              <span class="pg-panel-title-text">
                <span>Prompt</span><span class="pg-pill-bold">Lab</span>
              </span>
            </div>
            <div class="pg-panel-header-actions">
              <button id="pg-panel-back" class="pg-panel-back" aria-label="Back to list">Back</button>
              <button id="pg-panel-close" class="pg-panel-close" aria-label="Close prompt panel">×</button>
            </div>
          </div>
          <div class="pg-panel-search-bar">
            <input id="pg-panel-search" class="pg-panel-search" type="text" placeholder="Search templates, tags, content..." />
          </div>
          <div class="pg-panel-body">
            <div id="pg-panel-tabs" class="pg-panel-tabs" role="tablist"></div>
            <div class="pg-panel-content">
              <div id="pg-panel-list" class="pg-panel-list"></div>
              <div id="pg-panel-editor" class="pg-panel-editor" aria-hidden="true">
                <input id="pg-editor-title" class="pg-editor-title" type="text" placeholder="Title" />
                <div class="pg-editor-tags">
                  <div id="pg-editor-tag-list" class="pg-editor-tag-list"></div>
                  <input id="pg-editor-tag-input" class="pg-editor-tag-input" type="text" placeholder="Add a tag and press Enter" />
                </div>
                <div id="pg-editor-text" class="pg-editor-text" data-placeholder="Edit prompt template (markdown)..."></div>
                <div class="pg-editor-actions">
                  <button id="pg-editor-cancel" class="pg-editor-cancel">Cancel</button>
                  <button id="pg-editor-delete" class="pg-editor-delete">Delete</button>
                  <button id="pg-editor-save" class="pg-editor-save">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function floatingPanelStyles() {
    return `
      <style id="pg-floating-style">
        :root {
          --pg-dark-950: #04070b;
          --pg-dark-900: #05090d;
          --pg-dark-800: #090e14;
          --pg-dark-700: #101820;
          --pg-dark-600: #18222c;
          --pg-dark-500: #23303d;
          --pg-dark-400: #2e3d4d;
          --pg-light-100: #d7e2ef;
          --pg-light-200: #c6d5e8;
          --pg-light-300: #b4c9e1;
          --pg-light-400: #88acd1;
          --pg-beaker-300: #00d4aa;
          --pg-beaker-400: #00be98;
          --pg-beaker-500: #009f7f;
        }
        .pg-floating-root {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 100000;
          font-family: "Lato", "Poppins", system-ui, sans-serif;
        }
        .pg-floating-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(5, 9, 13, 0.92);
          color: var(--pg-light-200);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }
        .pg-pill-brand {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          position: relative;
          top: -2px;
        }
        .pg-pill-logo {
          width: 28px;
          height: 28px;
          padding: 8px 0 0;
          max-width: 56px;
          object-fit: contain;
        }
        .pg-pill-text {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          color: #e2e8f0;
          font-family: "Poppins", "Lato", system-ui, sans-serif;
          font-weight: 600;
        }
        .pg-pill-bold {
          font-weight: 800;
        }
        .pg-floating-button:hover {
          background: rgba(9, 14, 20, 0.92);
          border-color: rgba(0, 190, 152, 0.5);
        }
        .pg-floating-panel {
          position: fixed;
          right: 24px;
          bottom: 90px;
          width: 520px;
          max-height: 70vh;
          background: var(--pg-dark-800);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
          display: none;
          flex-direction: column;
          overflow: hidden;
          transition: width 200ms ease, height 200ms ease, transform 200ms ease;
        }
        .pg-floating-panel.pg-expanded {
          width: min(66vw, 980px);
          max-height: 80vh;
          transform: translateY(-6px);
        }
        .pg-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: linear-gradient(135deg, #0b1220 0%, #0f1b2a 100%);
        }
        .pg-panel-search-bar {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: var(--pg-dark-900);
        }
        .pg-panel-search {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          background: rgba(5, 9, 13, 0.75);
          color: var(--pg-light-100);
        }
        .pg-floating-panel ::placeholder {
          color: var(--pg-light-400);
        }
        .pg-panel-header-actions {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pg-panel-back {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: var(--pg-light-300);
          font-size: 12px;
          border-radius: 999px;
          padding: 4px 10px;
          cursor: pointer;
          display: none;
        }
        .pg-panel-back.pg-visible {
          display: inline-flex;
        }
        .pg-panel-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          color: var(--pg-light-100);
          font-family: "Poppins", "Lato", system-ui, sans-serif;
        }
        .pg-panel-title-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          opacity: 0.9;
        }
        .pg-panel-title-text {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          color: #e2e8f0;
        }
        .pg-panel-close {
          border: none;
          background: transparent;
          font-size: 20px;
          cursor: pointer;
          color: var(--pg-light-300);
        }
        .pg-panel-body {
          display: flex;
          flex: 1;
          min-height: 0;
          background: var(--pg-dark-800);
        }
        .pg-panel-tabs {
          width: 90px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          background: var(--pg-dark-900);
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }
        .pg-panel-tab {
          border: none;
          background: transparent;
          padding: 8px 10px;
          border-radius: 10px;
          text-align: left;
          font-size: 12px;
          color: var(--pg-light-400);
          cursor: pointer;
        }
        .pg-panel-tab.pg-active {
          background: rgba(0, 190, 152, 0.16);
          color: var(--pg-beaker-300);
          font-weight: 600;
        }
        .pg-panel-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .pg-panel-content.pg-editor-open .pg-panel-list {
          display: none;
        }
        .pg-panel-content.pg-editor-open .pg-panel-editor {
          display: flex;
        }
        .pg-panel-list {
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pg-panel-editor {
          display: none;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          height: 100%;
          min-height: 0;
          overflow-y: auto;
          padding-bottom: 16px;
          flex: 1;
          animation: pgFadeIn 160ms ease;
        }
        .pg-editor-tags {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pg-editor-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pg-editor-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0, 190, 152, 0.25);
          background: rgba(0, 190, 152, 0.12);
          color: var(--pg-beaker-300);
          font-size: 11px;
        }
        .pg-editor-tag button {
          border: none;
          background: transparent;
          color: var(--pg-light-300);
          cursor: pointer;
        }
        .pg-editor-tag-input {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          background: rgba(5, 9, 13, 0.75);
          color: var(--pg-light-100);
        }
        .pg-editor-title {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(5, 9, 13, 0.75);
          color: var(--pg-light-100);
        }
        .pg-editor-text {
          flex: 1 1 auto;
          min-height: 180px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 6px;
          background: var(--pg-dark-900);
          overflow: hidden;
        }
        .pg-editor-text .cm-editor {
          height: 100%;
        }
        .pg-editor-text .cm-scroller {
          font-family: "Lato", "Arial", sans-serif;
        }
        .pg-editor-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .pg-editor-cancel {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: var(--pg-light-300);
          font-size: 12px;
          border-radius: 999px;
          padding: 6px 12px;
          cursor: pointer;
        }
        .pg-editor-save {
          border: none;
          background: var(--pg-beaker-500);
          color: #001912;
          font-size: 12px;
          border-radius: 999px;
          padding: 6px 14px;
          cursor: pointer;
        }
        .pg-editor-delete {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #fca5a5;
          font-size: 12px;
          border-radius: 999px;
          padding: 6px 12px;
          cursor: pointer;
        }
        .pg-editor-delete:hover {
          color: #fecaca;
          border-color: rgba(248, 113, 113, 0.4);
        }
        @keyframes pgFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pg-prompt-card {
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 10px 12px;
          background: var(--pg-dark-900);
          cursor: default;
          text-align: left;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .pg-prompt-card:hover {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .pg-prompt-card-content {
          flex: 1;
          min-width: 0;
        }
        .pg-prompt-card-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
        }
        .pg-prompt-card-btn {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(5, 9, 13, 0.75);
          color: var(--pg-light-200);
          font-size: 11px;
          border-radius: 999px;
          padding: 4px 10px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pg-prompt-card-btn:hover {
          color: var(--pg-beaker-300);
          border-color: rgba(0, 190, 152, 0.45);
        }
        .pg-prompt-card-btn.pg-prompt-card-inject {
          background: rgba(0, 190, 152, 0.16);
          color: var(--pg-beaker-300);
          border-color: rgba(0, 190, 152, 0.3);
        }
        .pg-prompt-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--pg-light-100);
          margin-bottom: 4px;
        }
        .pg-prompt-desc {
          font-size: 12px;
          color: var(--pg-light-400);
        }
        .pg-prompt-tags {
          margin-top: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pg-prompt-tag {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 999px;
          border: 1px solid rgba(0, 190, 152, 0.2);
          color: var(--pg-beaker-300);
          background: rgba(0, 190, 152, 0.1);
        }
        .pg-panel-empty {
          font-size: 12px;
          color: var(--pg-light-400);
          padding: 20px 12px;
        }
        .pg-save-prompt {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          min-width: 42px;
          padding: 0 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .pg-save-prompt.pg-saved {
          color: #1d4ed8;
        }
        @media (max-width: 560px) {
          .pg-floating-root {
            right: 16px;
            bottom: 16px;
          }
          .pg-floating-panel {
            right: 16px;
            bottom: 80px;
            width: min(90vw, 340px);
          }
          .pg-floating-panel.pg-expanded {
            width: min(95vw, 460px);
          }
        }
      </style>
    `
  }

  function bindFloatingPanelEvents() {
    const button = document.getElementById("pg-floating-button")
    const panel = document.getElementById("pg-floating-panel")
    const closeBtn = document.getElementById("pg-panel-close")
    const backBtn = document.getElementById("pg-panel-back")
    const editorCancel = document.getElementById("pg-editor-cancel")
    const editorDelete = document.getElementById("pg-editor-delete")
    const editorSave = document.getElementById("pg-editor-save")
    const searchInput = document.getElementById("pg-panel-search")
    const tagInput = document.getElementById("pg-editor-tag-input")
    const root = document.getElementById("pg-floating-root")

    button.addEventListener("click", () => toggleFloatingPanel(true))
    closeBtn.addEventListener("click", () => toggleFloatingPanel(false))
    backBtn.addEventListener("click", () => closePromptEditor())
    editorCancel.addEventListener("click", () => closePromptEditor())
    editorDelete.addEventListener("click", () => deletePromptEdits())
    editorSave.addEventListener("click", () => savePromptEdits())
    window.pgPanelCancelEdit = closePromptEditor
    const titleInput = document.getElementById("pg-editor-title")
    titleInput?.addEventListener("input", () => {
      window.pgPanelEditingDirty = true
    })

    root.addEventListener("click", event => {
      const tabButton = event.target.closest("[data-folder]")
      if (tabButton) {
        window.pgPanelActiveTab = tabButton.getAttribute("data-folder")
        renderFloatingPanel()
        return
      }
      const removeTagButton = event.target.closest("[data-tag-remove]")
      if (removeTagButton) {
        const tagValue = removeTagButton.getAttribute("data-tag-remove")
        removeEditorTag(tagValue)
        return
      }
      const actionButton = event.target.closest("[data-prompt-action]")
      if (actionButton) {
        const promptId = actionButton.getAttribute("data-prompt-id")
        const action = actionButton.getAttribute("data-prompt-action")
        const prompt = getPromptById(promptId)
        if (!prompt) return
        if (action === "edit") {
          openPromptEditor(prompt)
        } else if (action === "inject") {
          insertPromptFromPanel(getPromptText(prompt))
        }
      }
    })

    searchInput?.addEventListener("input", event => {
      window.pgPanelSearchTerm = event.target.value || ""
      renderFloatingPanel()
    })

    tagInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault()
        const value = event.target.value || ""
        addEditorTag(value)
        event.target.value = ""
      }
    })

    panel.style.display = "none"
  }

  function setupSavePromptButtons() {
    if (!document.getElementById("pg-save-style")) {
      document.head.insertAdjacentHTML(
        "beforeend",
        `<style id="pg-save-style">
          .pg-save-prompt span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          .pg-save-prompt {
            gap: 6px;
          }
          .pg-save-prompt svg {
            width: 14px;
            height: 14px;
          }
          .pg-save-prompt:hover {
            color: var(--pg-beaker-300);
          }
          .pg-copy-links span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          .pg-copy-links {
            gap: 6px;
          }
          .pg-copy-links svg {
            width: 14px;
            height: 14px;
          }
        </style>`,
      )
    }

    const addButtons = root => {
      const scope = root || document
      const copyButtons = scope.querySelectorAll('button[data-testid="copy-turn-action-button"]')
      copyButtons.forEach(copyBtn => {
        const actionRow = copyBtn.parentElement
        if (!actionRow || actionRow.querySelector(".pg-save-prompt")) return
        const article = copyBtn.closest("article")
        const messageEl = article?.querySelector("[data-message-id]")
        if (!messageEl) return

        const saveBtn = document.createElement("button")
        saveBtn.type = "button"
        saveBtn.className = "text-token-text-secondary hover:bg-token-bg-secondary rounded-lg pg-save-prompt"
        saveBtn.setAttribute("aria-label", "Save as prompt")
        saveBtn.dataset.messageId = messageEl.getAttribute("data-message-id") || ""
        saveBtn.innerHTML = `<span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-message-2-bolt">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h6"></path>
            <path d="M13 20l-1 1l-3 -3h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5"></path>
            <path d="M19 16l-2 3h4l-2 3"></path>
          </svg>
          Save
        </span>`
        copyBtn.insertAdjacentElement("afterend", saveBtn)

        const linkBtn = document.createElement("button")
        linkBtn.type = "button"
        linkBtn.className = "text-token-text-secondary hover:bg-token-bg-secondary rounded-lg pg-copy-links"
        linkBtn.setAttribute("aria-label", "Copy link text")
        linkBtn.dataset.messageId = messageEl.getAttribute("data-message-id") || ""
        linkBtn.innerHTML = `<span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-unlink">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M17 22v-2"></path>
            <path d="M9 15l6 -6"></path>
            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
            <path d="M20 17h2"></path>
            <path d="M2 7h2"></path>
            <path d="M7 2v2"></path>
          </svg>
          Links
        </span>`
        saveBtn.insertAdjacentElement("afterend", linkBtn)
      })
    }

    addButtons(document)

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          addButtons(node)
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    if (!window.pgSaveListenerAdded) {
      window.pgSaveListenerAdded = true
      document.addEventListener("click", async event => {
        const saveBtn = event.target.closest(".pg-save-prompt")
        if (!saveBtn) return
        event.preventDefault()
        event.stopPropagation()
        const article = saveBtn.closest("article")
        const messageEl = article?.querySelector("[data-message-author-role]")
        if (!messageEl) return
        const role = messageEl.getAttribute("data-message-author-role") || "message"
        const rawMarkdown = await getRawMarkdownFromCopyButton(article)
        const markdown = rawMarkdown || extractMessageMarkdown(messageEl)
        if (!markdown) return
        savePromptFromMessage(markdown, role, saveBtn)
      })

      document.addEventListener("click", async event => {
        const linkBtn = event.target.closest(".pg-copy-links")
        if (!linkBtn) return
        event.preventDefault()
        event.stopPropagation()
        const article = linkBtn.closest("article")
        if (!article) return
        const markdown = await getRawMarkdownFromCopyButton(article)
        if (!markdown) return
        const urls = extractUrlsFromText(markdown)
        if (urls.length === 0) return
        try {
          await navigator.clipboard.writeText(urls.join("\n"))
          linkBtn.classList.add("pg-saved")
          linkBtn.querySelector("span").textContent = "Copied"
          setTimeout(() => {
            linkBtn.classList.remove("pg-saved")
            linkBtn.querySelector("span").textContent = "Links"
          }, 1400)
        } catch (error) {
          console.warn("Unable to copy link text", error)
        }
      })
    }
  }

  async function getRawMarkdownFromCopyButton(article) {
    if (!article) return null
    const copyBtn = article.querySelector('button[data-testid="copy-turn-action-button"]')
    if (!copyBtn || !navigator?.clipboard?.readText) return null
    try {
      copyBtn.click()
      await new Promise(resolve => setTimeout(resolve, 80))
      const text = await navigator.clipboard.readText()
      return text && text.trim().length > 0 ? text : null
    } catch (error) {
      console.warn("Unable to read clipboard for raw markdown", error)
      return null
    }
  }

  function extractUrlsFromText(text) {
    if (!text) return []
    const urlRegex = /https?:\/\/[^\s)\]}>,"]+/g
    const matches = text.match(urlRegex) || []
    return Array.from(new Set(matches.map(match => match.trim())))
  }

  function applySiteThemeOverrides() {
    if (document.getElementById("pg-site-theme")) return
    const css = `
      :root {
        --pg-dark-950: #04070b;
        --pg-dark-900: #05090d;
        --pg-dark-800: #090e14;
        --pg-dark-700: #101820;
        --pg-dark-600: #18222c;
        --pg-dark-500: #23303d;
        --pg-light-100: #d7e2ef;
        --pg-light-200: #c6d5e8;
        --pg-light-300: #b4c9e1;
        --pg-light-400: #88acd1;
        --pg-beaker-300: #00d4aa;
        --pg-beaker-400: #00be98;
        --pg-beaker-500: #009f7f;
        --bg-primary: var(--pg-dark-900);
        --bg-elevated-secondary: var(--pg-dark-900);
        --border-light: #ffffff0d;
        --text-primary: #ffffff;
      }
      :root,
      html,
      body,
      [data-chat-theme],
      [data-chat-theme] .dark,
      .dark {
        --bg-primary: var(--pg-dark-900) !important;
        --bg-elevated-secondary: var(--pg-dark-900) !important;
        --border-light: #ffffff0d !important;
        --text-primary: #ffffff !important;
      }
      html,
      body {
        background-color: var(--pg-dark-950) !important;
        color: var(--pg-light-200) !important;
      }
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at 15% 10%, rgba(0, 212, 170, 0.08), transparent 45%),
          radial-gradient(circle at 85% 20%, rgba(0, 159, 127, 0.06), transparent 50%);
        pointer-events: none;
        z-index: -1;
      }
      .bg-token-main-surface-primary,
      .bg-token-bg-secondary,
      .bg-token-bg-tertiary,
      .bg-token-bg-elevated-secondary,
      .bg-token-sidebar-surface-primary,
      .bg-token-surface-hover,
      .bg-token-surface-primary,
      .bg-token-surface-secondary {
        background-color: var(--pg-dark-800) !important;
      }
      .bg-token-main-surface-primary {
        background-color: var(--pg-dark-900) !important;
      }
      .text-token-text-primary {
        color: var(--pg-light-100) !important;
      }
      .text-token-text-secondary {
        color: var(--pg-light-200) !important;
      }
      .text-token-text-tertiary {
        color: var(--pg-light-400) !important;
      }
      .border-token-border-light,
      .border-token-border-default,
      .border-token-border-heavy {
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      a,
      .decorated-link,
      .text-token-text-accent {
        color: var(--pg-beaker-300) !important;
      }
      button:hover,
      .hover\\:bg-token-surface-hover:hover {
        background-color: rgba(255, 255, 255, 0.06) !important;
      }
      .ring-token-border-active,
      .focus-visible\\:ring-token-border-active:focus-visible {
        --tw-ring-color: rgba(0, 212, 170, 0.45) !important;
      }
      .rounded-lg,
      .rounded-xl {
        border-radius: 12px;
      }
      .text-message .user-message-bubble-color {
        background: rgba(0, 159, 127, 0.12) !important;
        border: 1px solid rgba(0, 212, 170, 0.25) !important;
        color: var(--pg-light-100) !important;
      }
      .markdown,
      .markdown p,
      .markdown li,
      .markdown h1,
      .markdown h2,
      .markdown h3 {
        color: var(--pg-light-100) !important;
      }
      .markdown a {
        color: var(--pg-beaker-300) !important;
      }
      a,
      .decorated-link,
      [data-testid="webpage-citation-pill"] a {
        color: var(--pg-beaker-300) !important;
      }
      [data-testid="webpage-citation-pill"] a {
        background: rgba(0, 190, 152, 0.12) !important;
        border: 1px solid rgba(0, 190, 152, 0.25) !important;
        color: var(--pg-light-100) !important;
      }
      .dark\\:bg-\\[\\#303030\\]\\!:where(.dark, .dark *):not(:where(.dark .light, .dark .light *)) {
        background-color: rgba(0, 190, 152, 0.12) !important;
        border: 1px solid rgba(0, 190, 152, 0.25) !important;
      }
      #stage-slideover-sidebar {
        background-color: var(--pg-dark-900) !important;
        color: var(--pg-light-400) !important;
      }
      nav[aria-label="Chat history"] {
        background: var(--pg-dark-900) !important;
      }
      #stage-slideover-sidebar aside,
      #stage-slideover-sidebar .bg-(--sidebar-mask-bg,var(--bg-elevated-secondary)) {
        background-color: var(--pg-dark-900) !important;
      }
      #stage-slideover-sidebar .text-token-text-primary,
      #stage-slideover-sidebar .text-token-text-secondary,
      #stage-slideover-sidebar .text-token-text-tertiary,
      #stage-slideover-sidebar .truncate,
      #stage-slideover-sidebar a {
        color: var(--pg-light-400) !important;
      }
      #stage-slideover-sidebar [data-active],
      #stage-slideover-sidebar [aria-current="page"],
      #stage-slideover-sidebar [data-active] .truncate,
      #stage-slideover-sidebar [data-active] span {
        color: var(--pg-light-100) !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      #stage-slideover-sidebar [data-active].__menu-item,
      #stage-slideover-sidebar [aria-current="page"].__menu-item {
        background: transparent !important;
      }
      [data-composer-surface="true"] {
        background: var(--pg-dark-700) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      #prompt-textarea,
      #prompt-textarea p,
      .ProseMirror {
        color: var(--pg-light-100) !important;
      }
      #prompt-textarea .placeholder,
      #prompt-textarea [data-placeholder] {
        color: var(--pg-light-400) !important;
      }
      #thread-bottom-container,
      #thread-bottom-container .bg-token-main-surface-primary,
      #thread-bottom-container .bg-token-bg-primary,
      #thread-bottom-container .bg-token-bg-secondary,
      #thread-bottom-container .bg-token-bg-tertiary,
      #thread-bottom-container [data-composer-surface="true"] {
        background-color: var(--pg-dark-900) !important;
      }
      #thread-bottom-container button,
      #thread-bottom-container .composer-btn {
        color: var(--pg-light-200) !important;
      }
      #thread-bottom-container .composer-submit-button-color {
        background: var(--pg-beaker-500) !important;
        color: #001912 !important;
      }
      .content-fade::after,
      .content-fade.single-line::after {
        background: none !important;
        content: none !important;
      }
    `
    document.head.insertAdjacentHTML("beforeend", `<style id="pg-site-theme">${css}</style>`)
  }

  function setupLinkOverrides() {
    if (window.pgLinkOverridesReady) return
    window.pgLinkOverridesReady = true

    const sanitizeUrl = href => {
      try {
        const url = new URL(href, window.location.href)
        if (url.searchParams.has("utm_source")) {
          url.searchParams.delete("utm_source")
        }
        return url.toString()
      } catch (error) {
        return href
      }
    }

    const updateLink = link => {
      const href = link.getAttribute("href")
      if (!href || href.startsWith("#")) return
      let url
      try {
        url = new URL(href, window.location.href)
      } catch (error) {
        return
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return
      if (url.searchParams.has("utm_source")) {
        url.searchParams.delete("utm_source")
      }
      link.setAttribute("href", url.toString())
      link.setAttribute("target", "_blank")
      link.setAttribute("rel", "noopener noreferrer")
    }

    const updateAllLinks = root => {
      const scope = root || document
      scope.querySelectorAll("a[href]").forEach(updateLink)
    }

    updateAllLinks(document)

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          if (node.matches?.("a[href]")) updateLink(node)
          if (node.querySelectorAll) updateAllLinks(node)
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    document.addEventListener(
      "click",
      event => {
        const link = event.target.closest("a[href]")
        if (!link) return
        const href = link.getAttribute("href")
        if (!href) return
        let url
        try {
          url = new URL(href, window.location.href)
        } catch (error) {
          return
        }
        if (url.protocol !== "http:" && url.protocol !== "https:") return
        url = new URL(sanitizeUrl(url.toString()))
        if (url.origin === window.location.origin) return
        event.preventDefault()
        event.stopPropagation()
        window.open(url.toString(), "_blank", "noopener,noreferrer")
      },
      true,
    )
  }

  function extractMessageMarkdown(messageEl) {
    if (!messageEl) return ""
    const role = messageEl.getAttribute("data-message-author-role")
    const userContent = messageEl.querySelector(".whitespace-pre-wrap")
    if (role === "user" && userContent) {
      return (userContent.innerText || userContent.textContent || "").trim()
    }
    const markdownNode = messageEl.querySelector(".markdown") || messageEl
    const clone = markdownNode.cloneNode(true)
    clone.querySelectorAll("pre").forEach(pre => {
      const code = pre.querySelector("code")
      const codeText = (code?.innerText || pre.innerText || "").trimEnd()
      const wrapper = document.createElement("div")
      wrapper.textContent = `\n\`\`\`\n${codeText}\n\`\`\`\n`
      pre.replaceWith(wrapper)
    })
    clone.querySelectorAll("code").forEach(code => {
      if (code.closest("pre")) return
      const inlineText = (code.innerText || "").trim()
      const wrapper = document.createElement("span")
      wrapper.textContent = inlineText ? `\`${inlineText}\`` : ""
      code.replaceWith(wrapper)
    })
    return (clone.innerText || clone.textContent || "").trim()
  }

  function savePromptFromMessage(text, role, saveBtn) {
    const title = buildPromptTitle(text, role)
    const now = Date.now()
    const formattedDate = new Date(now).toLocaleString()
    const newPrompt = {
      id: `saved-${now}-${Math.floor(Math.random() * 100000)}`,
      title,
      text,
      description: `Saved on ${formattedDate}`,
      folder: "Saved",
      tags: [],
      createdAt: now,
      updatedAt: now,
    }

    chrome.storage.local.get({ currentPrompts: [] }, ({ currentPrompts }) => {
      const nextPrompts = Array.isArray(currentPrompts) ? [...currentPrompts] : []
      nextPrompts.push(newPrompt)
      chrome.storage.local.set({ currentPrompts: nextPrompts }, () => {
        window.pgPanelPrompts = nextPrompts
        if (Array.isArray(prompts)) prompts.push(newPrompt)
        renderFloatingPanel()
        if (saveBtn) {
          saveBtn.classList.add("pg-saved")
          saveBtn.querySelector("span").textContent = "Saved"
          setTimeout(() => {
            saveBtn.classList.remove("pg-saved")
            saveBtn.querySelector("span").textContent = "Save"
          }, 1600)
        }
      })
    })
  }

  function buildPromptTitle(text, role) {
    const clean = text
      .replace(/\s+/g, " ")
      .replace(/^#+\s*/g, "")
      .trim()
    const base = clean.split(/[.\n]/).find(part => part.trim().length > 0) || clean
    const clipped = base.slice(0, 60).trim()
    const prefix = role === "assistant" ? "Assistant" : "User"
    return clipped ? clipped : `${prefix} prompt`
  }

  function toggleFloatingPanel(forceOpen) {
    const panel = document.getElementById("pg-floating-panel")
    const button = document.getElementById("pg-floating-button")
    if (!panel || !button) return
    const isOpen = window.pgPanelOpen === true
    const nextState = typeof forceOpen === "boolean" ? forceOpen : !isOpen
    panel.style.display = nextState ? "flex" : "none"
    window.pgPanelOpen = nextState
    button.setAttribute("aria-expanded", String(nextState))
    if (!nextState) {
      closePromptEditor()
    }
  }

  function renderFloatingPanel() {
    const promptsList = Array.isArray(window.pgPanelPrompts) ? window.pgPanelPrompts : []
    const tabsEl = document.getElementById("pg-panel-tabs")
    const listEl = document.getElementById("pg-panel-list")
    if (!tabsEl || !listEl) return

    const tags = getTagTabs(promptsList)
    if (!tags.includes(window.pgPanelActiveTab)) window.pgPanelActiveTab = "All"

    tabsEl.innerHTML = ""
    tags.forEach(tag => {
      const tab = document.createElement("button")
      tab.className = `pg-panel-tab${tag === window.pgPanelActiveTab ? " pg-active" : ""}`
      tab.setAttribute("data-folder", tag)
      tab.textContent = tag
      tabsEl.appendChild(tab)
    })

    listEl.innerHTML = ""
    const activeTag = window.pgPanelActiveTab
    const normalizedSearch = (window.pgPanelSearchTerm || "").trim().toLowerCase()
    const filtered = promptsList.filter(prompt => {
      const promptTags = getPromptTags(prompt)
      const tagMatch =
        activeTag === "All" ||
        promptTags.map(tag => tag.toLowerCase()).includes(activeTag.toLowerCase())
      if (!tagMatch) return false
      if (!normalizedSearch) return true
      const title = (getPromptTitle(prompt) || "").toLowerCase()
      const text = (getPromptText(prompt) || "").toLowerCase()
      const tagsJoined = promptTags.join(" ").toLowerCase()
      return (
        title.includes(normalizedSearch) ||
        text.includes(normalizedSearch) ||
        tagsJoined.includes(normalizedSearch)
      )
    })
    const sorted = filtered
      .slice()
      .sort((a, b) => getPromptCreatedAt(b) - getPromptCreatedAt(a))

    if (sorted.length === 0) {
      const empty = document.createElement("div")
      empty.className = "pg-panel-empty"
      empty.textContent = "No prompt templates yet."
      listEl.appendChild(empty)
      return
    }

    sorted.forEach(prompt => {
      const card = document.createElement("div")
      card.className = "pg-prompt-card"
      card.setAttribute("data-prompt-id", prompt.id)
      const content = document.createElement("div")
      content.className = "pg-prompt-card-content"
      const title = document.createElement("div")
      title.className = "pg-prompt-title"
      title.textContent = prompt.title || "Untitled"
      content.appendChild(title)
      if (prompt.description) {
        const desc = document.createElement("div")
        desc.className = "pg-prompt-desc"
        desc.textContent = prompt.description
        content.appendChild(desc)
      }
      const tagList = getPromptTags(prompt)
      if (tagList.length > 0) {
        const tagWrap = document.createElement("div")
        tagWrap.className = "pg-prompt-tags"
        tagList.forEach(tag => {
          const tagPill = document.createElement("span")
          tagPill.className = "pg-prompt-tag"
          tagPill.textContent = tag
          tagWrap.appendChild(tagPill)
        })
        content.appendChild(tagWrap)
      }
      card.appendChild(content)
      const actions = document.createElement("div")
      actions.className = "pg-prompt-card-actions"
      const editBtn = document.createElement("button")
      editBtn.type = "button"
      editBtn.className = "pg-prompt-card-btn pg-prompt-card-edit"
      editBtn.setAttribute("data-prompt-action", "edit")
      editBtn.setAttribute("data-prompt-id", prompt.id)
      editBtn.textContent = "Edit"
      const injectBtn = document.createElement("button")
      injectBtn.type = "button"
      injectBtn.className = "pg-prompt-card-btn pg-prompt-card-inject"
      injectBtn.setAttribute("data-prompt-action", "inject")
      injectBtn.setAttribute("data-prompt-id", prompt.id)
      injectBtn.textContent = "Inject"
      actions.appendChild(editBtn)
      actions.appendChild(injectBtn)
      card.appendChild(actions)
      listEl.appendChild(card)
    })
  }

  function getPromptById(promptId) {
    return (window.pgPanelPrompts || []).find(item => String(item.id) === String(promptId))
  }

  function openPromptEditor(prompt) {
    window.pgPanelEditingId = prompt.id
    window.pgPanelEditingDirty = false
    const panel = document.getElementById("pg-floating-panel")
    const content = document.querySelector(".pg-panel-content")
    const backBtn = document.getElementById("pg-panel-back")
    const titleInput = document.getElementById("pg-editor-title")
    const textHost = document.getElementById("pg-editor-text")
    if (!panel || !content || !titleInput || !textHost) return
    panel.classList.add("pg-expanded")
    content.classList.add("pg-editor-open")
    backBtn.classList.add("pg-visible")
    titleInput.value = getPromptTitle(prompt)
    ensurePromptEditor(textHost, getPromptText(prompt))
    setEditorTags(getPromptTags(prompt))
    window.pgPanelEditingDirty = false
    window.pgPanelEditorView?.focus?.()
    hydratePromptEditor(prompt.id)
  }

  function closePromptEditor() {
    const panel = document.getElementById("pg-floating-panel")
    const content = document.querySelector(".pg-panel-content")
    const backBtn = document.getElementById("pg-panel-back")
    if (panel) panel.classList.remove("pg-expanded")
    if (content) content.classList.remove("pg-editor-open")
    if (backBtn) backBtn.classList.remove("pg-visible")
    window.pgPanelEditingId = null
    window.pgPanelEditingDirty = false
    window.pgPanelEditingTags = []
  }

  function savePromptEdits() {
    const titleInput = document.getElementById("pg-editor-title")
    const promptId = window.pgPanelEditingId
    if (!titleInput || !promptId) return
    const nextTitle = titleInput.value.trim() || "Untitled"
    const nextText = getPromptEditorValue()
    if (!nextText.trim()) return
    const nextTags = Array.isArray(window.pgPanelEditingTags) ? window.pgPanelEditingTags : []

    chrome.storage.local.get({ currentPrompts: [] }, ({ currentPrompts }) => {
      const updated = Array.isArray(currentPrompts) ? [...currentPrompts] : []
      const idx = updated.findIndex(item => String(item.id) === String(promptId))
      if (idx === -1) return
      updated[idx] = {
        ...updated[idx],
        title: nextTitle,
        text: nextText,
        tags: nextTags,
        updatedAt: Date.now(),
      }
      chrome.storage.local.set({ currentPrompts: updated }, () => {
        window.pgPanelPrompts = updated
        if (Array.isArray(prompts)) {
          const localIdx = prompts.findIndex(item => String(item.id) === String(promptId))
          if (localIdx !== -1) prompts[localIdx] = updated[idx]
        }
        renderFloatingPanel()
        closePromptEditor()
      })
    })
  }

  function deletePromptEdits() {
    const promptId = window.pgPanelEditingId
    if (!promptId) return
    chrome.storage.local.get({ currentPrompts: [] }, ({ currentPrompts }) => {
      const updated = Array.isArray(currentPrompts) ? [...currentPrompts] : []
      const next = updated.filter(item => String(item.id) !== String(promptId))
      chrome.storage.local.set({ currentPrompts: next }, () => {
        window.pgPanelPrompts = next
        if (Array.isArray(prompts)) {
          const localIdx = prompts.findIndex(item => String(item.id) === String(promptId))
          if (localIdx !== -1) prompts.splice(localIdx, 1)
        }
        renderFloatingPanel()
        closePromptEditor()
      })
    })
  }

  function hydratePromptEditor(promptId) {
    chrome.storage.local.get({ currentPrompts: [] }, ({ currentPrompts }) => {
      if (window.pgPanelEditingId !== promptId || window.pgPanelEditingDirty) return
      const source = Array.isArray(currentPrompts) ? currentPrompts : []
      const prompt = source.find(item => String(item.id) === String(promptId))
      if (!prompt) return
      const titleInput = document.getElementById("pg-editor-title")
      const textHost = document.getElementById("pg-editor-text")
      if (!titleInput || !textHost) return
      titleInput.value = getPromptTitle(prompt)
      ensurePromptEditor(textHost, getPromptText(prompt))
      setEditorTags(getPromptTags(prompt))
      window.pgPanelEditingDirty = false
    })
  }

  function getPromptTitle(prompt) {
    if (!prompt) return ""
    return prompt.title || prompt.name || ""
  }

  function getPromptText(prompt) {
    if (!prompt) return ""
    return (
      prompt.text ||
      prompt.prompt ||
      prompt.content ||
      prompt.markdown ||
      prompt.body ||
      ""
    )
  }

  function getPromptTags(prompt) {
    if (!prompt) return []
    if (Array.isArray(prompt.tags)) return prompt.tags.filter(Boolean)
    if (typeof prompt.tags === "string") {
      return prompt.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
    }
    return []
  }

  function getPromptCreatedAt(prompt) {
    if (!prompt) return 0
    const candidates = [
      prompt.createdAt,
      prompt.addedAt,
      prompt.savedAt,
      prompt.updatedAt,
    ]
    for (const value of candidates) {
      const numeric =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number.parseInt(value, 10)
            : null
      if (Number.isFinite(numeric)) return numeric
    }
    const id = String(prompt.id || "")
    const match = /saved-(\d{10,})/.exec(id)
    if (match) {
      const parsed = Number.parseInt(match[1], 10)
      if (Number.isFinite(parsed)) return parsed
    }
    return 0
  }

  function setEditorTags(tags) {
    window.pgPanelEditingTags = Array.isArray(tags) ? [...tags] : []
    renderEditorTags()
  }

  function addEditorTag(value) {
    const trimmed = String(value || "").trim()
    if (!trimmed) return
    const next = Array.isArray(window.pgPanelEditingTags) ? window.pgPanelEditingTags : []
    if (next.map(tag => tag.toLowerCase()).includes(trimmed.toLowerCase())) return
    next.push(trimmed)
    window.pgPanelEditingTags = next
    window.pgPanelEditingDirty = true
    renderEditorTags()
  }

  function removeEditorTag(tag) {
    const next = Array.isArray(window.pgPanelEditingTags) ? window.pgPanelEditingTags : []
    window.pgPanelEditingTags = next.filter(item => item !== tag)
    window.pgPanelEditingDirty = true
    renderEditorTags()
  }

  function renderEditorTags() {
    const tagListEl = document.getElementById("pg-editor-tag-list")
    if (!tagListEl) return
    tagListEl.innerHTML = ""
    const tags = Array.isArray(window.pgPanelEditingTags) ? window.pgPanelEditingTags : []
    tags.forEach(tag => {
      const tagEl = document.createElement("span")
      tagEl.className = "pg-editor-tag"
      tagEl.textContent = tag
      const removeBtn = document.createElement("button")
      removeBtn.type = "button"
      removeBtn.setAttribute("data-tag-remove", tag)
      removeBtn.textContent = "×"
      tagEl.appendChild(removeBtn)
      tagListEl.appendChild(tagEl)
    })
  }

  function getTagTabs(promptsList) {
    const tagSet = new Set()
    tagSet.add("All")
    promptsList.forEach(prompt => {
      getPromptTags(prompt).forEach(tag => {
        if (tag) tagSet.add(tag)
      })
    })
    return Array.from(tagSet)
  }

  function insertPromptFromPanel(promptText) {
    const vars = findVariables(promptText)
    if (vars.length > 0) {
      getVarsFromModal(vars, promptText, resolved => applyPromptToInput(resolved))
      return
    }
    applyPromptToInput(promptText)
  }

  function applyPromptToInput(promptText) {
    const chatInput = document.getElementById("prompt-textarea")
    if (!chatInput) return
    const existing = chatInput.value || ""
    const separator = existing.trim().length > 0 ? "\n" : ""
    chatInput.value = `${existing}${separator}${promptText}`
    chatInput.dispatchEvent(new Event("input", { bubbles: true }))
    chatInput.focus()
  }

  function removeSuggestion() {
    const suggestionElement = document.querySelector(".suggestions")
    if (suggestionElement) {
      suggestionElement.remove()
    }
  }

  function getSuggestedPrompts(searchTerm) {
    let filtered = prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort the filtered prompts - thanks gpt-4
    if (searchTerm !== "") {
      filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()
        const searchTermLower = searchTerm.toLowerCase()

        if (aTitle.startsWith(searchTermLower) && !bTitle.startsWith(searchTermLower)) {
          return -1
        } else if (!aTitle.startsWith(searchTermLower) && bTitle.startsWith(searchTermLower)) {
          return 1
        } else {
          return aTitle.localeCompare(bTitle)
        }
      })
    }

    const html = `
        <div id="suggestions" class="w-full suggestions" style="position: relative">
            <ul id="scrollSuggest" class="bg-white dark:bg-gray-700" style="border-color: rgba(0,0,0,.1); border-radius: 15px; border-width: 1px; font-size: .875rem; line-height: 1.25rem; color: rgb(255 255 255); box-sizing: border-box; list-style: none; margin: 0; padding: 0; z-index: 1; max-height: 13rem; width: 100%; overflow: auto; ">
                ${filtered
                  .map(
                    (prompt, idx) => `
                <li data-idx="${idx}" data-prompt-id4="${prompt.id}" class="cursor-pointer dark:bg-gray-700 pg-suggestion px-3 py-2 text-sm text-black dark:text-white">${prompt.title}</li>
                `,
                  )
                  .join("")}
            </ul>
        </div>
        `
    textDiv.parentElement.parentElement.parentElement.insertAdjacentHTML("beforebegin", html)
    const suggestions = document.querySelectorAll(".pg-suggestion")
    suggestions.forEach(s =>
      s.addEventListener("mouseenter", () => focusEl(s.getAttribute("data-idx"))),
    )
    suggestions.forEach(s =>
      s.addEventListener("mouseup", () =>
        selectPrompt(prompts.find(prompt => prompt.id === s.getAttribute("data-prompt-id4"))?.text),
      ),
    )
  }

  function chatInputEvents() {
    document.addEventListener("keyup", autoComplete, { capture: true })
    document.addEventListener("keydown", preventEnter, { capture: true })
    document.addEventListener("keypress", preventEnter, { capture: true })
  }
  chatInputEvents()

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "c_use_prompt") {
      setTimeout(() => selectPrompt(request.prompt), 1200)
    }
  })

  function checkTextBoxDefault() {
    // detects when page has changed
    if (document.getElementById("prompt-textarea").placeholder !== placeholder) {
      let suggestions = document.getElementById("suggestions")
      function remove() {
        if (suggestions) suggestions.remove()
      }
      setTimeout(remove, 300)
      clearInterval(textBoxInterval)
      main(prompts)
    }
  }
  const textBoxInterval = setInterval(checkTextBoxDefault, 1000)
}
async function wrapper() {
  const { currentPrompts } = await chrome.storage.local.get({ currentPrompts: [] })
  setTimeout(() => main(currentPrompts), 500)
}
wrapper()
