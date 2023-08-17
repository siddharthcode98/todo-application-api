const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running ar http://localhost/3000/....");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//function to check different request queries
const onlyStatusInRequestQuery = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const onlyPriorityInRequestQuery = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const priorityAndStatusInRequestQuery = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const onlySearchInRequestQuery = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const onlyCategoryInRequestQuery = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const onlyCategoryAndStatusInRequestQuery = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const onlyCategoryAndPriorityInRequestQuery = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const validStatus = ["DONE", "IN PROGRESS", "TO DO"];
const validPriority = ["HIGH", "LOW", "MEDIUM"];
const validCategory = ["HOME", "WORK", "LEARNING"];
//validaty functions
statusValidity = (status) => validStatus.some((each) => each === status);
priorityValidity = (priority) =>
  validPriority.some((each) => each === priority);
categoryValidity = (category) =>
  validCategory.some((each) => each === category);

//API 1
app.get("/todos/", async (request, response) => {
  let { status, priority, search_q = "", category, dueDate } = request.query;
  //   console.log(status);
  let getToDoBasedOnQueryParameter = "";
  let result = "";
  switch (true) {
    case onlyStatusInRequestQuery(request.query):
      result = statusValidity(status);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE status='${status}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case onlyPriorityInRequestQuery(request.query):
      result = priorityValidity(priority);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE priority='${priority}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case priorityAndStatusInRequestQuery(request.query):
      result = statusValidity(status) && priorityValidity(priority);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority='${priority}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else if (statusValidity(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (priorityValidity(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case onlySearchInRequestQuery(request.query):
      getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE todo LIKE '%${search_q}%';`;
      const listOfToDoBasedOnQueryParament = await db.all(
        getToDoBasedOnQueryParameter
      );
      response.send(listOfToDoBasedOnQueryParament);
      break;
    case onlyCategoryAndStatusInRequestQuery(request.query):
      result = categoryValidity(category) && statusValidity(status);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE status='${status}' AND category='${category}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else if (categoryValidity(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (statusValidity(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case onlyCategoryInRequestQuery(request.query):
      result = categoryValidity(category);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE category='${category}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case onlyCategoryAndPriorityInRequestQuery(request.query):
      result = categoryValidity(category) && priorityValidity(priority);
      if (result) {
        getToDoBasedOnQueryParameter = `SELECT id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE status='${priority}' AND category='${category}';`;
        const listOfToDoBasedOnQueryParament = await db.all(
          getToDoBasedOnQueryParameter
        );
        response.send(listOfToDoBasedOnQueryParament);
      } else if (categoryValidity(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (priorityValidity(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
  }
});

//API 2 Returns a specific todo based on the todo ID
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getToDoBasedOnTodoId = `
    SELECT  id AS id,todo AS todo,status AS status,priority AS priority,category AS category,due_date AS dueDate FROM todo WHERE id= ${todoId};`;
  const todo = await db.get(getToDoBasedOnTodoId);
  response.send(todo);
});

//API 3 Returns a list of all todos with a specific due date in the query parameter `/agenda/?date=2021-12-12`
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const result = isValid(new Date(date));
  console.log(result);
  //   console.log(result);
  if (result) {
    const newDate = format(new Date(date), `yyyy-MM-dd`);
    const getTodoOnDate = `
    SELECT id AS id,todo AS todo,priority AS priority,status AS status,category AS category,due_date AS dueDate FROM todo WHERE due_date='${newDate}';`;
    const todoOnDate = await db.all(getTodoOnDate);
    response.send(todoOnDate);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4 Create a todo in the todo table,
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const dateValidity = isValid(new Date(dueDate));
  let result =
    statusValidity(status) &&
    priorityValidity(priority) &&
    categoryValidity(category) &&
    dateValidity;
  if (result) {
    const newDate = format(new Date(dueDate), `yyyy-MM-dd`);
    const insertToDO = `INSERT INTO
      todo(id,todo,priority,status,category,due_date)
      VALUES
      (
          '${id}',
          '${todo}',
          '${priority}',
          '${status}',
          '${category}',
          '${newDate}'
        );`;
    await db.run(insertToDO);
    response.send("Todo Successfully Added");
  } else if (statusValidity(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (priorityValidity(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (categoryValidity(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (dateValidity === false) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 5 Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getPreviousToDoQuery = `SELECT * FROM todo WHERE id =${todoId};`;
  const getPreviousToDo = await db.get(getPreviousToDoQuery);
  const {
    todo = getPreviousToDo.todo,
    category = getPreviousToDo.category,
    priority = getPreviousToDo.priority,
    status = getPreviousToDo.status,
    dueDate = getPreviousToDo.due_date,
  } = request.body;
  const updateToDo = `UPDATE todo
  SET
  todo='${todo}',
  priority='${priority}',
  status='${status}',
  category='${category}',
  due_date='${dueDate}'
  WHERE
  id=${todoId};`;
  await db.run(updateToDo);
  let result = "";
  switch (true) {
    case request.body.status !== undefined:
      result = statusValidity(status);
      if (result) {
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case request.body.priority !== undefined:
      result = priorityValidity(priority);
      if (result) {
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case request.body.category !== undefined:
      result = categoryValidity(category);
      if (result) {
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case request.body.todo !== undefined:
      response.send("Todo Updated");
      break;
    case request.body.dueDate !== undefined:
      result = isValid(new Date(dueDate));
      if (result) {
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
//API 6
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteToDoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteToDoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
