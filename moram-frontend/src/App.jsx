import React from "react";
import {Routes,Route,Navigate} from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Complete from "./pages/Complete";
import Home from "./pages/Home";
import QuizSetup from "./pages/QuizSetup";
import QuizSubject from "./pages/QuizSubject";
import QuizMode from "./pages/QuizMode";
import QuizType from "./pages/QuizType";
import QuizPlay from "./pages/QuizPlay";
import QuizResult from "./pages/QuizResult";
import Chat from "./pages/Chat";
import Library from "./pages/Library";
import WrongNote from "./pages/WrongNote";
import Items from "./pages/Items";
export default function App(){return (
<Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/signup" element={<Signup/>}/>
  <Route path="/signup/complete" element={<Complete/>}/>
  <Route path="/home" element={<Home/>}/>
  <Route path="/quiz/setup" element={<QuizSetup/>}/>
  <Route path="/quiz/subject" element={<QuizSubject/>}/>
  <Route path="/quiz/mode" element={<QuizMode/>}/>
  <Route path="/quiz/type" element={<QuizType/>}/>
  <Route path="/quiz/play" element={<QuizPlay/>}/>
  <Route path="/quiz/result" element={<QuizResult/>}/>
  <Route path="/chat" element={<Chat/>}/>
  <Route path="/library" element={<Library/>}/>
  <Route path="/wrong-note" element={<WrongNote/>}/>
  <Route path="/items" element={<Items/>}/>
  <Route path="*" element={<Navigate to="/"/>}/>
</Routes>
);
}
