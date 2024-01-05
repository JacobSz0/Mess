import { useState, useEffect } from "react";

function AddOneStudent() {

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [grade, setGrade] = useState("");
  const [idnum, setIDnum] = useState("");

  function handleFirst(e){
    setFirst(e.target.value)
  }

  function handleLast(e){
    setLast(e.target.value)
  }

  function handleGrade(e){
    setGrade(e.target.value)
  }

  function handleIDnum(e){
    setIDnum(e.target.value)
  }

  async function submitEntry(f,l,g,i) {
    var entry={"first":f, "last":l, "grade":g, "idnum":i,}
    try {
      const response = await fetch(`http://localhost:8000/students`, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
      if (response.ok){
        alert("Success! "+f+" is now a student")
        setFirst("")
        setLast("")
        setGrade("")
        setIDnum("")
      }
    } catch (error) {
      console.error(error)
      alert("Error. Student Not Created");
    }
  }

  return (
    <div className="text">
      <div>First Name:{" "}<input value={first} onChange={handleFirst}></input></div>
      <div>Last Name:{" "}<input value={last} onChange={handleLast}></input></div>
      <div>Grade:{" "}<input value={grade} onChange={handleGrade}></input></div>
      <div>Student ID:{" "}<input value={idnum} onChange={handleIDnum}></input></div>
      <div><button onClick={()=>submitEntry(first,last,grade,idnum)}>Submit</button></div>
    </div>
  );
};

export default AddOneStudent;
