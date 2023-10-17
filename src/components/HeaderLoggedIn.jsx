import React, { useEffect, useContext} from "react"
import {Link} from "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import {Tooltip as ReactTooltip} from 'react-tooltip'

function HeaderLoggedIn(props) {
  const appDispatch=useContext(DispatchContext)
  const appState=useContext(StateContext)

  function handleLogout(){
    appDispatch({type:"logout"})
    appDispatch({type:"flashMessage",value:"You have successfully logged out."})
  }
  function handleSearchIcon(e){
    e.preventDefault()
    appDispatch({type:"openSearch"})
  }

  return (
    <div className="flex-row my-3 my-md-0">
          <a data-tooltip-id="search" data-tooltip-content="Search" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
            <i className="fas fa-search"></i>
          </a>

          <ReactTooltip place="bottom" id="search" className="custom-tooltip" />

          {" "}

          <span onClick={()=>appDispatch({type:"toggleChat"})} data-tooltip-id="chat" data-tooltip-content="Chat" 
          // We are using our "appDispatch" to use the case of "toggleChat"
          className={"mr-2 header-chat-icon "+ (appState.unreadChatCount ? "text-danger" : "text-white")}>
            {/* Here we are using "ternary" operator to check whether "chat" count of unread messages is zero or not and if it is zero(ie true) then we will have "className" as "text-danger" otherwise "text-white" */}
            <i className="fas fa-comment"></i>
            {appState.unreadChatCount ? 
            <span className="chat-count-badge text-white">
              {appState.unreadChatCount<10 ? appState.unreadChatCount:"9+"}
            </span>:"" }
            {/* Here we have used two ternary operators,the first one includes "number" over chat icon that how many "unread" messages do we have and second one says that if count of "unread" messages is more than 9 so we need to display "9+" otherwise we need to display exact "number" of unread messages.
            The reason behind second "ternary operator" is that if there is big number so it can be displayed over small "chat icon" */}
          </span>

          <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />

          {" "}

          <Link data-tooltip-id="profile" data-tooltip-content="My Profile" to={`/profile/${appState.user.username}`} className="mr-2">
            <img className="small-header-avatar" src={appState.user.avatar}/>
          </Link>

          <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />

          {" "}

          <Link className="btn btn-sm btn-success mr-2" to="/create-post">
            Create Post
          </Link>

          {" "}
          
          <button onClick={handleLogout} className="btn btn-sm btn-secondary">
            Sign Out
          </button>
        </div>
  )
}

export default HeaderLoggedIn