import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./Bootstrap.css";
import AccountSignupForm from "./AccountSignupForm.js";
import Nav from "./Nav.js";
import { useToken, AuthProvider } from "./Authentication.js";
import MainPage from "./MainPage.js";
import AccountLoginForm from "./AccountLoginForm.js";
import ViewAppointments from "./ViewAppointments.js";
import Stats from "./Stats.js";
import AddAppointment from "./AddAppointment";
import MassAddStudents from "./MassAddStudent.js";
import ViewEditStudents from "./ViewEditStudents.js";
import AddDeleteCategory from "./AddDeleteCategory.js";
import DeleteAppointment from "./DeleteAppointment.js";
import AddOneStudent from "./AddOneStudent.js";
import ManageGroups from "./ManageGroups.js";
import Foot from "./Foot"
import React from 'react';

function GetToken() {
  useToken();
  return null;
}

function App() {
  const domain = /https:\/\/[^/]+/;
  const basename = process.env.PUBLIC_URL.replace(domain, '');

  return (
    <div className="bg">
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <GetToken />
        <Nav />
        <div>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="account" element={<AccountSignupForm />} />
            <Route path="/login" element={<AccountLoginForm />} />
            <Route path="view-appointments" element={<ViewAppointments />} />
            <Route path="stats" element={<Stats />} />
            <Route path="add-appointment" element={<AddAppointment />} />
            <Route path="mass-add-students" element={<MassAddStudents />} />
            <Route path="view-edit-students" element={<ViewEditStudents />} />
            <Route path="add-delete-category" element={<AddDeleteCategory />} />
            <Route path="delete-appointment" element={<DeleteAppointment />} />
            <Route path="add-one-student" element={<AddOneStudent />} />
            <Route path="manage-groups" element={<ManageGroups />} />
          </Routes>
        </div>
        <Foot/>
      </AuthProvider>
    </BrowserRouter>
    </div>
  );
}

export default App;
