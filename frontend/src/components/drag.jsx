import axios from "axios"
import { useState } from "react";
import { useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

       
       



const Droppy = (props) => { 

    const link = import.meta.env.VITE_LINK;

    const grid = 8;

    const state = props.state

    const [tasks, setTasks] = useState([])

    const getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: grid * 2,
        margin: `0 0 ${grid}px 0`,

        // change background colour if dragging
        background: isDragging ? 'lightgreen' : 'grey',

        // styles we need to apply on draggables
        ...draggableStyle
    });

    const getListStyle = isDraggingOver => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
        padding: grid,
        width: 250
    });


    if (!state) { 
        console.log("ERROR WAS ON THIS PROP " + props.id)
    }

    return (
        <div>
            <Droppable droppableId={props.id}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}>
                    
                    {props.state.map((item, index) => (
                        <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                        snapshot.isDragging,
                                        provided.draggableProps.style
                                    )}>
                                    {item.content}
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
        </div>
    )
}

export default Droppy;