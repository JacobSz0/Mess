from fastapi import FastAPI, HTTPException, Depends, Response, Request
from pydantic import BaseModel
import sqlite3, json, uuid, os
from fastapi.middleware.cors import CORSMiddleware
from jwtdown_fastapi.authentication import Token, Authenticator


def create_connection():
    connection = sqlite3.connect("mess.db")
    return connection

def create_table():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointment_data TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_data TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categorys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_data TEXT NOT NULL
        )
    """)


    cursor.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            role_id INTEGER NOT NULL,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )
    """)
    connection.commit()
    connection.close()

create_table()  # Call this function to create the table


class AccountIn(BaseModel):
    username: str
    email: str
    password: str
    role_id: int


class AccountOut(BaseModel):
    id: int
    username: str
    email: str
    role_id: int

class AccountOutWithPassword(AccountOut):
    hashed_password: str


class RoleIn(BaseModel):
    role: str


class RoleOut(BaseModel):
    id: int
    role: str

class DuplicateAccountError(ValueError):
    pass

class AppointmentCreate(BaseModel):
    name: str
    grade: str
    start: str
    end: str
    category: str
    reason: str
    notes: str

class Appointment(AppointmentCreate):
    id: int
class StudentCreate(BaseModel):
    first: str
    last: str
    idnum: str
    grade: str

class Student(StudentCreate):
    id: int
class CategoryCreate(BaseModel):
    code: str
    name: str

class Category(CategoryCreate):
    id: int
class AccountQueries:
    def create_acc(self, info: AccountIn, hashed_password: str) -> AccountOutWithPassword:
        try:
            connection = create_connection()
            cursor = connection.cursor()
            query = """
                    INSERT INTO accounts (username, email, hashed_password, role_id)
                    VALUES (?, ?, ?, ?)
                    """
            cursor.execute(query, (info.username, info.email, hashed_password, info.role_id))
            connection.commit()
            account_id = cursor.lastrowid

            # Retrieve the created account to return the complete account information
            account = self.get_one_account(info.username)

            connection.close()
            if account:
                return account
            else:
                # If the account is not found or there's an issue, handle it accordingly
                raise ValueError("Error occurred while retrieving the created account")

        except sqlite3.Error as e:
            # Log the error for troubleshooting purposes
            print(f"Error occurred while creating account: {e}")
            # Re-raise the original exception to maintain the stack trace
            raise
    def get_one_account(self, username: str) -> AccountOutWithPassword:
        try:
            connection = create_connection()
            cursor = connection.cursor()
            query = """
                    SELECT id, username, email, hashed_password, role_id
                    FROM accounts
                    WHERE username = ?
                    """
            cursor.execute(query, (username,))
            record = None
            row = cursor.fetchone()
            if row is not None:
                record = {}
                for i, column in enumerate(cursor.description):
                    record[column[0]] = row[i]
            return record
        except sqlite3.Error as e:
            # Log the error or handle the exception according to your application's strategy
            print(f"Error occurred while retrieving account: {e}")
            return None

    def get_all_accounts(self):
        try:
            connection = create_connection()
            cursor = connection.cursor()
            cursor.execute(
                        """
                    SELECT id, username, email, role_id
                    FROM accounts
                    """
                    )
            results = [
                AccountOut(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    role_id=row[3],
                )
                for row in cursor.fetchall()
            ]
            return results
        except sqlite3.Error as e:
            # Log the error or handle the exception according to your application's strategy
            print(f"Error occurred while retrieving all accounts: {e}")
            return None

    def delete_account(self, id: int) -> bool:
        try:
            connection = create_connection()
            cursor = connection.cursor()
            query = """
                    DELETE FROM accounts
                    WHERE id = ?
                    """
            cursor.execute(query, (id,))
            connection.commit()
            return True
        except Exception as e:
            # Handle exceptions or log the error
            print(e)
            return False

