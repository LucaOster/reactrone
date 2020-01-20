// TODO: Name this better...
import React, { FunctionComponent } from "react"

import { ReactotronProvider, Command } from "./contexts/Reactotron"
import { TimelineProvider } from "./contexts/Timeline"
import { StateProvider } from "./contexts/State"
import { CustomCommandsProvider } from "./contexts/CustomCommands"
import { ReactNativeProvider } from "./contexts/ReactNative"

interface Props {
  commands: Command[]
  addCommandListener: (callback: (command: Command) => void) => void
}

const ReactotronBrain: FunctionComponent<Props> = ({ commands, addCommandListener, children }) => {
  return (
    <ReactotronProvider commands={commands} addCommandListener={addCommandListener}>
      <TimelineProvider>
        <StateProvider>
          <CustomCommandsProvider>
            <ReactNativeProvider>{children}</ReactNativeProvider>
          </CustomCommandsProvider>
        </StateProvider>
      </TimelineProvider>
    </ReactotronProvider>
  )
}

export default ReactotronBrain
