import { original } from "immer"
import React, { useContext, useEffect,useRef } from "react"
import { useImmer, useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { Immer } from "immer"
import { Link } from "react-router-dom"
import io from "socket.io-client"

const socket=io("https://backend-file-lu6c.onrender.com")
//In case of "Axios" request the communication is one way ie "browser" sends request to "server" but here in case of "chat" feature we want communication to be two way and this is only possible through "socket.io-client".For this we need to set up things in backend as well as frontend.

function Chat() {
  const chatField=useRef(null)
  const chatLog=useRef(null)

  const appState=useContext(StateContext)
  const appDispatch=useContext(DispatchContext)
  const[state,setState]=useImmer({
    fieldValue:"",
    chatMessages:[]
  })

  useEffect(()=>{
    if(appState.isChatOpen){
      chatField.current.focus()
      //"chatField.current" is used to access the current value of your "reference" and now we can treat it like any other "DOM" element.
      appDispatch({type:"clearUnreadChatCount"})
      //This says that as soon as the chat is opened so we have to clear the chat count and we are doing it through "appDispatch". 
    }
  },[appState.isChatOpen])
  //If we see our "Search", as soon as we open it so our cursor gets "autofocus" automatically in order to write things.This is because there the "Search" component was being added and removed to the DOM completely and in such case we can use the property of "autoFocus".
  //But this is not the case in our "Chat" coz here we the "Chat" component is not being added and removed to the DOM completely so we can not use the property of "autoFocus" here.
  //In case of "React" we can not select the element using "document.query selector" and then modify that particular element.Instead we need to "imperatively" focus on the element.This could be done through "prop" named "ref"
  //"ref" prop known as "reference" is like a box.Unlike "state" we are not free to directly mutate it.And in this case "React" will not re-render things when your "reference" changes.


  useEffect(()=>{
    socket.on("chatFromServer",message=>{
      setState(draft=>{
        draft.chatMessages.push(message)
      })
    })
    //"socken.on" takes two arguments:first argument is type of event that the server emmitted to us and this name needs to match exactly with name kept in "backend file".Second argument is "function" which need to be run anytime this event takes place.

    //Summary of above "useEffect" is:The socket.on function listens for messages with the event name "chatFromServer" from the server. When a new chat message is received, it triggers the callback function.
    //Inside the callback function, a new message is pushed into the chatMessages array in the component's state using the setState function from useImmer. This allows for real-time updates of chat messages in the client's interface. 
  },[])


  useEffect(()=>{
    chatLog.current.scrollTop=chatLog.current.scrollHeight
    //It says that we want to scroll the entire height ie to the bottom.
    if(state.chatMessages.length && !appState.isChatOpen){
      //The above condition says that "if length of messages being pushed is greater than zero" and "if chat is not opened" then this condition will evaluate to "true" and we will increment our chat count using "appDispatch"
      //We have added it in this "useEffect" coz of its dependency or we can say it is already looking for "state.chatMessages" ie whether some message has been pushed or not.
      appDispatch({type:"incrementUnreadChatCount"})
    }
  },[state.chatMessages])
  //We have kept our dependency as "state.chatMessages" coz we want that anytime the new message is pushed onto the collection we would just want to scroll down to very bottom position.

  function handleFieldChange(e){
    const value=e.target.value
    setState(draft=>{
      draft.fieldValue=value
    })
  }
  //This function allows us to have latest value in our "input" field.

  function handleSubmit(e){
    e.preventDefault()
    //By below line we are "Sending" message to the "chat server" when the user submits a chat message by pressing Enter.As soon as we send message to the server,the server is going to turn around and broadcast that out to any or all the other connected users on our website.
    socket.emit("chatFromBrowser",{message:state.fieldValue,token:appState.user.token})
    //By below,we are adding "message" to state collection of "chatMessages" array
    setState(draft=>{
      draft.chatMessages.push({message:draft.fieldValue,username:appState.user.username,avatar:appState.user.avatar})
      draft.fieldValue=""
      //The above line is used to clear the message after user clicks enter, so that user can start writing new message.
    })
  }
  //Summary of above "handleSubmit" function:This function is called when the user submits a chat message, typically by pressing Enter.It prevents the default form submission behavior (preventing the page from refreshing).
  //It uses "socket.emit" to send the chat message to the server with the event name "chatFromBrowser" along with the message content and the user's token.
  // After sending the message to the server, it updates the component's state using setState. It adds the user's message (along with their username and avatar) to the chatMessages array and clears the input field.

  return (
    <div id="chat-wrapper" className={"chat-wrapper chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "" )}>

      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={()=>appDispatch({type:"closeChat"})} className="chat-title-bar-close">
          {/* In order to make our "close icon" functional,we are using our "appDispatch" to use the case of "closeChat" which will make "isChatOpen" false */}
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {/* In order to "scroll" the chats automatically down after we do every new message we are using the "ref" here */}
        {state.chatMessages.map((message,index)=>{
          //Here we are looping through entire array of "ChatMessages"(It has been build above through "draft.chatMessages.push")in order to plot the corresponding "message" with help of "index" using "map" function.
           if(message.username==appState.user.username){
            //In order to know that the "message" which is being sent is by the "user" itself or by someone else,we have used the above condition so that we can figure out that whether we want to display name of the "user" or not coz we don't want name of the "user" when "user" is itself sending the message but we want the name of the other "user" from where we are getting the messages.
            return(
            <div key={index} className="chat-self">
              <div className="chat-message">
                <div className="chat-message-inner">{message.message}</div>
              </div>
              <img className="chat-avatar avatar-tiny" src={message.avatar}/>
              {/* Note:We have not used name of the "user" as we dont display name of the "user" when "user" itself sends the message */}
            </div>
            )
          }

          //Down below is the code for, when "user" gets message from other "user" 
          //Note:Here we will display the name of the "user" from where messages are coming.
          return(
          <div key={index} className="chat-other">
            <Link to={`/profile/${message.username}`}>
              <img className="avatar-tiny" src={message.avatar} />
            </Link>
            <div className="chat-message">
              <div className="chat-message-inner">
                <Link to={`/profile/${message.username}`}>
                  <strong>{message.username}: </strong>
                </Link>
                {message.message}
              </div>
            </div>
          </div>
          )
        })}

      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input onChange={handleFieldChange} ref={chatField} value={state.fieldValue} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat