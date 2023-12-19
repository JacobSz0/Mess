import { useState, useEffect } from "react";
import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

function EditAppointment2() {
  const [category, setCategory] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");
  const [start, setStart] = useState(dayjs());
  const [end, setEnd] = useState(dayjs());
  const [code, setCode] = useState("DS - Direct Service");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // async function createData() {
  //   const response = await fetch("http://localhost:8000/appointments");
  //   if (response.ok) {
  //     const data = await response.json();
  //     console.log(data.appointments)
  //     setList(data.appointments)
  //   }
  // }

  async function fetchData() {
    const response = await fetch("http://localhost:8000/categorys");
    if (response.ok) {
      const data = await response.json();
      console.log(data.categorys)
      setCategory(data.categorys)
    }

    const studentResponse = await fetch("http://localhost:8000/students");
    if (studentResponse.ok) {
      const data = await studentResponse.json();
      console.log(data.students)
      setStudents(data.students)
    }
  }

  function handleCurrentStudentChange(event){
    setCurrentStudent(event.target.value)
  }

  function handleCode(event){
    console.log(event.target.value)
    console.log(dayjs(start).format())
    setCode(event.target.value)
  }

  function handleNotes(event){
    setNotes(event.target.value)
  }

  function handleReason(event){
    setReason(event.target.value)
  }

  function addStudent(student){
    if (selectedStudents.includes(student)){
      console.log("DENIED", selectedStudents)
    }
    else{
      var copy=[...selectedStudents]
      copy.push(student)
      setSelectedStudents(copy)}
      setCurrentStudent("")
      console.log("Success", copy)
  }

  async function submitReport(){
    var selStudents=[...selectedStudents]
    if (currentStudent==="" && !selectedStudents[0]){
      alert("Don't forget to choose a student!");
    }
    if (currentStudent!=="" && !selectedStudents[0]){
      selStudents=[currentStudent]
    }
    if (notes!=="" && reason!=="" && selStudents[0]){
      var fullSelectedStudentList=[]
      for (var student of selStudents){
        var refrenceNumber=student.split("ID: ")[1]
        for (var i of students){
          if (i["idnum"]===refrenceNumber){
            console.log("SUCCESS!!",i)
            fullSelectedStudentList.push(i)
            break
          }
        }
      }
      for (student of fullSelectedStudentList){
        var newReport={
          "name": student.first+" "+student.last+" ID: "+student.idnum,
          "grade": student.grade,
          "start": dayjs(start).format(),
          "end": dayjs(end).format(),
          "category": code,
          "reason": reason,
          "notes": notes
        }
        console.log(newReport)
        try {
          const response = await fetch(`http://localhost:8000/appointments`, {
            method: 'POST',
            body: JSON.stringify(newReport),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          await response.json();
          if (response.ok){console.log("success")}
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div className="text">
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div>
        <datalist id="suggestions">
          {students.map((i, index) => {
            return(
              <option key={index}>{i.first+" "+i.last+" "}ID: {i.idnum}</option>
            )
          })}
        </datalist>
    <input autoComplete="on" list="suggestions" value={currentStudent} onChange={handleCurrentStudentChange} placeholder="Select Student"/>
    <button onClick={() => addStudent(currentStudent)}>+</button>
    {selectedStudents.map((i)=> {
            return(
              <p key={i}>{i}</p>
            )
          })}
    </div>
      <div className="time-border">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
         <MobileDateTimePicker value={start} onChange={(newValue) => setStart(dayjs(newValue))} />
         <MobileDateTimePicker value={end} onChange={(newValue) => setEnd(dayjs(newValue))} />
        </LocalizationProvider>
      </div>
      <form>
      <div>
        <select name="codes" onChange={handleCode} value={code} placeholder="Select Category">
          {category.map((i, index) => {
            return(
              <option key={index}>{i.code} - {i.name}</option>
            )
          })}
          </select>
      </div>
      <div>
        Reason{" "}{" "}
        <input onChange={handleReason} value={reason} required></input>
      </div>
      <div>
        Notes{" "}{" "}
        <textarea onChange={handleNotes} value={notes} required></textarea>
      </div>
      <br></br>
      <button type="submit" onClick={submitReport}>SUBMIT</button>
      </form>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default EditAppointment2;
