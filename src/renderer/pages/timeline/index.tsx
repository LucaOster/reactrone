import React, { useContext } from "react"
import { clipboard } from "electron"
import fs from "fs"
import {
  Header,
  filterCommands,
  TimelineFilterModal,
  DispatchActionModal,
  timelineCommandResolver,
} from "reactotron-core-ui"
import { MdSearch, MdDeleteSweep, MdFilterList, MdSwapVert } from "react-icons/md"
import styled from "styled-components"

import ReactotronContext from "../../contexts/Reactotron"
import StandaloneContext from "../../contexts/Standalone"
import TimelineContext from "../../contexts/Timeline"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  flex: 1;
`

const TimelineContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  padding-top: 4px;
  padding-right: 10px;
`
const SearchLabel = styled.p`
  padding: 0 10px;
  font-size: 14px;
  color: ${props => props.theme.foregroundDark};
`
const SearchInput = styled.input`
  border-radius: 4px;
  padding: 10px;
  flex: 1;
  background-color: ${props => props.theme.backgroundSubtleDark};
  border: none;
  color: ${props => props.theme.foregroundDark};
  font-size: 14px;
`

function Timeline() {
  const { clearSelectedConnectionCommands } = useContext(StandaloneContext)
  const { commands } = useContext(ReactotronContext)
  const {
    isSearchOpen,
    toggleSearch,
    setSearch,
    search,
    isReversed,
    toggleReverse,
    openFilter,
    closeFilter,
    isFilterOpen,
    hiddenCommands,
    setHiddenCommands,
  } = useContext(TimelineContext)

  let filteredCommands = filterCommands(commands, search, hiddenCommands)

  if (isReversed) {
    filteredCommands = filteredCommands.reverse()
  }

  return (
    <Container>
      <Header
        title="Timeline"
        isDraggable
        actions={[
          {
            tip: "Search",
            icon: MdSearch,
            onClick: () => {
              toggleSearch()
            },
          },
          {
            tip: "Filter",
            icon: MdFilterList,
            onClick: () => {
              openFilter()
            },
          },
          {
            tip: "Reverse Order",
            icon: MdSwapVert,
            onClick: () => {
              toggleReverse()
            },
          },
          {
            tip: "Clear",
            icon: MdDeleteSweep,
            onClick: () => {
              clearSelectedConnectionCommands()
            },
          },
        ]}
      >
        {isSearchOpen && (
          <SearchContainer>
            <SearchLabel>Search</SearchLabel>
            <SearchInput value={search} onChange={e => setSearch(e.target.value)} />
          </SearchContainer>
        )}
      </Header>
      <TimelineContainer>
        {filteredCommands.map(command => {
          const CommandComponent = timelineCommandResolver(command.type)

          if (CommandComponent) {
            return (
              <CommandComponent
                key={command.id}
                command={command}
                copyToClipboard={clipboard.writeText}
                readFile={path => {
                  return new Promise((resolve, reject) => {
                    fs.readFile(path, "utf-8", (err, data) => {
                      if (err || !data) reject(new Error("Something failed"))
                      else resolve(data)
                    })
                  })
                }}
                // sendCommand={onSendCommand}
                // dispatchAction={dispatchAction}
                // openDispatchDialog={openDispatch}
              />
            )
          }

          return null
        })}
      </TimelineContainer>
      <TimelineFilterModal
        isOpen={isFilterOpen}
        onClose={() => {
          closeFilter()
        }}
        hiddenCommands={hiddenCommands}
        setHiddenCommands={setHiddenCommands}
      />
      {/* <DispatchActionModal
        isOpen={isDispatchOpen}
        initialValue={dispatchInitialAction}
        onClose={() => {
          closeDispatch()
        }}
        onDispatchAction={dispatchAction}
      /> */}
    </Container>
  )
}

export default Timeline
