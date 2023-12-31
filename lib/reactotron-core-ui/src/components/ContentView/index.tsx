import React from "react"
import styled from "styled-components"
import makeTable from "../../utils/makeTable"
import isShallow from "../../utils/isShallow"
import TreeView from "../TreeView"

const NullContainer = styled.div`
  color: ${(props) => props.theme.tag};
`
const UndefinedContainer = styled.div`
  color: ${(props) => props.theme.tag};
`
const StringContainer = styled.div`
  color: ${(props) => props.theme.foreground};
  user-select: text;
  cursor: text;
`
const StringLineSpan = styled.span``

interface Props {
  // value: object | string | number | boolean | null | undefined
  value: any
  treeLevel?: number
}

export default function ContentView({ value, treeLevel }: Props) {
  if (value === null) return <NullContainer>null</NullContainer>
  if (value === undefined) return <UndefinedContainer>undefined</UndefinedContainer>

  let checkValue
  try {
    checkValue = JSON.parse(value)
  } catch {
    checkValue = value
  }

  if (typeof checkValue === "string") {
    return (
      <StringContainer>
        {value
          .trim()
          .split("\\n")
          .map((part, idx) => (
            <StringLineSpan key={`span-${idx}`}>
              {part}
              <br />
            </StringLineSpan>
          ))}
      </StringContainer>
    )
  }

  if (typeof checkValue === "object") {
    return isShallow(checkValue) ? (
      makeTable(checkValue)
    ) : (
      <TreeView value={checkValue} level={treeLevel} />
    )
  }

  return <StringContainer>{String(checkValue)}</StringContainer>
}
