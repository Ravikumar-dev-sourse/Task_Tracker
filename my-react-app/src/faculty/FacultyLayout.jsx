import { Outlet } from "react-router-dom";
import FacultySide from "./FacultySide";
import FacultyNav from "./FacultyNav";
import Login from "../Login";

function FacultyLayout() {
    return (
        <div className="faculty-layout">

         
            <FacultyNav />

            
            <div className="faculty-body">

               
                <FacultySide />
                
        
                <main className="faculty-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default FacultyLayout;