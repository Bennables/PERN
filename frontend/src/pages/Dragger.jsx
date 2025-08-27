import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useEffect } from 'react';
import Droppy from '../components/drag';
import axios from 'axios';

// fake data generator
//TODO put data from db into here
// reqs: each data will have a location(list), an index(in list), and content
const getItems = (count, offset = 0) =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `item-${k + offset}`,
        content: `item ${k + offset}`
    }));


/**
 * Moves an item from one list to another list.
 */


/* 

* THESE SHOULD WORK FINE WITH MULTIPLE LISTS



*/
const move = (source, destination, droppableSource, droppableDestination, state, id2List) => {

    
    //copy boht lists
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);

    //remove and add in
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);

    //updating values
    const result = {...state};
    result[id2List[droppableSource.droppableId]] = sourceClone;
    result[id2List[droppableDestination.droppableId]] = destClone;

    console.log(result);
    return result;
};

const grid = 8;

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



//reorder helper:
const reorder = (list, startIndex, endIndex) => {
    //copy
    const result = Array.from(list);
    //remove original
    const [removed] = result.splice(startIndex, 1);
    //no removals, just insert into new
    result.splice(endIndex, 0, removed);

    return result;
}

const Item = () =>{

    const link = import.meta.env.VITE_LINK



    useEffect( () => { 
        //need to make requests here    

        axios.get(`${link}/tasks`, {headers: {Authorization: `Bearer ${sessionStorage.accessToken}`}})
        .then(data =>{
            //TODO how do i work with this data?
            console.log(data);
        })
        .catch(e => {
            console.log("THERE WAS AN ERROR" + e)
        })
    }, [])



    const [state, setState] = useState({
        items:getItems(10),
        selected:getItems(5,10),
        hehe:getItems(5,15)
    });

    const [tasks, setTasks] = useState([]);
    const id2List = {
        //ids for two lists
        droppable: 'items',
        droppable2: 'selected',
        droppable3: "hehe"
    };

    // this grabs the associated list in state
    const getList = id => state[id2List[id]];

    const onDragEnd = result =>{
        const {source, destination} = result;

        if (!destination) { 
            return;
        }

        //if it drops in the same container
        //todo more logic required here
        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                getList(source.droppableId),
                source.index,
                destination.index
            );

            //! this part only works with components (extends component)
            //! they can merge setstates, usually, they just replace
            //update, by default assumes you're updating items

            // console.log("STATET IS" + state);

            let newState= {};
            if (source.droppableId === 'droppable') {
                newState = {...state, items: items };
            }
            //now state only updates the second one
            if (source.droppableId === 'droppable2') {
                newState = {...state, selected: items };
            }

            if (source.droppableId == 'droppable3') {
                newState = {...state, hehe:items}
            }
            
            //will update with state

            console.log("STATET IS");
            console.log(state);
            setState(newState);
        } else {
            const result = move(
                getList(source.droppableId),
                getList(destination.droppableId),
                source,
                destination,
                state,
                id2List
            );

            setState({
                items: result.items,
                selected: result.selected,
                hehe: result.hehe
            });
        }
    };


    console.log(state);
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppy id="droppable"state = {state.items}/>
            <Droppy id="droppable2" state={state.selected}/>
            <Droppy id="droppable3" state={state.hehe}/>
            {/* <Droppy /> */}
        </DragDropContext>
    )

}

export default Item

