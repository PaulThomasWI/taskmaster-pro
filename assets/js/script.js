var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Click a task p.element turns the element into a textarea
$(".list-group").on("click", "p", function() {
  var myText = $(this)
    .text()
    .trim();

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(myText);

  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// Event Listener for p.element
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var myText = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var myStatus = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var myIndex = $(this)
    .closest(".list-group-item")
    .index();

  tasks[myStatus][myIndex].text = myText;
  saveTasks();

  // change the textarea.element back to a p.element
  var myTaskP = $("<p>")
    .addClass("m-1")
    .text(myText);

  $(this).replaceWith(myTaskP);
});

// Event Listener for due date click
$(".list-group").on("click", "span", function() {
  // get current text
  var myDate = $(this).text().trim();

  // create new input element
  var myDateInput = $("<input>").attr("type", "text").addClass("form-control").val(myDate);

  // swap out elements
  $(this).replaceWith(myDateInput);

  myDateInput.datepicker({
    minDate:1,
    onClose: function () {
      $(this).trigger("change");
    }
  });
  myDateInput.trigger("focus");
});

// Event Listener for due date unclick
$(".list-group").on("change", "input[type='text']", function () {
  // get current date
  var myDate = $(this)
    .val()
    .trim();

  // get the parent's ul's id attribute
  var myStatus = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var myIndex = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localStorage
  tasks[myStatus][myIndex].date = myDate;
  saveTasks();

  // recreate span element with bootstrap classes
  var myTaskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(myDate);

  // replace input with span element
  $(this).replaceWith(myTaskSpan);

  auditTask($(myTaskSpan).closest(".list-group-item"));
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// make dragable
$(".card .list-group").sortable( {
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {

  },
  deactivate: function(event) {

  },
  over: function(event) {

  },
  out: function(event) {

  },
  update: function(event) {
    var aryTemp = [];

    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      
      var date = $(this)
        .find("span")
        .text()
        .trim();

      //add task data to the temp array 
      aryTemp.push( {
        text: text,
        date: date
      });
    });

    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    tasks[arrName] = aryTemp;
    saveTasks();
  }
});

// trash dragable
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {

  },
  out: function(event, ui) {

  }
});

$("#modalDueDate").datepicker({
  minDate: 1
});

var auditTask = function(taskEl) {
  var myDate = $(taskEl).find("span").text().trim();
  var myTime = moment(myDate, "L").set("hour", 17);

  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  if (moment().isAfter(myTime)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(myTime, "days")) < 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// load tasks for the first time
loadTasks();