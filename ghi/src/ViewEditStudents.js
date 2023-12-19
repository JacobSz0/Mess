import { useState, useEffect } from "react";
import penIcon from "./img/pen.png"
import cancelImg from "./img/Delete.png"

function ViewEditStudents() {

  const [students, setStudents] = useState([{first:"", last:"", idnum:"", grade:""}]);

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
    updatedStudents[index].editable = true
    setStudents(updatedStudents)
  }

  function editRow(index){
    var updatedStudents = [...students]
    updatedStudents[index].editable = true
    setStudents(updatedStudents)
  }

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div className="text">
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
              <td>{i.editable ? <input className="edit-row" type="text" value={i.first} /> : i.first}</td>
              <td>{i.editable ? <input className="edit-row" type="text" value={i.last} /> : i.last}</td>
              <td>{i.editable ? <input className="edit-grade" type="text" value={i.grade} /> : i.grade}</td>
              <td>{i.editable ? <input className="edit-row" type="text" value={i.idnum} /> : i.idnum}</td>
              <td>{i.editable ?
                <img onClick={() => cancelEdit(num)}src={cancelImg} className="penIcon"></img> :
                <img onClick={() => editRow(num)} className="penIcon" src={penIcon}></img>}</td>
            </tr>
          )
        })}
      </table>
    </div>
  );
};

export default ViewEditStudents;
