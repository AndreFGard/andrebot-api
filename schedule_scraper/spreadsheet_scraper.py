import os
filepath = os.getenv("PUBLICACAO_OFERTA_PATH_HTML") or '/guaxim/Downloads/Publicação Oferta Graduação 24.2 - Google Drive.html'
PRINT_DEBUG = 1


from os import major
from bs4 import BeautifulSoup
import re
from sys import stderr

from pydantic import BaseModel, ValidationError, ConfigDict
import bs4


TIME_REGEX_PATTERN = r'[a-zA-Z]{3}\. [0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2} \([a-zA-Z]*[0-9]*\)'
UNSTANDARD_REGEX = r'[a-zA-Z]{3}\. [0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}'
def get_schedule_matches(mainstr, regex=TIME_REGEX_PATTERN):
    matched = re.findall(regex, mainstr)
    matches = []
    for txt in matched:
            splitted = txt.split(" ")
            day = splitted[0][:-1]
            start, end = splitted[1].split("-")
            if regex != UNSTANDARD_REGEX:
                classroom = splitted[2][1:-1]
            else: classroom = "?"
            matches.append((day,start,end,classroom,))

    if not matches and regex != UNSTANDARD_REGEX: return get_schedule_matches(mainstr, UNSTANDARD_REGEX)
    else: return matches


from pydantic import constr

class DaySchedule:
    def __init__(self, day, start, end, classroom="    ", course_id=-1):
        self.course_id:int = course_id
        self.day = day
        self.start, self.end = start, end
        self.classroom = classroom

    def conflicts(self, day):
        conflicts = ((self.start < day.start and self.end > day.start)
              or (day.start < self.start and day.end > self.start)
            ) and self.day == day.day
        return conflicts

class ClassSchedule:
    def __init__(self, course_id: int, schedule_string): #type: ignore
        self.matches = (get_schedule_matches(schedule_string.strip()))
        self.days = [(match[0], DaySchedule(*match, course_id=course_id)) for match in self.matches]

