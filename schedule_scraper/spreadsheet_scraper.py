import os
filepath =  os.getenv("OFERTA_GRADUACAO_HTML_PATH")
PRINT_DEBUG = 1


from bs4 import BeautifulSoup
import re


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

class ClassSchedule:
    ...

class Course:
    def __init__(self, bachelor, bachelor_code_str, professor, schedule, id,term=0, optional=0):
        self.bachelor = bachelor
        self.code,self.name = get_code_name(bachelor_code_str)

        self.professor = professor.strip()
        self.schedule_string = schedule
        self.term = term
        self.id = id
        self.optional=0
        
        self.schedule = ClassSchedule(self, self.schedule_string)

    def to_dict(self):
        days = [{'day': d[1].day, 'start':d[1].start, 'end':d[1].end,'classroom': d[1].classroom} for d in self.schedule.days]
        return {'bachelor': self.bachelor, 'code':self.code, 'id': self.id, 'name': self.name,
                 'professor':self.professor, 'days': days, 'term' : self.term,
                   'optional': self.optional}

class DaySchedule:
    def __init__(self, course, day, start, end, classroom="    "):
        self.course = course
        self.day = day
        self.start, self.end = start, end
        self.classroom = classroom

    def conflicts(self, day):
        conflicts = ((self.start < day.start and self.end > day.start)
              or (day.start < self.start and day.end > self.start)
            ) and self.day == day.day
        return conflicts
        
    

class ClassSchedule:
    def __init__(self, course_info: Course, schedule_string):
        self.matches = (get_schedule_matches(schedule_string.strip()))
        self.days = [(match[0], DaySchedule(course_info, *match)) for match in self.matches]
        


        
        
def get_code_name(bscstring):
    code, *name =  bscstring.split('-')
    return code.strip(),''.join(name).strip()






with open(filepath, 'r', encoding='utf-8') as file:
    content = file.read()


soup = BeautifulSoup(content, 'html.parser')


# Example of finding and printing a specific element
rows = list(soup.find_all('tr')[1:])
#periodo = (rows[0].text.split(' ')[1])
#rows = rows[2:]


headers_term_counter,weirdcounter, periodo = 0,0,0
weirds = []
terms = {}
currentTerm = 0
for i,r in enumerate(rows):

    cols = r.find_all('td')
    info = [c.text for c in cols if c.text]

    if len(info) == 4:
        isoptional = i > 101
        courses.append(Course(*info,i, term=currentTerm, optional=float(isoptional)))
    elif len(info) == 5:
        #headers here
        headers_term_counter +=1
        continue
    elif len(info) == 1:
        terms[int(info[0].split(' ')[1])] =  terms.get(int(info[0].split(' ')[1])) or []
        courses = terms[int(info[0].split(' ')[1])]
        headers_term_counter +=1
        currentTerm = int(info[0].split(": ")[1])
    else:
        weirds.append(info)
        weirdcounter+=1
        continue

totalrows = i

if PRINT_DEBUG:
    for k in terms: print(k, end=' ')
    i=0
    for k in terms:
        print(f'{k}: ')
        termlist = terms[k]
        for term in termlist:
            i+=1
            print(f"\t{i}: {term.name} - {term.schedule_string}")

    print(f'total rows: {totalrows} - {headers_term_counter} = {totalrows-headers_term_counter}\n\tsaved rows: {i}\n\tweirds: {weirdcounter}: {weirds}')

cc = {}
ec = {}
si = {}
other = {}
for term in terms:
    cc[term] = []
    ec[term] = []
    si[term] =[]
    other[term] = []
    for course in terms[term]:
        if not course.optional:
            match course.bachelor:
                case "CC": cc[term].append(course.to_dict())
                case "EC": ec[term].append(course.to_dict())
                case "SI": si[term].append(course.to_dict())
                case _: other[term].append(course.to_dict())

        else: other[term].append(course.to_dict())


file = open('courses.json', 'w')
import json
json.dump({'CC': cc, 'EC': ec, 'SI': si, 'other': other}, file)
file.close()