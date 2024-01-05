import { useState, useEffect } from "react";
import {Link} from "react-router-dom"
import penIcon from "./img/pen.png"
import cancelImg from "./img/Delete.png"
import checkMark from "./img/checkmark.png"

function ViewEditStudents() {

  const [students, setStudents] = useState([{first:"", last:"", idnum:"", grade:""}]);
  const [edited, setEdited] = useState({first:"", last:"", idnum:"", grade:""});

  async function fetchData(){
    const response = await fetch("http://localhost:8000/students");
    if (response.ok) {
      const data = await response.json();
      if (data[0]){
        for (var i of data){
          i.editable=false
        }
      }
      setStudents(data.students)
      console.log(data.students)
    }
  }

  function editRow(index){
    var updatedStudents = [...students]
    for (var i of updatedStudents){
      i.editable=false
    }
    updatedStudents[index].editable = true
    setStudents(updatedStudents)
    setEdited(updatedStudents[index])
  }

  function cancelEdit(index){
    var updatedStudents = [...students]
    for (var i of updatedStudents){
      i.editable=false
    }
    updatedStudents[index].editable = false
    setStudents(updatedStudents)
  }

  async function confirmEdit(index,ed,id){
    var finalEdit={}
    finalEdit.first=ed.first
    finalEdit.last=ed.last
    finalEdit.grade=ed.grade
    finalEdit.idnum=ed.idnum
    console.log(finalEdit)
    const url = `http://localhost:8000/students/${id}`;
    const fetchConfig = {
      method: "PUT",
      body: JSON.stringify(finalEdit),
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(url, fetchConfig);
    if (response.ok) {
      var newData = await response.json();
      console.log(newData)
    }
    fetchData()
  }

  function handleFirst(e){
    var newEdited=edited
    newEdited.first=e.target.value
    setEdited(newEdited)
  }

  function handleLast(e){
    var newEdited=edited
    newEdited.last=e.target.value
    setEdited(newEdited)
  }

  function handleGrade(e){
    var newEdited=edited
    newEdited.grade=e.target.value
    setEdited(newEdited)
  }

  function handleIDNum(e){
    var newEdited=edited
    newEdited.idnum=e.target.value
    setEdited(newEdited)
  }

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div className="text">
      <button><Link className='no-link' to="/add-one-student">Add Individual Student</Link></button>
      <button><Link className='no-link' to="/mass-add-students">Add Student List</Link></button>
      <table className="text view-table">
        <tr>
          <td>First Name</td>
          <td>Last Name</td>
          <td>Grade</td>
          <td>Student ID</td>
          <td>Edit</td>
        </tr>
        {students.map((i,num) => {
          return(
            <tr key={num}>
              <td>{i.editable ? <input onChange={handleFirst} className="edit-row" type="text" defaultValue={i.first} /> : i.first}</td>
              <td>{i.editable ? <input onChange={handleLast} className="edit-row" type="text" defaultValue={i.last} /> : i.last}</td>
              <td>{i.editable ? <input onChange={handleGrade} className="edit-grade" type="text" defaultValue={i.grade} /> : i.grade}</td>
              <td>{i.editable ? <input onChange={handleIDNum} className="edit-row" type="text" defaultValue={i.idnum} /> : i.idnum}</td>
              <td>{i.editable ?
              <>
                <img onClick={() => cancelEdit(num)}src={cancelImg} className="penIcon"></img>
                <img onClick={() => confirmEdit(num,edited,i.id)} className="penIcon" src={checkMark}></img>
              </>:

                <img onClick={() => editRow(num)} className="penIcon" src={penIcon}></img>
              }</td>
            </tr>
          )
        })}
      </table>
    </div>
  );
};

export default ViewEditStudents;
