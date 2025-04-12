import {TimetableRenderInfo} from './../../src/api';

interface TimetableProps{
  renderinfo: TimetableRenderInfo;
  onCourseToggle: (value: number) => void;
  selectedCourseIds: Set<number>;
}

const Timetable: React.FC<TimetableProps> = ({ renderinfo, onCourseToggle, selectedCourseIds}) => {
  selectedCourseIds;
  const { timetable, conflictlessClasses, conflicts, conflictIds } = renderinfo;

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Professor</th>
              <th className="p-2">Action</th>
              <th className="p-2">Code</th>
            </tr>
          </thead>
          <tbody>
            {conflictlessClasses.map((classItem, idx) => (
              <tr key={idx} className={`border-t ${conflictIds.includes(classItem.id) ? 'bg-red-100' : 'hover:bg-gray-50'}`}>
                <th className="p-2">{idx + 1}</th>
                <td className="p-2 capitalize">{classItem.name.toLowerCase()}</td>
                <td className="p-2">
                  <span className="truncate block max-w-[150px]">
                    {classItem.professor}
                  </span>
                </td>
                <td className="p-2">
                  <button 
                    className="px-2 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors" 
                    id={`classButton${idx}`} 
                    type="button" 
                    onClick={() => {
                      onCourseToggle(Number(classItem.id));
                    }}
                  >
                    Delete
                  </button>
                </td>
                <td className="p-2">
                  {classItem.code}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr className="my-6"/>

      {conflictIds.length > 0 && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-700 border border-red-200">
          There were conflicts between your courses! : {conflicts.map(([cls1, cls2, day]) => 
            `${cls1.code}-${cls2.code} (${day.day} ${day.start}-${day.end})`).join(' || ')}
        </div>
      )}
      
      {timetable.aproxHourList.length === 0 && (
        <div className="p-4 mb-4 rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200">
          Your timetable is empty!
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 font-sans">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 text-center w-20">Time</th>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((day) => (
                <th key={day} className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {timetable.aproxHourList.map((hour) => (
              <tr key={hour} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-2 text-xs font-medium text-gray-500 border border-gray-200 text-center align-middle">{hour}</td>
                {['seg', 'ter', 'qua', 'qui', 'sex'].map((day) => {
                  const scheduleDay = timetable.table[day]?.[hour];
                  return (
                    <td
                      key={day}
                      className="p-0.5 border border-gray-200 relative h-16 align-top"
                    >
                      {scheduleDay && (
                        <div
                          className="absolute inset-1.5 rounded-md overflow-hidden shadow-sm transition-all duration-150 hover:shadow-md"
                          style={{
                            backgroundColor: scheduleDay.colorCode,
                            opacity: 0.7
                          }}
                        >
                          <div className="p-1.5 h-full flex flex-col justify-center">
                            <div className="text-[10px] font-semibold text-gray-800 mb-0.5 truncate"> {}
                              {scheduleDay.start}-{scheduleDay.end}
                            </div>
                            <div className="text-xs font-semibold text-gray-900 capitalize leading-tight truncate"> {}
                              {scheduleDay.className.toLowerCase()}
                            </div>
                          </div>
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