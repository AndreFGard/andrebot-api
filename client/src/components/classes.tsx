import { CourseInfo } from "../api";

const courses = (majorClasses: CourseInfo[]) =>
{
    //<option value="<%= classItem.id %>"><%= classItem.name %> - <%= classItem.professor %></option>

    return (
    <>
        <select id="class-select" className="form-select" multiple>
            {majorClasses.map(classItem => 
                (<option value={classItem.id}>
                    {classItem.name} - {classItem.professor.slice(0, 20) + "..." ? ( length > 20) : classItem.professor}
                </option>))}
        
        </select>
    </>
    );
}

export default courses;