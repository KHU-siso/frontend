import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignupInfo from "./pages/SignupInfo";
import SignupPreferences from "./pages/SignupPreferences";
import SignupComplete from "./pages/SignupComplete";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import ItemShop from "./pages/ItemShop";
import Notifications from "./pages/Notifications";
import WrongAnswerNotes from "./pages/WrongAnswerNotes";
import NotificationEmail from "./pages/NotificationEmail";

/**
 * Routes are added here as each Figma screen is converted.
 * See PROGRESS.md for the full 52-screen checklist.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupInfo />} />
      <Route path="/signup/preferences" element={<SignupPreferences />} />
      <Route path="/signup/complete" element={<SignupComplete />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/library" element={<Library />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/shop" element={<ItemShop />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/notifications/email" element={<NotificationEmail />} />
      <Route path="/quiz/notes" element={<WrongAnswerNotes />} />
    </Routes>
  );
}
