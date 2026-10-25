import { useState } from "react"
import Student from "./Student"

function App(){
  const[students,setStudent]=useState([
    {
      name:"Ravi",
      dept:"AI&DS",
      age:19,
      reg:253
    },
      {
      name:"Kumar",
      dept:"AI&DS",
      age:19,
      reg:253
    }
  ])
  function Delete(index)
  {  
    setStudent(students.filter((_,i)=> i!=index));
     
  }
  return(
    <>
       <div>
           
       </div>
       {students.map((stud,index) =>(

           <Student
              key={index}
              name={stud.name}
              dept={stud.dept}
              age={stud.age}
              reg={stud.reg}
              Delete={() => Delete(index)}
           />
          


      ))}
    </>
  )
}
export default App