class CourseInterface(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    major: str
    turma: str
    code: str
    name: str
    professor: str
    schedule_string: str
    term: int = -1
    optional: bool = False
    id: int = -1
    schedule: ClassSchedule | None = None



def decode_course_str(bscstring: str) -> tuple[str, str]:
    code, *name =  bscstring.split('-')
    return code.strip(),''.join(name).strip()


with open(filepath, 'r', encoding='utf-8') as file: #type: ignore
    content = file.read()

soup = BeautifulSoup(content, 'html.parser')

# Example of finding and printing a specific element
rows : list[bs4.Tag] = list(soup.find_all('tr')[1:])
#periodo = (rows[0].text.split(' ')[1])
#rows = rows[2:]


class CourseInfo(CourseInterface):
    def __init__(self, col_contents: list[str], id=-1, term=-1, optional=False, first_value_disqualifier="Órgão"):
        try:
            major = col_contents[0]
            if first_value_disqualifier in major:
                raise ValueError(f"Invalid major format: {major}")

            turma = col_contents[1]
            code, name = decode_course_str(col_contents[2])
            professor = col_contents[3]
            schedule_string = col_contents[4]

            if not code: raise ValueError("Course code is empty")

            super().__init__(major=major, turma=turma, code=code, name=name,
                             professor=professor, schedule_string=schedule_string,
                              term=term, optional=optional, id=id)

            self.schedule = ClassSchedule(self.id, schedule_string)

        except IndexError as e:
            raise ValidationError(f'Invalid course data format: {col_contents}') from e

    def __repr__(self):
        return f"{self.major}-{self.code}-{self.name}: {self.professor}"

class OptionalCourseInfo(CourseInfo):
    def __init__(self, col_contents: list[str], id=-1):
        try:
            term = int(col_contents[1])
        except:
            term=-1
        col_contents.pop(1)
        super().__init__(col_contents, term=term, optional=True)

class TermNumberRow:
    def __init__(self, col_contents:list[str], separator=":", term_name_identifier="Período"):
        self.term_name = col_contents[0]
        self.term_code = int(col_contents[0].split(separator)[1])
        if term_name_identifier not in self.term_name:
            raise ValueError(f"Invalid term name format: {self.term_name}")


class TermHeaderRow:
    """Useless as we know the header values"""
    def __init__(self, col_contents:list[str], term=-1, expected_first_value="Órgão"):
        if expected_first_value not in col_contents[0]:
            raise ValueError(f"Invalid term header format: {col_contents}")
        self.term = term



def scrape_schedulenew(rows):    
    majors= ["CC", "EC", "SI", "EXTERNA"]
    cmajor=""
    currentTerm = -1
    optional_delimiter = 101

    courses={mj:[] for mj in majors}

    weirdcounter = 0 # debugging
    weirds = []
    emptylinecounter = 0
    """empty lines separate tabs in the spreadsheet, so they 
        can be used to separate majors (be careful with optional courses"""

    for i,r in enumerate(rows):

        cols = r.find_all('td')
        #each column is either a course info (len 6) or a header (len 4). only includes nonempty columns
        col_content = [c.text for c in cols]
        
        #TERM and MAJOR SWITCHER
        try:
            #term delimiter. It's also the course delimiter, as each course starts on 1
            newTermNumber = int(TermNumberRow(col_content).term_code)
            if not len(cmajor):
                cmajor = 'CC'
            elif (newTermNumber == 1):
                cmajor = majors[majors.index(cmajor) + 1]
                #major_start_idx[cmajor] = len(courses)
            
            currentTerm = newTermNumber
            continue
        except:
            ...

        #term headers are only useful for external courses
        try:
            newTermHeader = TermHeaderRow(col_content)
            if emptylinecounter==4:
                cmajor="EXTERNA"
                emptylinecounter=0
            continue
        except:
            ...

        try:
            usemajor = cmajor
            #optional courses have 6 columns (the term is included as the second col)
            if len(col_content) == 6:
                #switch to the optional strategy
                optional_term=col_content[1]
                course = OptionalCourseInfo(col_content, id=i)
                cmajor = course.major
            else:
                course= CourseInfo(col_content, term=currentTerm, optional=False,id=i)

            courses[usemajor].append(course)
            continue
        except: 
            ...
        
        if not len(col_content):
            emptylinecounter+=1
        if len(col_content) and len(col_content[0]) > 1:
            weirds.append(col_content)
            weirdcounter += 1
            print(f'WEIRD ROW: "{col_content}" after course:\n\t{courses[cmajor][-1].__repr__()}\n\tcol conts.:{col_content}\n', file=stderr)
    
    print(f'weird rows: {weirdcounter}', file=stderr)
    len(courses)
    return courses

coursesByMajor = scrape_schedulenew(rows)
print(f"\n\n\n#{'-'*100}#\n{coursesByMajor['CC'][:3]}", file=stderr)

# Print the lengths of courses for each major
for major, courses in coursesByMajor.items():
    print(f"Major {major}: {len(courses)} courses", file=stderr)

def dumpSchedule(schedule: ClassSchedule):
    days = []
    for d in schedule.days:
        days.append({
            "day": d[1].day,
            "start": d[1].start,
            "end": d[1].end,
            "classroom": d[1].classroom,
            "course_id": d[1].course_id
        })
    return days
        


def dumpCourse(course: CourseInfo):
    x = course.model_dump()
    x.pop('schedule')
    x['days'] = dumpSchedule(course.schedule) #type: ignore
    return x

def dumpCoursesByTerm(courses: list[CourseInfo]):
    terms = {}
    for c in courses:
        dumped = dumpCourse(c)
        if str(c.term) not in terms:
            terms[str(c.term)] = [dumped]
        else:
            terms[str(c.term)].append(dumped)
    return terms


coursesByMajorAndTerm = {maj:dumpCoursesByTerm(coursesByMajor[maj]) for maj in coursesByMajor}
#dump into json

import json
with open("courses2.json", "w", encoding="utf-8") as f:
    json.dump(coursesByMajorAndTerm, f, ensure_ascii=False, indent=4)

