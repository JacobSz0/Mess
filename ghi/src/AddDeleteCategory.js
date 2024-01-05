import { useState, useEffect } from "react";
import deleteIcon from "./img/Delete.png"
import checkIcon from "./img/checkmark.png"

function AddDeleteCategory() {

  const [list, setList] = useState([{"code":"","name":""}]);
  const [newEntry, setNewEntry] = useState({"code":"","name":""});
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  async function fetchData() {
    const response = await fetch("http://localhost:8000/categorys");
    if (response.ok) {
      const data = await response.json();
      setList(data.categorys)
      console.log(data)
    }
  }

  function handleCode(e){
    setCode(e.target.value)
  }

  function handleName(e){
    setName(e.target.value)
  }

  async function addEntry(c,n){
    const fetchConfig = {
      method: "POST",
      body: JSON.stringify({"code":c, "name":n, "reasons":""}),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("http://localhost:8000/categorys", fetchConfig);
    if (response.ok) {
      fetchData()
      setName("")
      setCode("")
    }
  }

  async function deleteEntry(id){
    const fetchConfig = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`http://localhost:8000/categorys/${id}`, fetchConfig);

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
        <td>Code</td>
        <td>Name</td>
        <td>Delete?</td>
      </tr>
      {list.map((i,num) => {
        return(
          <tr key={num}>
            <td>{i.code}</td>
            <td>{i.name}</td>
            <td><img onClick={() => deleteEntry(i.id)} className="penIcon" src={deleteIcon}></img></td>
          </tr>
        )
      })}
      <tr>
        <td><input value={code} onChange={(e) => handleCode(e)} className="edit-grade"></input></td>
        <td><input value={name} onChange={(e) => handleName(e)}></input></td>
        <td><img onClick={() => addEntry(code, name)} className="penIcon" src={checkIcon}></img></td>
      </tr>
    </table>
  </>
  )
}

export default AddDeleteCategory;
