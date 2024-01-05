import { useState, useEffect } from "react";
import deleteIcon from "./img/Delete.png"
import checkIcon from "./img/checkmark.png"

function ManageGroups() {

  const [list, setList] = useState([{"list":"","name":""}]);
  const [name, setName] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");


  async function fetchData() {
    const response = await fetch("http://localhost:8000/groups");
    if (response.ok) {
      const data = await response.json();
      setList(data.groups)
      console.log(data)
    }
    const studentResponse = await fetch("http://localhost:8000/students");
    if (studentResponse.ok) {
      const studentData = await studentResponse.json();
      setStudents(studentData.students)
      console.log(studentData)
    }
  }

  function handleName(e){
    var copyName=e.target.value
    setName(copyName)
  }

  function addStudent(student){
    if (selectedStudents.includes(student) || student===""){
      console.log("DENIED", selectedStudents)
    }
    else{
      var copy=[...selectedStudents]
      copy.push(student)
      setSelectedStudents(copy)}
      setCurrentStudent("")
      console.log("Success", copy)
  }

  function handleCurrentStudentChange(event){
    setCurrentStudent(event.target.value.replace(/,/g, ''))
  }

  async function addNewGroup(tempName, list){
    var newList=list.toString()
    var newReport={"name":tempName, "list":newList}
    console.log(newReport)
    try {
      const response = await fetch(`http://localhost:8000/groups`, {
        method: 'POST',
        body: JSON.stringify(newReport),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
      if (response.ok){
        console.log("success")
        fetchData()
      }
    } catch (error) {
      console.error(error);
    }
  }

 
  async function deleteEntry(id){
    const fetchConfig = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`http://localhost:8000/groups/${id}`, fetchConfig);

    if (response.ok) {
      fetchData();
    }
  }

  useEffect(() => {
    fetchData()
  }, []);

  return(
  <>
    <table className="text view-table">
      <tr className="bold">
        <td>Name</td>
        <td>Members</td>
        <td>Delete?</td>
      </tr>
      {list.map((i,num) => {
        return(
          <tr key={num}>
            <td>{i.name}</td>
            <td>{i.list}</td>
            <td><img onClick={() => deleteEntry(i.id)} className="penIcon" src={deleteIcon}></img></td>
          </tr>
        )
      })}
      <tr>
        <td><input onChange={handleName}></input></td>
        <td>        <datalist id="suggestions">
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
    </td>
        <td><img onClick={() => addNewGroup(name, selectedStudents)} className="penIcon" src={checkIcon}></img></td>
      </tr>
    </table>
  </>
  )
}

export default ManageGroups;
