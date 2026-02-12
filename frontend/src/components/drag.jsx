import axios from "axios"
import { useState } from "react";
import { useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

       
       



const Drag = (props) => { 
    const state = props.state;
    const urgencyColor = props.urgencyColor || 'blue';

    const colorMap = {
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            hover: 'hover:bg-green-100',
            dragging: 'bg-green-100',
            text: 'text-green-800'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200', 
            hover: 'hover:bg-orange-100',
            dragging: 'bg-orange-100',
            text: 'text-orange-800'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            hover: 'hover:bg-blue-100', 
            dragging: 'bg-blue-100',
            text: 'text-blue-800'
        }
    };

    const colors = colorMap[urgencyColor];

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: 'none',
        ...draggableStyle
    });

    const getListStyle = isDraggingOver => ({
        minHeight: '50px',
        transition: 'all 0.2s ease'
    });


    if (!state) { 
        console.log("ERROR WAS ON THIS PROP " + props.id)
    }

        return (
        <Droppable droppableId={props.id}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    className={`rounded-lg p-2 transition-colors duration-200 ${
                        snapshot.isDraggingOver ? colors.bg : ''
                    }`}>
                    
                    {state && state.length > 0 ? (
                        state.map((item, index) => (
                            <Draggable
                                key={item.task_id}
                                draggableId={item.task_id.toString()}
                                index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}
                                        className={`
                                            ${colors.bg} ${colors.border} ${colors.text}
                                            border rounded-lg p-4 mb-3 shadow-sm
                                            ${colors.hover} cursor-move
                                            transition-all duration-200 ease-in-out
                                            ${snapshot.isDragging ? 
                                                `${colors.dragging} shadow-lg transform rotate-2 scale-105` : 
                                                'hover:shadow-md'
                                            }
                                        `}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-sm leading-5 mb-1">
                                                    {item.task_name}
                                                </h3>
                                                {item.deadline && (
                                                    <p className="text-xs opacity-70">
                                                        Due: {new Date(item.deadline).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-2">
                                                <svg className="w-4 h-4 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))
                    ) : (
                        <div className={`${colors.bg} ${colors.border} ${colors.text} border-2 border-dashed rounded-lg p-0 text-center opacity-50`}>
                            <svg className="mx-auto h-8 w-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="text-sm font-medium">No tasks yet</p>
                            <p className="text-xs opacity-70 mt-1">Drag tasks here or create new ones</p>
                        </div>
                    )}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )
}

export default Drag;