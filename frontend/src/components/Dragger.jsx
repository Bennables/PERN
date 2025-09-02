import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useEffect } from 'react';
import Droppy from './drag';
import axios from 'axios';
import { useNavigate } from 'react-router';

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
    const nav = useNavigate(); // ✅ CORRECT: Hook at top level

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
                .catch(async err =>{
                    if(err.response.data.message == 'token expired'){
                        await axios.get(`${link}/auth/refresh`, {withCredentials: true})
                            .then(res =>{
                                console.log(res);   
                                console.log("WE're getting here successfully" ) 
                                sessionStorage.setItem("accessToken", res.data.token)   
                            })
                            .catch(err => { 
                                console.log(err);
                                if (err.response && err.response.data && err.response.data.message == "token doesn't exist"){
                                    sessionStorage.removeItem('accessToken')
                                    nav(`/login`);
                                }
                            })
                    }
                    
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

            axios.put(`${link}/tasks`, data2, {headers: {Authorization : `Bearer ${sessionStorage.accessToken}`}, withCredentials:true})
            .then(res =>{
                console.log(res);
                }
            )
            .catch(async err =>{
                if(err.response.data.message == 'token expired'){
                    await axios.get(`${link}/auth/refresh`, {withCredentials: true})
                        .then(res =>{
                            console.log(res);   
                            console.log("WE're getting here successfully" ) 
                            sessionStorage.setItem("accessToken", res.data.token)   
                        })
                        .catch(err => { 
                            console.log(err);
                            if (err.response && err.response.data && err.response.data.message == "token doesn't exist"){
                                sessionStorage.removeItem('accessToken')
                                nav(`/login`);
                            }
                        })
                }
                
            }
            )
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


    if (!loaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Task Board</h1>
                            <p className="text-slate-600 mt-1">Organize your tasks by priority</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-slate-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-slate-700">
                                    {(state.low?.length || 0) + (state.high?.length || 0) + (state.any?.length || 0)} tasks
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Low Priority Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-green-50 border-b border-green-100 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <h2 className="text-lg font-semibold text-green-800">Low Priority</h2>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {state.low?.length || 0}
                                    </span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">Tasks that can be done when time permits</p>
                            </div>
                            <div className="p-4 min-h-[400px]">
                                <Droppy id="droppable" state={state.low || []} urgencyColor="green"/>
                            </div>
                        </div>

                        {/* High Priority Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <h2 className="text-lg font-semibold text-orange-800">High Priority</h2>
                                    </div>
                                    <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {state.high?.length || 0}
                                    </span>
                                </div>
                                <p className="text-orange-600 text-sm mt-1">Important tasks that need attention soon</p>
                            </div>
                            <div className="p-4 min-h-[400px]">
                                <Droppy id="droppable2" state={state.high || []} urgencyColor="orange"/>
                            </div>
                        </div>

                        {/* Any Priority Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <h2 className="text-lg font-semibold text-blue-800">Flexible</h2>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {state.any?.length || 0}
                                    </span>
                                </div>
                                <p className="text-blue-600 text-sm mt-1">Tasks that can be done at any time</p>
                            </div>
                            <div className="p-4 min-h-[400px]">
                                <Droppy id="droppable3" state={state.any || []} urgencyColor="blue"/>
                            </div>
                        </div>

                    </div>
                </DragDropContext>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-slate-500 text-sm">
                        Drag and drop tasks between sections to change their priority
                    </p>
                </div>
            </div>
        </div>
    )

}

export default Item

