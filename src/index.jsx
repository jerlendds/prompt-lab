import "preact/debug"
import { render } from "preact"
import App from "./App.jsx"
import "./i18n/init"
import "./index.css"

render(<App />, document.getElementById("root"))
