import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';


function EditAppointments() {

  const [list, setList] = useState([]);
  const [currentList, setCurrentList] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");
  const [start, setStart] = useState(parseInt(dayjs().subtract(1, 'year').format("YYYYMMDD")));
  const [end, setEnd] = useState(parseInt(dayjs().format("YYYYMMDD")));
  const [category, setCategory] = useState([]);
  const [code, setCode] = useState("N/A");
  const [grade, setGrade] = useState("N/A");


  async function fetchData() {
    const response = await fetch("http://localhost:8000/appointments");
    if (response.ok) {
      const data = await response.json();
      for(var i of data.appointments){
        var humanName=i.name.split(" ID: ")[0]
        var humanStart=dayjs(i.start).format('MM')+"/"+dayjs(i.start).format('DD')+"/"+dayjs(i.start).format('YY')+" "+dayjs(i.start).format('h:mm A  ')
        var humanEnd=dayjs(i.end).format('MM')+"/"+dayjs(i.end).format('DD')+"/"+dayjs(i.end).format('YY')+" "+dayjs(i.end).format('h:mm A  ')
        var humanCode=i["category"].split(" - ")[0]
        var date=parseInt(dayjs(i.start).format("YYYYMMDD"))
        i["humanName"]=humanName
        i["humanStart"]=humanStart
        i["humanEnd"]=humanEnd
        i["humanCode"]=humanCode
        i["date"]=date
      }
      console.log(data.appointments)
      setList(data.appointments)
      setCurrentList(data.appointments)
    }
    const studentResponse = await fetch("http://localhost:8000/students");
    if (studentResponse.ok) {
      const data = await studentResponse.json();
      console.log(data.students)
      setStudents(data.students)
    }
    const catResponse = await fetch("http://localhost:8000/categorys");
    if (catResponse.ok) {
      const data = await catResponse.json();
      console.log(data.categorys)
      setCategory(data.categorys)
    }
  }

  function showAll(){
    setCurrentStudent("")
    setStart(parseInt(dayjs().subtract(1, 'year').format("YYYYMMDD")))
    setEnd(parseInt(dayjs().format("YYYYMMDD")))
    setCode("N/A")
  }

  function handleCode(event){
    setCode(event.target.value)
  }

  function handleGrade(event){
    setGrade(event.target.value)
  }

  function handleCurrentStudentChange(event){
    console.log(event.target.value)
    setCurrentStudent(event.target.value)
    console.log(currentStudent)
  }

  function refreshSearch(){
    var newList=[]
    for (var i of list){
      console.log("start")
      if(i.grade===grade || grade==="N/A"){
        if (i.humanCode===code || code=="N/A"){
          if (start<=i.date && end>=i.date){
            if (i.name===currentStudent || currentStudent===""){
              newList.push(i)
            }
          }
        }
      }
    }
    setCurrentList(newList)
  }

  useEffect(() => {
    fetchData()
  }, []);

  useEffect(() => {
    refreshSearch()
  }, [code, currentStudent, grade]);

  return (
    <div className="text">
      <br></br>
      <div>
        <button onClick={showAll}>RESET</button>
        <datalist id="suggestions">
          {students.map((i, index) => {
            return(
              <option key={index}>{i.first+" "+i.last+" "}ID: {i.idnum}</option>
            )
          })}
        </datalist>
        <input autoComplete="on" list="suggestions" value={currentStudent} onChange={handleCurrentStudentChange} placeholder="Select Student"/>
        <span>{" Grade: "}</span>
        <select name="grade" value={grade} onChange={handleGrade} placeholder="Select Category">
        <option>N/A</option>
        <option>K</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
        </select>
        <div className="time-border">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField label="Start" defaultValue={dayjs().subtract(1, 'year')} onChange={(newValue) => setStart(parseInt(dayjs(newValue).format("YYYYMMDD")))}/>
          <DateField label="End" defaultValue={dayjs()} onChange={(newValue) => setEnd(parseInt(dayjs(newValue).format("YYYYMMDD")))}/>
        </LocalizationProvider>
        <button onClick={refreshSearch}>Set Date Window</button>
        </div>
        <select name="category" value={code} onChange={handleCode} placeholder="Select Category">
        <option>N/A</option>
          {category.map((i, index) => {
            return(
              <option key={index}>{i.code}</option>
            )
          })}
          </select>
      </div>
      <br></br>
      <table className="text view-table">
        <tr>
          <td>Name</td>
          <td>Grade</td>
          <td>Start</td>
          <td>End</td>
          <td>Category</td>
          <td>Reason</td>
          <td>Notes</td>
        </tr>
        {currentList.map((i,num) => {
          return(
            <tr key={num}>
              <td>{i.humanName}</td>
              <td>{i.grade}</td>
              <td>{i.humanStart}</td>
              <td>{i.humanEnd}</td>
              <td>{i.humanCode}</td>
              <td>{i.reason}</td>
              <td>{i.notes}</td>
            </tr>
          )
        })}
      </table>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default EditAppointment;
