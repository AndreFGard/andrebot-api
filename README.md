# timetable editor
Timetable editor is a webapp that helps students to choose the courses they are gonna enroll in
next semester, by pointing out time conflicts, creating a timetable and even recommending courses, based
on the mandatory courses they have completed already and the ones still due.

## Installation:
open a BASH shell and run the following commands:
```bash
cd backend
npm install
cd ../client
npm install
```

dont forget to create a ***courses.json*** file inside ``/backend``with the informations relative to each course in your institution,
under the following format:
```json
{

"MAJORNAME": {
    "TERMNUMBER": [
        {
            "major": "CC",
            "turma": "T1",
            "code": "CS101",
            "name": "Intro to CS",
            "professor": "Dr. Smith",
            "schedule_string": "Seg 9:00-9:50 (Room 101)",
            "term": 1,
            "optional": false,
            "id": 1,
            "days": [
                {
                    "day": "Seg",
                    "start": "09:00", "end": "09:50",
                    "classroom": "Room 101", "course_id": 1
                }
]}]}}
```