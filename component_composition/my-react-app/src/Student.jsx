function Student({name,age,reg,dept,Delete}){
    return(
        <div>
            
             
        
            <div>
                <h2>Student</h2>
                <p>name:{name}</p>
                <p>age:{age}</p>
                <p>reg:{reg}</p>
                <p>dept:{dept}</p>
                <button onClick={Delete}>Delete</button>
            </div>
            <br />


         
          

        </div>
        
    )
}
export default Student