class RoleQueries:
    def create_role(self, role: RoleIn) -> RoleOut:
        try:
            connection = create_connection()
            cursor = connection.cursor()
            query = """
                    INSERT INTO roles (role)
                    VALUES (?)
                    """
            cursor.execute(query, (role.role,))
            connection.commit()

            # Retrieve the last inserted row id
            cursor.execute("SELECT last_insert_rowid()")
            id = cursor.fetchone()[0]

            return self.role_in_out(id, role)
        except Exception as e:
            # Handle exceptions or log the error
            print(e)
            return None


    def roles(self):
        try:
            connection = create_connection()
            cursor = connection.cursor()
            result = cursor.execute(
                        """
                        SELECT
                        id,
                        role
                        FROM roles
                        """
            )
            return [self.records_in_out(record) for record in result]
        except Exception:
            return {"message": "Could not get all roles"}

    def delete_role(self, id: int) -> bool:
        try:
            connection = create_connection()
            cursor = connection.cursor()
            query = """
                    DELETE FROM roles
                    WHERE id = ?
                    """
            cursor.execute(query, (id,))
            connection.commit()
            return True
        except Exception:
            return False

    def role_in_out(self, id: int, role: RoleIn):
        data = role.dict()
        return RoleOut(id=id, **data)

    def records_in_out(self, record):
        return RoleOut(
            id=record[0],
            role=record[1],
        )

def get_all_appointments():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, appointment_data FROM appointments")
    appointments = cursor.fetchall()
    connection.close()

    appointments_list = []
    for appointment in appointments:
        appointment_dict = {"id": appointment[0], **json.loads(appointment[1])}
        appointments_list.append(appointment_dict)
    return appointments_list

def create_appointment(appointment: AppointmentCreate):
    connection = create_connection()
    cursor = connection.cursor()
    appointment_data = json.dumps({"name": appointment.name, "grade": appointment.grade, "start": appointment.start, "end": appointment.end, "category": appointment.category, "reason": appointment.reason, "notes": appointment.notes})
    cursor.execute("INSERT INTO appointments (appointment_data) VALUES (?)", (appointment_data,))
    connection.commit()
    appointment_id = cursor.lastrowid
    connection.close()
    return appointment_id

