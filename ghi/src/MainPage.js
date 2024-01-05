import React from 'react';
import {Link} from "react-router-dom"
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';


function MainPage() {

  async function exportExel(){
    const response = await fetch("http://localhost:8000/appointments");
    if (response.ok) {
      const data = await response.json();
      console.log(data.appointments)
      const worksheet = XLSX.utils.json_to_sheet(data.appointments);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
      XLSX.writeFile(workbook, "Mess "+dayjs().format("YYYY-MM-DD")+".xlsx", { compression: true });
    }
  }

  return (
    <div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <h1 className="text">Welcome to Mess!</h1>
      <h3 className="text">Menu</h3>
      <br></br>
      <div>
        <button><Link className='no-link' to="/add-appointment">Add Appointment</Link></button>
        <button><Link className='no-link' to="/view-appointments">View Appointments</Link></button>
        <button><Link className='no-link' to="/edit-appointment">Edit Appointment</Link></button>
      </div>
      <button><Link className='no-link' to="/view-edit-students">Manage Students</Link></button>
      <button><Link className='no-link' to="/add-delete-category">Manage Categories</Link></button>
      <button><Link className='no-link' to="/manage-groups">Manage Groups</Link></button>
      <button><Link className='no-link' to="/stats">Stats</Link></button>
      <button onClick={exportExel}>Export All</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default MainPage;
