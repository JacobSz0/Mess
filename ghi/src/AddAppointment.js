import { useState, useEffect, KeyboardEventHandler } from "react";
import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

function AddAppointment() {

  const [category, setCategory] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupSelectBox, setGroupSelectBox] = useState("");
  const [groupToggle, setGroupToggle] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [start, setStart] = useState(dayjs().minute(0));
  const [end, setEnd] = useState(dayjs().minute(0).add(30, 'minute'));
  const [code, setCode] = useState(false);
  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState([]);
  const [currentReasons, setCurrentReasons] = useState([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState({"alive":false, "error":false, "message":""});
  const [refresh, setRefresh] = useState(false);

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
      for (let i = 0; i < data.students.length; i++) {
        data.students[i]["value"]=data.students[i].first+" "+data.students[i].last
        data.students[i]["label"]=data.students[i].first+" "+data.students[i].last
      }
      console.log(data.students)
      setStudents(data.students)
      var studentList=(data.students)

      const groupResponse = await fetch("http://localhost:8000/groups");
      if (groupResponse.ok) {
        const data = await groupResponse.json();
        var groupData=data.groups
        var finalList=[]
        for (let i = 0; i < groupData.length; i++) {
          var newList=groupData[i]["list"].split(",")
          var semiFinalList=[]
          for (var j of newList){
            var idList=j.split(" ID: ")
            for (var k of studentList){
              if (idList[1]===k.idnum){
                semiFinalList.push(k)
              }
            }
          }
          finalList.push({"name":groupData[i].name, "list": semiFinalList, "value":groupData[i].name, "label":groupData[i].name})

        }
        console.log(finalList)
        setGroups(finalList)
      }
    }
  }

  function clearStudents(){
    setSelectedStudents([])
    setCurrentStudent("")
  }

  function refreshReasons(){
    if (refresh){
      setRefresh(false)
    }
  }

  function handleGroup(e){
    var groupName=e.name
    setGroupSelectBox(groupName)
    var copyGroups=[...groups]
    if (copyGroups[0]){
      setSelectedStudents(e.list)
      setGroupSelectBox("")
    }
  }

  function handleStart(val){
    setStart(dayjs(val))
    setEnd(dayjs(val).add(30, 'minute'))
  }

  function minusStart(){
    let ogStart=start
    setStart(dayjs(ogStart).subtract(15, 'minute'))
    setEnd(dayjs(ogStart).add(15, 'minute'))
  }

  function plusStart(){
    let ogStart=start
    setStart(dayjs(ogStart).add(15, 'minute'))
    setEnd(dayjs(ogStart).add(45, 'minute'))
  }

  function minusEnd(){
    let ogEnd=end
    setEnd(dayjs(ogEnd).subtract(15, 'minute'))
  }

  function plusEnd(){
    let ogEnd=end
    setEnd(dayjs(ogEnd).add(15, 'minute'))
  }

  function handleCode(event){
    console.log(event.target.value)
    setCode(event.target.value)
    setReason("")
    setReasons([])
    setCurrentReasons([])
    var codeToBe=event.target.value.split(" - ")
    var codeToBe2=codeToBe[0]
    for (var i of category){
      if (i.code===codeToBe2){
        if (i.reasons.includes(",")){
          var splittedReasons=i.reasons.split(",")
          var newReasons=[]
          for (var j of splittedReasons){
            newReasons.push({"value":j, "label":j})
          }
          setReasons(newReasons)
          setRefresh(true)
          console.log(i.reasons.split(","))
        }
        break
      }
    }
  }

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue('');
        event.preventDefault();
    }
  };

  function handleNotes(event){
    setNotes(event.target.value)
  }

  function handleReason(event){
    setReason(event.target.value.replace(/,/g, ''))
  }

  function addReason(r){
    if (currentReasons.includes(r) || r===""){
      console.log("DENIED", currentReasons)
    }
    else{
      var copy=[...currentReasons]
      copy.push(r)
      setCurrentReasons(copy)
      setReason("")
      console.log("Success", copy)
    }
  }

  function addStudent(selection){
    console.log(selection)
    if (selectedStudents.includes(selection) || selection===""){
      console.log("DENIED", selectedStudents)
    }
    else{
      var copy=[...selectedStudents]
      console.log(selection)
      copy.push(selection)
      console.log(copy)
      setSelectedStudents(copy)
    }
    setCurrentStudent("")
    console.log("Success", copy)
  }

  function newGroup(){
    setGroupToggle(true)
  }

  function cancelNewGroup(){
    setGroupToggle(false)
  }

  async function addNewGroup(name, list){
    if (list.length>1){
      var newList=""
      for (var i of list){
        newList+=i.label+" ID: "+i.idnum+","
      }
      console.log(newList)
      var newReport={"name":name, "list":newList}
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
          const newResponse = await fetch("http://localhost:8000/groups");
          if (newResponse.ok) {
            const data = await newResponse.json();
            console.log(data.groups)
            setGroups(data.groups)
            setStatus({"alive":true, "error":false, "message":""});
          }
        }
      } catch (error) {
        console.error(error)
        setStatus({"alive":true, "error":true, "message":error});
      }
    }
    else{
      alert("Please include 2 or more students")
    }
    setGroupToggle(false)
  }

  async function finalizeReport(newReport){
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
          if (response.ok){
            console.log("Report Submitted")
            setStatus({"alive":true, "error":false, "message":""});
          }
        } catch (error) {
          console.error(error);
          setStatus({"alive":true, "error":true, "message":error});
        }
      }

  async function submitReport(){
    setStatus({"alive":false, "error":false, "message":""});
    var selStudents=[...selectedStudents]
    if (currentStudent!=="" && !selectedStudents[0]){
      selStudents=[currentStudent]
    }
    console.log(currentReasons[0])
    console.log(code)
    console.log(notes!=="")
    if (notes!=="" && currentReasons[0] && code!==false){
      var stringyReasons2=""
      for (let i = 0; i < currentReasons.length; i++) {
        stringyReasons2+=currentReasons[i]
        if (i!==currentReasons.length-1){
          stringyReasons2+=","
        }
      }
      if (selectedStudents[0]){
        var fullSelectedStudentList=[]
        for (var student of selStudents){
          var refrenceNumber=student.split("ID: ")[1]
          for (var i of students){
            if (i["idnum"]===refrenceNumber){
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
            "reason": stringyReasons2,
            "notes": notes
          }
          finalizeReport(newReport)
        }
      }

      else{
        var newReport={
          "name": "",
          "grade": "",
          "start": dayjs(start).format(),
          "end": dayjs(end).format(),
          "category": code,
          "reason": stringyReasons2,
          "notes": notes
        }
        finalizeReport(newReport)
      }

      var trueCode=code.split(" - ")
      trueCode=trueCode[0]
      for (var i of category){
        if (i.code===trueCode){
          var myCategoryFull=i
          break
        }
      }
      console.log(myCategoryFull.reasons)
      console.log(currentReasons)
      if (myCategoryFull.reasons!==""){
        var myCategory=myCategoryFull.reasons.split(",")
        console.log(myCategory)
      }
      else{myCategory=[]}
      for (var i of currentReasons){
        if (myCategory.includes(i)){
        }else{
          myCategory.push(i)
        }
      }
      console.log(myCategory)
      var stringyReasons=""
      for (let i = 0; i < myCategory.length; i++) {
        stringyReasons+=myCategory[i]
        if (i!==myCategory.length-1){
          stringyReasons+=","
        }
      }
      myCategoryFull.reasons=stringyReasons
      console.log(myCategoryFull)
      var postable={}
      postable.code=myCategoryFull.code
      postable.name=myCategoryFull.name
      postable.reasons=myCategoryFull.reasons
      var updateId=myCategoryFull.id
      console.log(updateId, postable)
      try {
        const response = await fetch(`http://localhost:8000/categorys/${updateId}`, {
          method: 'PUT',
          body: JSON.stringify(postable),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await response.json();
        if (response.ok){
          console.log("success")
        }
      } catch (error) {
        console.error(error);
      }
      setGroupSelectBox("");
      setGroupToggle(false);
      setNewGroupName("");
      setSelectedStudents([]);
      setCurrentStudent("");
      setStart(dayjs().minute(0));
      setEnd(dayjs().minute(0).add(30, 'minute'));
      setCode("");
      setReason("");
      setCurrentReasons([]);
      setNotes("");
    }
    else{
      var errMessage=""
      if (notes===""){
        errMessage+="Notes Required, "
      }
      if (!currentReasons[0]){
        errMessage+="Reason(s) Required, "
      }
      if (code===false){
        errMessage+="Category Required"
      }
      setStatus({"alive":true, "error":true, "message":"Incomplete entry: "+errMessage})
    }
  }

  useEffect(() => {
    fetchData()
  }, []);

  useEffect(() => {
    refreshReasons()
  }, [refresh]);

  return (
    <div className="text">
{/* Name Stuff */}
      <div className="name-group">
        <button onClick={() => clearStudents()}>Clear</button>
        <Select className="drop-down" placeholder="Select Student" onChange={(e) => addStudent(e)} value={currentStudent} options={students} />
      {selectedStudents.map((i, num)=> {
      return(
        <p key={num}>{i.label}</p>
      )
    })}
{/* Group Stuff*/}
    {selectedStudents[0] && !selectedStudents[1] ? (
      <button disabled>Create New Group</button>
    ) : null}
    {selectedStudents[1] ? (  //If there are 2 items in selected students, you may create a group
      <>
      {!groupToggle ? (
        <button onClick={newGroup} >Create New Group</button>
      ) : null}
      {groupToggle ? (
        <div>
          <button onClick={cancelNewGroup}>X</button>
          <input onChange={(val) => setNewGroupName(val.target.value)} value={newGroupName} placeholder="New Group Name"></input>
          <button onClick={() => addNewGroup(newGroupName, selectedStudents)}>GO</button>
        </div>
      ) : null}
      </>
    ) : null}

    {!selectedStudents[0] ? (  //If there is nothing in selected students you may add a group
      <Select className="drop-down" placeholder="Select Group" name="Group" onChange={(e) => handleGroup(e)} options={groups} />
    ) : null}
    </div>
{/* Notes */}
    <div className="notes">
        <textarea rows="4" cols="32" placeholder="Notes"onChange={handleNotes} value={notes} required></textarea>
      </div>
{/* Time Selector */}
      <div className="time-border">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDateTimePicker value={start} onChange={(newValue) => handleStart(newValue)} />
          <button onClick={minusStart}>-</button>
          <button onClick={plusStart}>+</button>
          <MobileDateTimePicker value={end} onChange={(newValue) => setEnd(dayjs(newValue))} />
          <button onClick={minusEnd}>-</button>
          <button onClick={plusEnd}>+</button>
        </LocalizationProvider>
      </div>
{/* Categories */}
      <div>
        <select name="codes" onChange={handleCode} value={code} placeholder="Select Category">
        {!code ? (
          <option className="sel-category">Select Category</option>
        ) : null}
          {category.map((i, index) => {
            return(
              <option className="items" key={index}>{i.code} - {i.name}</option>
            )
          })}
          </select>
          {" "}
{/* Reasons */}
      <button onClick={() => setCurrentReasons([])}>Clear</button>

    <input autoComplete="on" list="suggestions3" onChange={(e) => handleReason(e)} value={reason} placeholder="Reasons"/>
    <button onClick={() => addReason(reason)}>+</button>
    {currentReasons.map((i, index) => {
        return(
          <span key={index}>{i+", "}</span>
        )
      })}
    </div>

      <br></br>
      <button onClick={submitReport}>SUBMIT</button>
      <div className="status-bar">
        {status["alive"] && !status["error"] ? (
        <div className="bg-success bg-gradient">
          <p>Success!</p>
        </div>
        ) : null}
        {status["error"] ? (
        <div className="bg-fail bg-gradient">
          <p>Fail! Error Message: {" "+status["message"]}</p>
        </div>
        ) : null}
      </div>
      {!refresh ? (
        <CreatableSelect
          className="drop-down"
          isClearable
          isMulticlassName="drop-down"
          options={reasons}
          placeholder="Reasons"
          onChange={(newValue) => setValue(newValue)}
          onInputChange={(newValue) => setInputValue(newValue)}
          onKeyDown={handleKeyDown}
        />
      ) : null}
    </div>
  );
};

export default AddAppointment;
