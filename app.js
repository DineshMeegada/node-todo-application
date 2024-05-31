const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
var isValid = require("date-fns/isValid");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error is ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const checkQueryParameters = (req, res, next) => {
  const { date, category, status, priority } = req.query;
  var result = isValid(new Date(date));
  if (
    category !== undefined ||
    status !== undefined ||
    priority !== undefined ||
    date !== undefined
  ) {
    if (category !== undefined) {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    } else if (status !== undefined) {
      if (status === "IN PROGRESS" || status === "TO DO" || status === "DONE") {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Status");
      }
    } else if (priority !== undefined) {
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    } else if (date !== undefined) {
      if (result) {
        next();
      } else {
        res.status(400);
        res.send("Invalid Due Date");
      }
    }
  } else {
    next();
  }
};

const checkBodyParameters = (req, res, next) => {
  const { dueDate, category, status, priority } = req.body;
  var result = isValid(new Date(dueDate));
  console.log(result);
  //   console.log(req.body.priority);
  if (
    category !== undefined ||
    status !== undefined ||
    priority !== undefined ||
    dueDate !== undefined
  ) {
    if (category !== undefined) {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    } else if (status !== undefined) {
      if (status === "IN PROGRESS" || status === "TO DO" || status === "DONE") {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Status");
      }
    } else if (priority !== undefined) {
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    } else if (dueDate !== undefined) {
      if (result) {
        next();
      } else {
        res.status(400);
        res.send("Invalid Due Date");
      }
    }
  } else {
    next();
  }
};

const checkPostBody = (req, res, next) => {
  const { dueDate, category, status, priority } = req.body;
  var dateResult = isValid(new Date(dueDate));
  const categoryResult =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const statusResult =
    status === "IN PROGRESS" || status === "TO DO" || status === "DONE";
  const priorityResult =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  if (dateResult === false) {
    res.status(400);
    res.send("Invalid Due Date");
  }
  if (categoryResult === false) {
    res.status(400);
    res.send("Invalid Todo Category");
  }
  if (statusResult === false) {
    res.status(400);
    res.send("Invalid Todo Status");
  }
  if (priorityResult === false) {
    res.status(400);
    res.send("Invalid Todo Priority");
  }
  if (statusResult && priorityResult && dateResult && categoryResult) {
    next();
  }
};

const getExactOutput = (item) => {
  return {
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    status: item.status,
    category: item.category,
    dueDate: item.due_date,
  };
};

const priorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const categoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const categoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const statusMethod = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const priorityMethod = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const categoryMethod = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", checkQueryParameters, async (req, res) => {
  const { status, search_q, priority, category } = req.query;
  let getTodoQuery = ``;
  //   console.log(req.query);
  switch (true) {
    case priorityAndStatus(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                priority = '${priority}' AND  status = '${status}'; `;
      break;
    case categoryAndStatus(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                category = '${category}' AND  status = '${status}';`;
      break;
    case categoryAndPriority(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                category = '${category}' AND  priority = '${priority}';`;
      break;
    case statusMethod(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                status = '${status}';`;
      break;
    case priorityMethod(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                priority = '${priority}';`;
      break;
    case categoryMethod(req.query):
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                category = '${category}';`;
      break;
    default:
      getTodoQuery = `
            SELECT 
             * 
            FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%';`;
  }
  const dbData = await db.all(getTodoQuery);
  res.send(dbData.map((Item) => getExactOutput(Item)));
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `
    select * from todo where id = ${todoId};`;
  const getTodoItem = await db.get(getTodoQuery);
  res.send(getExactOutput(getTodoItem));
});

app.get("/agenda/", checkQueryParameters, async (req, res) => {
  const { date } = req.query;
  const resDate = new Date(date);
  const filterDate = `${resDate.getFullYear()}-${
    resDate.getMonth() + 1
  }-${resDate.getDate()}`;
  console.log(filterDate);
  const getQuery = `
  select * from todo where due_date = ${date};`;
  const getItem = await db.all(getQuery);
  console.log(getItem);
  res.send(getExactOutput(getItem));
});

app.post("/todos/", checkPostBody, async (req, res) => {
  const { id, priority, dueDate, todo, status, category } = req.body;
  console.log(req.body.id);
  const addTodoQuery = `
    insert into todo ( id,todo,category,priority,status,due_date)
    values (
        ${id},
        '${todo}',
        '${category}',
        '${priority}',
        '${status}',
        '${dueDate}'
        );`;
  await db.run(addTodoQuery);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", checkBodyParameters, async (req, res) => {
  const { dueDate, category, todo, priority, status } = req.body;
  let responseValue;
  const { todoId } = req.params;
  let getUpdateQuery = ``;
  switch (true) {
    case dueDate !== undefined:
      responseValue = "Due Date Updated";
      getUpdateQuery = `
            UPDATE todo 
            SET due_date = '${dueDate}'
            WHERE id = ${todoId};`;
      break;
    case category !== undefined:
      responseValue = "Category Updated";
      getUpdateQuery = `
      UPDATE todo 
      SET category = '${category}'
      WHERE id = ${todoId};`;
      break;
    case priority !== undefined:
      responseValue = "Priority Updated";
      getUpdateQuery = `
        UPDATE todo 
      SET priority = '${priority}'
      WHERE id = ${todoId};`;
      break;
    case status !== undefined:
      responseValue = "Status Updated";
      getUpdateQuery = `
      UPDATE todo 
      SET status = '${status}'
      WHERE id = ${todoId};`;
      break;
    default:
      responseValue = "Todo Updated";
      getUpdateQuery = `
      UPDATE todo 
      SET todo = '${todo}'
      WHERE id = ${todoId};`;
  }
  await db.run(getUpdateQuery);
  res.send(responseValue);
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `
    DELETE FROM TODO WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  res.send("Todo Deleted");
});

module.exports = app;
