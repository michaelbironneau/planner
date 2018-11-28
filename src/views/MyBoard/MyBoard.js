// @flow
import React, { Component } from "react";
import styled from "react-emotion";
import { action } from "@storybook/addon-actions";
import addons, { mockChannel } from "@storybook/addons";

import { DragDropContext } from "react-beautiful-dnd";
import QuoteList from "./QuoteList";
import { colors, grid } from "./constants";
import { reorderQuoteMap } from "./reorder";
import { quotes } from "./quotes";

addons.setChannel(mockChannel());

const publishOnDragStart = action("onDragStart");
const publishOnDragEnd = action("onDragEnd");

const Root = styled("div")`
  //background-color: ${colors.blue.deep};
  box-sizing: border-box;
  padding: ${grid * 2}px;
  min-height: 100vh;

  /* flexbox */
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Column = styled("div")`
  margin: 0 ${grid * 2}px;
`;

const HorizontalScrollContainer = styled("div")`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  //background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  //max-width: 400px;
  overflow: auto;
`;

const VerticalScrollContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  max-height: 800px;
  overflow: auto;
`;

const PushDown = styled("div")`
  height: 200px;
`;

const initialQuotes = {
  todo: quotes.slice(0, 4),
  inprog: quotes.slice(4, 6),
  done: quotes.slice(6, 9)
};

export default class QuoteApp extends Component {
  /* eslint-disable react/sort-comp */

  state = {
    //quoteMap: this.props.initial
    quoteMap: initialQuotes
  };

  onDragStart = initial => {
    publishOnDragStart(initial);
    // this.setState({
    //   disabledDroppable: this.getDisabledDroppable(initial.source.droppableId),
    // });
  };

  onDragEnd = result => {
    publishOnDragEnd(result);

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    this.setState(
      reorderQuoteMap({
        quoteMap: this.state.quoteMap,
        source,
        destination
      })
    );
  };

  // TODO
  getDisabledDroppable = sourceDroppable => {
    if (!sourceDroppable) {
      return null;
    }

    const droppables = ["alpha", "beta", "gamma", "delta"];
    const sourceIndex = droppables.indexOf(sourceDroppable);
    const disabledDroppableIndex = (sourceIndex + 1) % droppables.length;

    return droppables[disabledDroppableIndex];
  };

  render() {
    const { quoteMap } = this.state;
    const disabledDroppable = "TODO";

    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <Root className="list-container">
          <HorizontalScrollContainer>
            <Column>
              <QuoteList
                title="Todo"
                listId="todo"
                listType="card"
                isDropDisabled={disabledDroppable === "todo"}
                quotes={quoteMap.todo}
              />
            </Column>
            <Column>
              <QuoteList
                title="In Progress"
                listId="inprog"
                listType="card"
                isDropDisabled={disabledDroppable === "inprog"}
                quotes={quoteMap.inprog}
              />
            </Column>
            <Column>
              <QuoteList
                title="Done"
                listId="done"
                listType="card"
                isDropDisabled={disabledDroppable === "done"}
                quotes={quoteMap.done}
              />
            </Column>
          </HorizontalScrollContainer>
        </Root>
      </DragDropContext>
    );
  }
}
