import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import { Chart } from "react-google-charts";


function Stats() {
  const [list, setList] = useState([]);
  const [currentList, setCurrentList] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");
  const [start, setStart] = useState(parseInt(dayjs().subtract(1, 'year').format("YYYYMMDD")));
  const [end, setEnd] = useState(parseInt(dayjs().format("YYYYMMDD")));
  const [category, setCategory] = useState([]);
  const [code, setCode] = useState("N/A");
  const [grade, setGrade] = useState("N/A");
  const [chartType, setChartType] = useState("Category");
  const [chartOptions, setChartOptions] = useState({
    title: "Stats",
    is3D: true,
  });
  const [chartData, setChartData] = useState([
    ["Task", "Hours per Day"],
    ["Work", 30],
    ["Eat", 45],
    ["Commute", 60],
    ["Watch TV", 120],
    ["Sleep", 30],
  ]);


  const updateChartData = () => {
    if(chartType==="Category"){
      var workingdata2=[["Task", "Hours per Day"]]
      for (var i of category){
        var timeTotal=0
        for (var j of currentList){
          if (i.code===j.humanCode){
            timeTotal+=j.timeDiff

          }
        }
        workingdata2.push([i.name,timeTotal])
        console.log(workingdata2)
      }
      setChartData(workingdata2)
      console.log(workingdata2)
    }
    else if(chartType==="Student"){
      var studentTimeTotal={}
      for (var i of currentList){
        if (i.name in studentTimeTotal){
          studentTimeTotal[i.name]=studentTimeTotal[i.name]+i.timeDiff
        }
        else{
          studentTimeTotal[i.name]=i.timeDiff
        }
      }
      const resultArray = Object.entries(studentTimeTotal).map(([key, value]) => [key, value]);
      resultArray.unshift(["Task", "Hours per Day"])
      setChartData(resultArray)
    }
    else if (chartType==="Grade"){
      var workingdata2=[["Task", "Hours per Day"]]
      var gradeList=["K","1","2","3","4","5"]
      for (var i of gradeList){
        var timeTotal=0
        for (var j of currentList){
          if (i===j.grade){
            timeTotal+=j.timeDiff
          }
        }
        workingdata2.push([i,timeTotal])
        console.log(workingdata2)
      }
      setChartData(workingdata2)
    }
  }

  function refreshSearch(){
    var newList=[]
    for (var i of list){
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
        var timeDiff=Math.abs(dayjs(i.end).diff(dayjs(i.start), "minute"))
        i["humanName"]=humanName
        i["humanStart"]=humanStart
        i["humanEnd"]=humanEnd
        i["humanCode"]=humanCode
        i["date"]=date
        i["timeDiff"]=timeDiff
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

  function handleChartType(event){
    setChartType(event.target.value)
  }

  function handleCurrentStudentChange(event){
    console.log(event.target.value)
    setCurrentStudent(event.target.value)
    setChartType("Category")
    console.log(currentStudent)
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    refreshSearch()
  }, [code, currentStudent, grade, chartType, list, students, category]);

  useEffect(() => {
    updateChartData()
  },[currentList])

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
        <span>{" Category: "}</span>
        <select name="category" value={code} onChange={handleCode} placeholder="Select Category">
        <option>N/A</option>
          {category.map((i, index) => {
            return(
              <option key={index}>{i.code}</option>
            )
          })}
        </select>
        <span>{" Chart Metric: "}</span>
        <select name="chart" value={chartType} onChange={handleChartType} placeholder="Select Category">
          <option>Category</option>
          <option>Student</option>
          <option>Grade</option>
        </select>
      </div>
        <div className="time-border">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField label="Start" defaultValue={dayjs().subtract(1, 'year')} onChange={(newValue) => setStart(parseInt(dayjs(newValue).format("YYYYMMDD")))}/>
          <DateField label="End" defaultValue={dayjs()} onChange={(newValue) => setEnd(parseInt(dayjs(newValue).format("YYYYMMDD")))}/>
        </LocalizationProvider>
        {" "}
        <button onClick={refreshSearch}>Set Date Window</button>
        </div>
      <br></br>

      <Chart
      chartType="PieChart"
      data={chartData}
      options={chartOptions}
      width={"100%"}
      height={"400px"}
    />

      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default Stats;
