import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useEffect } from 'react';
import Droppy from './drag';
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


    const [loaded, setLoaded] = useState(false)


    const [state, setState]= useState({})

    const MAPPER = {
        1: "low",
        2: "high",
        3: "any",
        4: "done",
    }

    //! working hererererererer

    //!fdsfsdfsdfsdfdsfdsfdsf
    //!d
    //!fsfadsfsdafsdafsadfdsaf
    useEffect( () => { 
        //need to make requests here    
        const getData =  async() =>{
            if (!loaded){
                await axios.get(`${link}/tasks`, {headers: {Authorization: `Bearer ${sessionStorage.accessToken}`}}, {withCredentials: true})
                .then(res =>{
                    //TODO how do i work with this data?
                    let tasks = res.data.tasks
                    
                    let newState = {
                        low:[],
                        high:[],
                        any:[],
                        done:[]
                    }

                    

                    for(let i = 0; i < tasks.length; i++){
                        if (tasks[i].urgency == null){
                            //! testing push toall 
                            newState[MAPPER[1]].push(tasks[i])
                            continue;
                        }
                        newState[MAPPER[tasks[i].urgency]].push(tasks[i])

                        
                    }


                    console.log(newState);
                    setState(newState);
                    setLoaded(true);
                })
                .catch(e => {
                    console.log("THERE WAS AN ERROR" + e)
                })
            }
        }

        getData();

        
    }, [])


    const [data, setData] = useState([])

    useEffect( () => {

        const update = async() => {
            if(loaded && Object.keys(state).length > 0){
            console.log("WE ARE UPDATED");
            const link = import.meta.env.VITE_LINK

            let data2 = []

            const keys = ['low', 'high', 'any', 'done'];

            keys.forEach((key, ind) => { 
                if (state[key]) {
                    state[key].forEach((task, taskIndex) =>{
                        const urgency = task.urgency == null ? ind+1 : task.urgency;
                        data2.push({task_id: task.task_id, urgency: urgency, index : taskIndex});
                    })
                }
            })

            await axios.put(`${link}/tasks`, data2, {headers: {Authorization : `Bearer ${sessionStorage.accessToken}`}, withCredentials:true})
            }
            
        }
        update();
    }, [state])


    // const [state, setState] = useState({
    //     items:getItems(10),
    //     selected:getItems(5,10),
    //     hehe:getItems(5,15)
    // });

    const id2List = {
        //ids for two lists
        droppable: 'low',
        droppable2: 'high',
        droppable3: "any"
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
                newState = {...state, low: items };
            }
            //now state only updates the second one
            if (source.droppableId === 'droppable2') {
                newState = {...state, high: items };
            }

            if (source.droppableId == 'droppable3') {
                newState = {...state, any:items}
            }
            
            //will update with state
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
                low: result.low,
                high: result.high,
                any: result.any
            });
        }
    };


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppy id="droppable"  state={state.low || []}/>
            <Droppy id="droppable2" state={state.high || []}/>
            <Droppy id="droppable3" state={state.any || []}/>
            {/* <Droppy /> */}
        </DragDropContext>
    )

}

export default Item

