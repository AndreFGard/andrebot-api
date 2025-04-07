import {CourseInfo, ITimetable, ScheduleDay, fetchTimetable, TimetableRenderInfo} from './../../src/api';



const Timetable: React.FC<TimetableRenderInfo> = ({
  conflictlessClasses,
  conflictIds,
  timetable,
  conflicts
}) => {
  const deleteClass = (id: number) => {
    // Implementation for deleteClass function
    console.log('Delete class with id:', id);
  };

  return (
    <>
      <div id="chosenclasstable" className="table-responsive-md">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Professor</th>
              <th scope="col">Action</th>
              <th scope="col">Code</th>
            </tr>
          </thead>
          <tbody>
            {conflictlessClasses.map((classItem, idx) => (
              <tr key={idx} className={conflictIds.includes(classItem.id) ? 'table-danger' : ''}>
                <th scope="row">{idx + 1}</th>
                <td style={{ textTransform: 'capitalize' }}>{classItem.name.toLowerCase()}</td>
                <td>
                  <span className="text-truncate d-inline-block w-100" style={{ maxWidth: '150px' }}>
                    {classItem.professor}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-outline-danger btn-sm" 
                    id={`classButton${idx}`} 
                    type="button" 
                    onClick={() => {
                      deleteClass(classItem.id);
                      fetchTimetable([2]);
                    }}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  {classItem.code}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr/>

      {conflictIds.length > 0 && (
        <div className="alert alert-danger" role="alert">
          There were conflicts between your classes! : {conflicts.map(([cls1, cls2, day]) => 
            `${cls1.code}-${cls2.code} (${day.day} ${day.start}-${day.end})`).join(' || ')}
        </div>
      )}
      
      {timetable.aproxHourList.length === 0 && (
        <div className="alert alert-warning" role="alert">
          Your timetable is empty!
        </div>
      )}

      <div id="chosenclasstable">
        <table className="table table-bordered table-hover fixed-table small">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '1%' }}>Time</th>
              <th style={{ width: '1%' }}>Seg</th>
              <th style={{ width: '1%' }}>Ter</th>
              <th style={{ width: '1%' }}>Qua</th>
              <th style={{ width: '1%' }}>Qui</th>
              <th style={{ width: '1%' }}>Sex</th>
            </tr>
          </thead>
          <tbody>
            {timetable.aproxHourList.map((hour, hourIdx) => (
              <tr key={hourIdx}>
                <td className="small text-center">{hour}</td> {/* Display the hour slot */}
                
                {['seg', 'ter', 'qua', 'qui', 'sex'].map((day, dayIdx) => {
                  const scheduleDay = timetable.table[day]?.[hour];
                  return (
                    <td 
                      key={dayIdx}
                      className={scheduleDay ? 'text-white' : ''} 
                      style={scheduleDay ? { backgroundColor: scheduleDay.colorCode } : {}}
                    >
                      {scheduleDay && (
                        <div className="text-truncate" style={{ maxWidth: '100%', textTransform: 'capitalize' }}>
                          {scheduleDay.className.toLowerCase()}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Timetable;