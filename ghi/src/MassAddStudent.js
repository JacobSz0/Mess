import { useState, useEffect } from "react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

function ViewAppointments() {

  const [students, setStudents] = useState([]);
  const [success, setSuccess] = useState(0);

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parseData = XLSX.utils.sheet_to_json(sheet);
      var readyData=[]
    var currentData={}
    for (var i of parseData){
      currentData["grade"]=i["Grade"]
      currentData["idnum"]=i["__EMPTY"]
      currentData["first"]=i["Student First Name"]
      currentData["last"]=i["Student Last Name"]
      readyData.push(currentData)
      currentData={}
    }
    console.log(readyData)
    setStudents(readyData)
    };

  }

  async function letErRip() {
    var successLog=0
    for (var i of students){
      try {
        const response = await fetch(`http://localhost:8000/students`, {
          method: 'POST',
          body: JSON.stringify(i),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await response.json();
        if (response.ok){successLog+=1}
      } catch (error) {
        console.error(error);
      }
    }
    setSuccess(successLog)
  }

  return (
    <div className="text">
      <p>Please upload the speadsheet with all student's first name, last name, grade, and student ID {"(does not have to be in that order)"} Then skim the list that appears so the list can be verified. Then click the "Let 'er Rip!" button</p>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
      <table className="text view-table">
        <tr>
          <td>First Name</td>
          <td>Last Name</td>
          <td>Grade</td>
          <td>Student ID</td>
        </tr>
        {students.map((i,num) => {
          return(
            <tr key={num}>
              <td>{i.first}</td>
              <td>{i.last}</td>
              <td>{i.grade}</td>
              <td>{i.idnum}</td>
            </tr>
          )
        })}
      </table>
      <button onClick={letErRip}>LET 'ER RIP!</button>
      <p>Students added: {success}</p>
    </div>
  );
};

export default ViewAppointments;
