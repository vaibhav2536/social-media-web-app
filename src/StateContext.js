import {createContext,useReducer} from "react"
import DispatchContext from "./DispatchContext"
import HeaderLoggedOut from "./components/HeaderLoggedOut"

const StateContext=createContext()

export default StateContext



// --------------------------------------------------------------------------------------------------
// React Context is a method to pass props from parent to child components, by storing the props in a store and using these props from the store by child component without actually passing them manually at each level of the component tree.

// If we have three components in our app, A->B->C where A is the parent of B and B is the parent of C. To change a state from C and pass it to A, keep the state of A in a store, then extract the state from the store and use it in C. This completely eliminates the necessity of the state to pass through B. So the flow is like A->C.

// For doing this:
// 1)ham ek context ke lliye file banayenge which will be outside the component folder but inside the src folder

// 2)uske baad ham is context file ko import karvayenge apne App.js file mai and then we will change the top level element of App.js to that context file.In that top level component we will provide a value which we need to adapt

// 3) Now ab jis file mai hame value use karni hai us file mai bhi ham context file ko import kara lenge and then we will define as follows: const value=useContext(context file).Now we can finally use the value inside our file.

// -----------------------------------------------------------------------------------------------------------

//Notes of useReducer:It is cousin or we can say sibling of useState.We use it during the time of complex state.
//Refer to below code and all the 5 steps to know how useReducer works

// step1:we first import { useReducer } in our App.js file

// const initialState={
//   loggedIn:Boolean(localStorage.getItem("complexappToken")),
//   flashMessages:[]
// }


// step 5:In return we get the updated values and if in case we dont want the updated value and want to pass the previous value so we use state.value(state.flashMessages in this case)

// function ourReducer(state,action){
//   switch(action.type){
//     case "login":
//       return {loggedIn:true,flashMessages:state.flashMessages}
//     case " logout":
//       return {loggedIn:true,flashMessages:state.flashMessages}
//     case "flashMessage":
//       return {loggedIn:state.loggedIn,flashMessages:state.flashMessages.concat(action.value)}
//   }
// }

// step 3:Here useReducer takes two parameters,first is function called ourReducer and second is initial argument
// const[state,dispatch]=useReducer(ourReducer,initialState)
//step 4:whatever we pass in dispatch as type that is passed as action parameter to ourReducer fn


// step 2:we have to keep this as follows:
// const[loggedIn,setLoggedIn]=useState()  
// const[flashMessages,setFlashMessages]=useState([])

// Note:1)agar ham same file mai hai jismein hamne apna state and dispatch define kara hai toh vaha pr directly ham state.property use kar lete hai

// 2)agar ham kisi aur file mai hai aur vaha par hame "state" use karna hai toh pehle ham ek variable mai state ko store karvayenge,say:
// const appState=useContext(StateContext)
// Then,appState.property use kar payenge

// 3)agar hame type set karna hai dusri file mai jo ki action mai jayega main file(App.js) mai and then fir ham main file mai us property ke liye har state ko update karenge.For this,dispatch ko ek variable mai store karvayenge,say:
// const appDispatch=useContext(DispatchContext)
// appDispatch({type:property})
// sometimes we give: value or some other sort of data along with type seperated by the comma(as given in CreatePost and HeaderLoggedOut component)