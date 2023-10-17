import React, { useEffect,useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Search() {
  const appDispatch=useContext(DispatchContext)

  const[state,setState]=useImmer({
    searchTerm:" ",
    results:[],
    show:"neither",
    requestCount:0 
  })
  //"useImmer" is another hook used in react which can be seen as middle of "useState" and "useImmerReducer".
  //For it we define the "initial state" as given above and update the "initial state" using "dispatch".

  useEffect(()=>{
    if(state.searchTerm.trim()){
      setState(draft=>{
        draft.show="loading" 
      })
      const delay=setTimeout(()=>{
        setState(draft=>{
          draft.requestCount++
        })
      },750)
      //"setTimeout" has two parameters,first is function(here we have used an arrow function) and second is the "delay" which we want.The above line of code will get run everytime when the "state of searchTerm" changes and when this happens so we are logging into the console for each charecter we write but every "keypress" gets delayed by 3000 ms.
      //But we dont want to send the request to the server again and again for every keypress as it will be very tedious job so for it we will use "cleanup" function.
  
      //"cleanup" function
      return ()=>clearTimeout(delay)
  
      //So lets see what is happening overall:suppose if a user types a charecter so state of "searchTerm" will get update and then the "useEffect" will get run and if user types another charecter so again the state of "searchTerm" will get update and this time "cleanup" function will get run and then the "useEffect" will only get run when user have stopped typing for 3000 ms.
      //Now as soon as the useEffect gets run so we will update the state of "requestCount"(increment it) and due which another "useEffect" will get trigger(given below) where we will send an "Axios" request.

    }else{
      setState(draft=>{
        draft.show="neither"
      })
    }
  },[state.searchTerm])

  useEffect(()=>{
    if(state.requestCount){
      const ourRequest=Axios.CancelToken.source()
      // This line creates a cancel token using "Axios".It's used for the purpose of canceling the "HTTP" request if needed.
      async function fetchResults(){
        try{
          const response=await Axios.post("/search",{searchTerm:state.searchTerm},{CancelToken:ourRequest.token})
          setState(draft=>{
            draft.results=response.data
            draft.show="results"
          }) 
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return ()=>ourRequest.cancel()
      // This is the "cleanup" function that is returned by the "useEffect". It cancels the "Axios" request using "ourRequest.cancel()" when the component unmounts. This is important for cleaning up any ongoing requests and preventing memory leaks when the component is no longer in use.
    }
  },[state.requestCount])

  useEffect(()=>{
    document.addEventListener("keyup",searchKeyPressHandler)
    // this line adds an event listener to the entire document. It listens for the "keyup" event and calls the "searchKeyPressHandler" function when a "keyup" event occurs.
    return ()=>document.removeEventListener("keyup",searchKeyPressHandler)
    // This is the cleanup function returned by the useEffect. It removes the event listener added previously. When the component unmounts or when the dependencies in the [] array change (which is not the case here, as it's an empty array), React will automatically call this cleanup function.
  },[])

  function searchKeyPressHandler(e){
    if(e.keyCode==27){
      appDispatch({type:"closeSearch"})
    }
  }

  function handleInput(e){
    const value=e.target.value
    setState(draft=>{
      draft.searchTerm=value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={()=>appDispatch({type:"closeSearch"})} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">

          <div className={"circle-loader " + (state.show=="loading" ? "circle-loader--visible" : "")}></div>
          {/* Note:"circle-loader" is invisible by default */}
          <div className={"live-search-results " + (state.show=="results" ? "live-search-results--visible" : "")}>

            {Boolean(state.results.length) && (

              <div className="list-group shadow-sm">
              <div className="list-group-item active"><strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)</div>
              {state.results.map(post=>{
                return <Post post={post} key={post._id} onClick={()=>appDispatch({type:"closeSearch"})} />
                //In above line,we are giving "props or properties" of "Search" component to "Post" component so that these "props or properties" can be used in "post" component whenever we want.
              })}
            </div>
            )}
             
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">sorry,we could not find any results for that search.</p> }

          </div>
        </div>
      </div>
    </div>
  )
}

export default Search