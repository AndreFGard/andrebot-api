import {ScheduleDay, TimetableRenderInfo} from './../../src/api';

interface TimetableProps{
  renderinfo: TimetableRenderInfo;
  onCourseToggle: (value: number) => void;
  selectedCourseIds: Set<number>;
}

// Helper function to check if two schedule items belong to the same course block
const isSameCourseBlock = (item1: ScheduleDay | undefined, item2: ScheduleDay | undefined): boolean => {
  if (!item1 || !item2) return false;
  return item1.className === item2.className;
};

// Helper function to merge course blocks by calculating cell and inner div classes
const calculateCellClasses = (isContinuation: boolean, isFollowed: boolean) => {
  // Base classes for the cell
  let tdClasses = "p-0 border border-l-gray-200 border-r-gray-200 relative h-12 align-top";
  // Conditionally hide top/bottom borders for merging
  tdClasses += isContinuation ? " border-t-transparent" : " border-t-gray-200";
  tdClasses += isFollowed ? " border-b-transparent" : " border-b-gray-200";

  // Classes for the inner colored div positioning
  let divPositionClasses = "absolute inset-x-1";
  divPositionClasses += isContinuation ? " top-0" : " top-1";
  divPositionClasses += isFollowed ? " bottom-0" : " bottom-1";

  const divBaseClasses = `${divPositionClasses} overflow-hidden transition-all duration-150 hover:shadow-md`;

  // Classes for inner div rounding
  let divRoundingClasses = "";
  if (!isContinuation) divRoundingClasses += " rounded-t-md";
  if (!isFollowed) divRoundingClasses += " rounded-b-md";
  if (!isContinuation && !isFollowed) divRoundingClasses = " rounded-md"; // Full rounding for standalone blocks

  return { tdClasses, divBaseClasses, divRoundingClasses };
};


const Timetable: React.FC<TimetableProps> = ({ renderinfo, onCourseToggle, selectedCourseIds}) => {
  selectedCourseIds;
  const { timetable, conflictlessClasses, conflicts, conflictIds, conflictfullClasses } = renderinfo;
  const conflictfulIds =(new Set(conflicts.map(([cls1, cls2, day])=>[cls1.id,cls2.id]).flat()))

  return (
    <>
      <div className="overflow-auto">
        <h4> Disciplinas escolhidas:</h4>
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
            {conflictlessClasses.concat(conflictfullClasses).filter(x=>x).map((classItem, idx) => (
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
                    Remover
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
          There were conflicts between your courses! : {(Array.from((new Set(conflicts.map(([cls1, cls2, day])=> cls1.shortName))).values())).join(', ')}
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
            {timetable.aproxHourList.map((hour, hourIndex) => (
              <tr key={hour} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-2 text-xs font-medium text-gray-500 border border-gray-50 text-center align-middle">{hour}</td>
                {['seg', 'ter', 'qua', 'qui', 'sex'].map((day) => {
                  const scheduleDay = timetable.table[day]?.[hour];
                  const prevHour = timetable.aproxHourList[hourIndex - 1];
                  const nextHour = timetable.aproxHourList[hourIndex + 1];
                  const prevScheduleDay = timetable.table[day]?.[prevHour];
                  const nextScheduleDay = timetable.table[day]?.[nextHour];

                  const isContinuation = isSameCourseBlock(scheduleDay, prevScheduleDay);
                  const isFollowed = isSameCourseBlock(scheduleDay, nextScheduleDay);

                  // Calculate classes using the helper function
                  const { tdClasses, divBaseClasses, divRoundingClasses } = calculateCellClasses(isContinuation, isFollowed);

                  return (
                    <td
                      key={day}
                      className={tdClasses}
                    >
                      {scheduleDay && (
                        <div
                          className={`${divBaseClasses} ${divRoundingClasses} z-10`}
                          style={{
                            backgroundColor: scheduleDay.colorCode,
                            opacity: 0.8
                          }}
                        >
                          {/* Only show text in the first block of a sequence */}
                          {!isContinuation && (
                            <div className="p-1 h-full flex flex-col justify-start text-left"> {/* Adjusted padding p-1.5 to p-1 */}
                              <div className="text-[9px] font-semibold text-gray-800 mb-0.5 truncate"> {}
                                {scheduleDay.start}-{scheduleDay.end}
                              </div>
                              <div className="text-[11px] font-semibold text-gray-900 capitalize leading-tight truncate"> {}
                                {scheduleDay.className.toLowerCase()}
                              </div>
                              {}
                            </div>
                          )}
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