def get_appointment_by_id(appointment_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT appointment_data FROM appointments WHERE id = ?", (appointment_id,))
    appointment = cursor.fetchone()
    connection.close()
    if appointment:
        return json.loads(appointment[0])
    else:
        raise HTTPException(status_code=404, detail="Appointment not found")

def update_appointment(appointment_id: int, appointment: AppointmentCreate):
    connection = create_connection()
    cursor = connection.cursor()
    appointment_data = json.dumps({"name": appointment.name, "grade": appointment.grade, "start": appointment.start, "end": appointment.end, "category": appointment.category, "reason": appointment.reason, "notes": appointment.notes})
    cursor.execute("UPDATE appointments SET appointment_data = ? WHERE id = ?", (appointment_data, appointment_id))
    connection.commit()
    connection.close()

def delete_appointment(appointment_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM appointments WHERE id = ?", (appointment_id,))
    connection.commit()
    connection.close()

def get_all_students():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, student_data FROM students")
    students = cursor.fetchall()
    connection.close()

    students_list = []
    for student in students:
        student_dict = {"id": student[0], **json.loads(student[1])}
        students_list.append(student_dict)
    return students_list

def create_student(student: StudentCreate):
    connection = create_connection()
    cursor = connection.cursor()
    student_data = json.dumps({"first": student.first, "last": student.last, "idnum": student.idnum, "grade": student.grade})
    cursor.execute("INSERT INTO students (student_data) VALUES (?)", (student_data,))
    connection.commit()
    student_id = cursor.lastrowid
    connection.close()
    return student_id

def get_student_by_id(student_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT student_data FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    connection.close()
    if student:
        return json.loads(student[0])
    else:
        raise HTTPException(status_code=404, detail="Student not found")

def update_student(student_id: int, student: StudentCreate):
    connection = create_connection()
    cursor = connection.cursor()
    student_data = json.dumps({"first": student.first, "last": student.last, "idnum": student.idnum, "grade": student.grade})
    cursor.execute("UPDATE students SET student_data = ? WHERE id = ?", (student_data, student_id))
    connection.commit()
    connection.close()

def delete_student(student_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    connection.commit()
    connection.close()

def get_all_categorys():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, category_data FROM categorys")
    categorys = cursor.fetchall()
    connection.close()

    categorys_list = []
    for category in categorys:
        category_dict = {"id": category[0], **json.loads(category[1])}
        categorys_list.append(category_dict)
    return categorys_list

def create_category(category: CategoryCreate):
    connection = create_connection()
    cursor = connection.cursor()
    category_data = json.dumps({"code": category.code, "name": category.name})
    cursor.execute("INSERT INTO categorys (category_data) VALUES (?)", (category_data,))
    connection.commit()
    category_id = cursor.lastrowid
    connection.close()
    return category_id

def get_category_by_id(category_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT category_data FROM categorys WHERE id = ?", (category_id,))
    category = cursor.fetchone()
    connection.close()
    if category:
        return json.loads(category[0])
    else:
        raise HTTPException(status_code=404, detail="Category not found")

def update_category(category_id: int, category: CategoryCreate):
    connection = create_connection()
    cursor = connection.cursor()
    category_data = json.dumps({"code": category.code, "name": category.name})
    cursor.execute("UPDATE categorys SET category_data = ? WHERE id = ?", (category_data, category_id))
    connection.commit()
    connection.close()

def delete_category(category_id: int):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM categorys WHERE id = ?", (category_id,))
    connection.commit()
    connection.close()


class AccountToken(Token):
    account: AccountOut


class HttpError(BaseModel):
    detail: str


class AccountForm(BaseModel):
    username: str
    email: str
    password: str



class MyAuthenticator(Authenticator):
    async def get_account_data(
        self,
        username: str,
        accounts: AccountQueries,
    ):
        # Use your repo to get the account based on the
        # username (which could be an email)
        return accounts.get_one_account(username)

    def get_account_getter(
        self,
        accounts: AccountQueries = Depends(),
    ):
        # Return the accounts. That's it.
        return accounts

    def get_hashed_password(self, account: AccountOutWithPassword):
        # Return the encrypted password value from your
        # account object
        return account["hashed_password"]

    def get_account_data_for_cookie(self, account: AccountOut):
        # Return the username and the data for the cookie.
        # You must return TWO values from this method.
        return account["username"], AccountOut(**account)

default_signing_key = str(uuid.uuid4())

signing_key = os.environ.get("SIGNING_KEY", default_signing_key)
authenticator = MyAuthenticator(signing_key)



app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",  # Example: React development server
    "https://jacobsz0.github.io",  # The domain of your React app
]

# Add the CORS middleware with allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the CRUD API"}

@app.get("/protected")
async def get_protected(
    account_data: dict = Depends(authenticator.get_current_account_data),
):
    return True


@app.get("/accounts")
def accounts_list(
    repo: AccountQueries = Depends(),
):
    return repo.get_all_accounts()


@app.post("/accounts", response_model=AccountToken | HttpError)
async def create_account(
    info: AccountIn,
    request: Request,
    response: Response,
    accounts: AccountQueries = Depends(),
):
    hashed_password = authenticator.hash_password(info.password)
    try:
        account = accounts.create_acc(info, hashed_password)
    except DuplicateAccountError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create an account with those credentials",
        )
    form = AccountForm(
        username=info.username, email=info.email, password=info.password
    )
    token = await authenticator.login(response, request, form, accounts)
    return AccountToken(account=account, **token.dict())


@app.get("/token", response_model=AccountToken | None)
async def get_token(
    request: Request,
    account: AccountOut = Depends(authenticator.try_get_current_account_data),
) -> AccountToken | None:
    if account and authenticator.cookie_name in request.cookies:
        return {
            "access_token": request.cookies[authenticator.cookie_name],
            "type": "Bearer",
            "account": account,
        }


@app.delete("/accounts/{id}")
def delete_account(id: int, response: Response, repo: AccountQueries = Depends()):
    return repo.delete_account(id)

@app.post("/role")
def create_role(role: RoleIn, repo: RoleQueries = Depends()):
    return repo.create_role(role)

@app.get("/role")
def all_roles(repo: RoleQueries = Depends()):
    return repo.roles()

@app.delete("/role/{role_id}")
def delete_role(role_id: int, repo: RoleQueries = Depends()):
    return repo.delete_role(role_id)


@app.get("/appointments/")
def get_all_appointments_endpoint():
    all_appointments = get_all_appointments()
    return {"appointments": all_appointments}

@app.post("/appointments/")
def create_appointment_endpoint(appointment: AppointmentCreate):
    appointment_id = create_appointment(appointment)
    return {"id": appointment_id, "name": appointment.name, "start": appointment.start, "grade": appointment.grade, "end": appointment.end, "category": appointment.category, "reason": appointment.reason, "notes": appointment.notes}

@app.get("/appointments/{appointment_id}")
def get_appointment(appointment_id: int):
    appointment = get_appointment_by_id(appointment_id)
    return {"appointment": appointment}

@app.put("/appointments/{appointment_id}")
def update_appointment_endpoint(appointment_id: int, appointment: AppointmentCreate):
    get_appointment_by_id(appointment_id)
    update_appointment(appointment_id, appointment)
    return {"message": "Appointment updated successfully", "id": appointment_id, "content": appointment}

@app.delete("/appointments/{appointment_id}")
def delete_appointment_endpoint(appointment_id: int):
    get_appointment_by_id(appointment_id)
    delete_appointment(appointment_id)
    return {"message": "Appointment deleted successfully"}
@app.get("/students/")
def get_all_students_endpoint():
    all_students = get_all_students()
    return {"students": all_students}

@app.post("/students/")
def create_student_endpoint(student: StudentCreate):
    student_id = create_student(student)
    return {"id": student_id, "first": student.first, "last": student.last, "idnum": student.idnum, "grade": student.grade}

@app.get("/students/{student_id}")
def get_student(student_id: int):
    student = get_student_by_id(student_id)
    return {"student": student}

@app.put("/students/{student_id}")
def update_student_endpoint(student_id: int, student: StudentCreate):
    get_student_by_id(student_id)
    update_student(student_id, student)
    return {"message": "Student updated successfully", "id": student_id, "content": student}

@app.delete("/students/{student_id}")
def delete_student_endpoint(student_id: int):
    get_student_by_id(student_id)
    delete_student(student_id)
    return {"message": "Student deleted successfully"}
@app.get("/categorys/")
def get_all_categorys_endpoint():
    all_categorys = get_all_categorys()
    return {"categorys": all_categorys}

@app.post("/categorys/")
def create_category_endpoint(category: CategoryCreate):
    category_id = create_category(category)
    return {"id": category_id, "code": category.code, "name": category.name}

@app.get("/categorys/{category_id}")
def get_category(category_id: int):
    category = get_category_by_id(category_id)
    return {"category": category}

@app.put("/categorys/{category_id}")
def update_category_endpoint(category_id: int, category: CategoryCreate):
    get_category_by_id(category_id)
    update_category(category_id, category)
    return {"message": "Category updated successfully", "id": category_id, "content": category}

@app.delete("/categorys/{category_id}")
def delete_category_endpoint(category_id: int):
    get_category_by_id(category_id)
    delete_category(category_id)
    return {"message": "Category deleted successfully"}
