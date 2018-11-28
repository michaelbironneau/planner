// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default reorder;

export const reorderTaskMap = ({ taskMap, source, destination }) => {
  const current = [...taskMap[source.droppableId]];
  const next = [...taskMap[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);
    const result = {
      ...taskMap,
      [source.droppableId]: reordered
    };
    return {
      taskMap: result
    };
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);
  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...taskMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    taskMap: result
  };
};
