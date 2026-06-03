let State = {
  Ready: [],
  Running: null,
  Waiting: [],
  Terminated: [],
  Completed: [],
  Map: { id: null, run_time: null, burst_time: null },
  Timer: null,
  Policy: null,
  clickedState: null,
  time_counter: 0,
  id_counter: 1,
  quantum: null,
}

let Button_State = {
  tick: false,
  schedule: false,
  newProcess: true,
  terminate: false,
  undo: false,
  redo: false,
  io: false,
  int: false,
}

const StateAction_log = []
let Redo_log = []

let arrow_used = 0

var quant_counter = 0

class Action {
  constructor(action, state) {
    this.action = action
    this.state = state
  }
}

class Process {
  constructor(arrival_time, burst_time, status) {
    this.arrival_time = arrival_time
    this.burst_time = burst_time
    this.status = status
    this.mapping = { run_time: 0, burst_time: burst_time }
    this.id = State["id_counter"]
    State["id_counter"]++
  }
}
let st = -1
function UpdatePolicy() {
  if (st == -1) {
    const policy = document.getElementById("policy-btn")
    State["Policy"] = policy.value == "None" ? null : policy.value
    if (State["Policy"] != null) {
      assemble_msg(
        "The scheduling policy has been updated to " + policy.value + ".",
        "It's time to create a new process. Click on the '+ New process' button. Make sure to enter the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation. This will execute the creation and addition of a new process to the process queue.",
      )
      if (State["Policy"] == "RR") {
        showQuantumHideOthers()
      } else {
        showProcessHideOthers()
        document.getElementById("quantum-btn").style.display = "none"
      }
      UpdateUI()
    } else if (State["Policy"] == null) {
      assemble_msg(
        "Please select a scheduling policy before starting the experiment.",
        "Click on the 'Scheduling Policy' dropdown and select one of the policies for the simulation.",
      )
      showPolicyHideOthers()
      document.getElementById("quantum-btn").style.display = "none"
    }

    if (policy.value == "RR") {
      var quantumButton = document.getElementById("quantum-btn")

      quantumButton.style.display = "block"
      assemble_msg(
        "The scheduling policy has been updated to " + policy.value + ".",
        "It's time to create a new process. First, click on the 'Quantum' button. Set the time quantum to a value between 1 and 15. Then, click on the '+ New process' button. Make sure to enter the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation. This will execute the creation and addition of a new process to the process queue.",
      )
    }
  } else {
    const policy = document.getElementById("policy-btn")
    policy.value = State["Policy"]
    sendalert(
      //"Scheduling policy cannot be changed mid-simulation, Please reset the simulation to change the scheduling policy"
      "The scheduling policy cannot be changed mid-simulation. Please click on the 'Reset' button to be able to choose another scheduling policy.",
    )
  }
  // console.log(State["Policy"]);
}

function setQuantum() {
  var quantum = document.getElementById("quantum").value
  if (quantum >= 15) {
    sendalert("The time quantum cannot be greater than 15.")
    return
  }
  State["quantum"] = quantum
  assemble_msg(
    "Quantum updated to " + quantum + ".",
    "You have set the time quantum to " +
      quantum +
      ". Now, click on the '+ New process' button. Make sure to enter the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation. This will execute the creation and addition of a new process to the process queue.",
  )

  var quantumButton = document.getElementById("quantum-btn")
  document.getElementById("myDropdown_1").classList.toggle("show")
  quantumButton.style.display = "none"

  var quantumDisplay = document.getElementById("display-div")
  quantumDisplay.innerHTML += "<p>Quantum: " + quantum + "</p>"

  quant_counter = 0
  showProcessHideOthers()
  UpdateUI()
}

function dialog_settings() {
  document.getElementById("d_setting").classList.toggle("s_show")
}

// Close the dropdown if the user clicks outside of it
window.onclick = (event) => {
  if (!event.target.matches(".s_dropbtn")) {
    var dropdowns = document.getElementsByClassName("s_dropdown-content")
    var i
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i]
      if (openDropdown.classList.contains("s_show")) {
        openDropdown.classList.remove("s_show")
      }
    }
  }
}

function show_history() {
  document.getElementById("current_dialog").style.display = "none"
  document.getElementById("dialog").style.display = "block"
}

function hide_history() {
  document.getElementById("dialog").style.display = "none"
  document.getElementById("current_dialog").style.display = "block"
}

function getPreviousFeedback() {
  const dialogTable = document.getElementById("dialog")
  if (dialogTable.rows.length > 0) {
    // Get the content of the second last row
    const previous_dialog = dialogTable.rows[dialogTable.rows.length - 2].innerHTML

    // Create a temporary container to manipulate the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = previous_dialog

    // Extract the feedback content
    const feedback = tempDiv.querySelector(".feedback")
    if (feedback) {
      return feedback.innerHTML
    }
  }
  return null
}

function getPreviousPrompt() {
  const dialogTable = document.getElementById("dialog")
  if (dialogTable.rows.length > 0) {
    // Get the content of the second last row
    const previous_dialog = dialogTable.rows[dialogTable.rows.length - 2].innerHTML

    // Create a temporary container to manipulate the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = previous_dialog

    // Extract the prompt content
    const prompt = tempDiv.querySelector(".prompt")
    if (prompt) {
      return prompt.innerHTML
    }
  }
  return null
}

function assemble_msg(FEEDBACK, PROMPT) {
  var dialogue = document.getElementById("dialog")
  var tb = dialogue.getElementsByTagName("tbody")[0]
  var row = document.createElement("tr")
  var td = document.createElement("td")
  // Assign class to td

  td.className = "msg"

  // var text = "";

  // // var fb_text = document.createElement("span");

  // text +=
  // 	"<p class='feedback'>" +
  // 	FEEDBACK +
  // 	"<hr>" +
  // 	"<p class='prompt'>" +
  // 	PROMPT;

  // if (PROMPT == null) {
  // 	text = "";
  // 	text += "<p class='feedback'>" + FEEDBACK;
  // }

  // td.innerHTML = FEEDBACK + "<hr>" + PROMPT;

  // if (PROMPT == null) {
  // 	td.innerHTML = "";
  // 	td.innerHTML += FEEDBACK;
  // }

  // Initialize text with FEEDBACK
  var text = "<div id='feedback_div'>Feedback</div>"
  text += "<p class ='feedback'>" + FEEDBACK + "</p>"

  // Add PROMPT if it exists
  if (PROMPT) {
    text += "<hr>"
    text += "<div id='prompt_div'>Prompt</div>"
    // Split PROMPT by ". " but keep the periods
    var promptSentences = PROMPT.split(/(?<=\.)\s+/).filter(Boolean)
    promptSentences.forEach((sentence) => {
      text += "<p class='prompt'>" + sentence.trim() + "</p>"
    })
  }

  td.innerHTML = text

  document.getElementById("current_dialog").innerHTML = text

  var msgElements = document.getElementsByClassName("msg")

  if (msgElements.length > 0) {
    var prev_msg = msgElements[msgElements.length - 1]
    prev_msg.style.backgroundColor = " #cbc4c2 "
  }

  row.appendChild(td)
  tb.appendChild(row)
  dialogue.appendChild(tb)

  //document.getElementById("msg-sec").scrollTop =
  //document.getElementById("msg-sec").scrollHeight;
}

function showProcessHideOthers() {
  document.getElementById("guide-tip").style.display = "block"
  document.getElementById("arw").style.display = "block"

  document.getElementById("guide-tip-quantum").style.display = "none"
  document.getElementById("quantum-arw").style.display = "none"

  document.getElementById("guide-tip_1").style.display = "none"
  document.getElementById("arw_1").style.display = "none"

  document.getElementById("newProcess-btn").style.opacity = 0.8
  document.getElementById("newProcess-btn").style.cursor = "pointer"

  document.getElementById("quantum-btn").style.opacity = 0.4
  document.getElementById("quantum-btn").style.cursor = "not-allowed"

  // assemble_msg("Please create a new process to start the experiment.");
}

function showQuantumHideOthers() {
  document.getElementById("guide-tip-quantum").style.display = "block"
  document.getElementById("quantum-arw").style.display = "block"

  document.getElementById("guide-tip_1").style.display = "none"
  document.getElementById("arw_1").style.display = "none"

  document.getElementById("guide-tip").style.display = "none"
  document.getElementById("arw").style.display = "none"

  document.getElementById("quantum-btn").style.opacity = 0.8
  document.getElementById("quantum-btn").style.cursor = "pointer"

  document.getElementById("newProcess-btn").style.opacity = 0.4
  document.getElementById("newProcess-btn").style.cursor = "not-allowed"

  // assemble_msg("Please set a time quantum.");
}

function showPolicyHideOthers() {
  document.getElementById("guide-tip_1").style.display = "block"
  document.getElementById("arw_1").style.display = "block"

  document.getElementById("guide-tip").style.display = "none"
  document.getElementById("arw").style.display = "none"

  document.getElementById("guide-tip-quantum").style.display = "none"
  document.getElementById("quantum-arw").style.display = "none"

  document.getElementById("newProcess-btn").style.opacity = 0.4
  document.getElementById("newProcess-btn").style.cursor = "not-allowed"

  document.getElementById("quantum-btn").style.opacity = 0.4
  document.getElementById("quantum-btn").style.cursor = "not-allowed"

  // assemble_msg("Please create a new process to start the experiment.");
}

function sendalert(message) {
  alertMsg = message

  document.getElementById("alert-msg").innerHTML = alertMsg
  var modal = document.getElementById("myModal")
  modal.style.display = "block"
  var span = document.getElementsByClassName("boot")[0]
  span.onclick = () => {
    modal.style.display = "none"
  }
}

let checkedRow

function _getCheckedRow() {
  var pTable = document.getElementById("processes")
  var tbody = pTable.getElementsByTagName("tbody")[0]
  var rows = tbody.rows
  checkedRow = null

  for (var i = 1; i < rows.length; i++) {
    // Start from index 1 to skip header row
    var checkbox = rows[i].getElementsByTagName("input")[0]

    if (checkbox.checked) {
      checkedRow = []
      for (var j = 1; j < rows[i].cells.length; j++) {
        // Start from index 1 to skip checkbox cell
        checkedRow.push(rows[i].cells[j].innerHTML)
      }
      break // Exit the loop once a checked row is found
    }
  }

  // Output the details of the checked row (for demonstration)
  console.log(checkedRow)
}

function openTheory() {
  if (document.getElementById("toc").style.display == "none") {
    document.getElementById("toc").style.display = "block"
  } else {
    document.getElementById("toc").style.display = "none"
  }
}

function openContent(toc_id) {
  if (document.getElementById(toc_id).style.display == "none") {
    document.getElementById(toc_id).style.display = "block"
  } else {
    document.getElementById(toc_id).style.display = "none"
  }
}

function loadUnloadCommand(cmd) {
  st = 0
  if (State["Policy"] == "RR" && State["quantum"] == null) {
    sendalert("Please set the time quantum for the round-robin scheduling policy.")
    return
  }
  if (cmd == "schedule") {
    if (State["clickedState"] == "schedule") {
      State["clickedState"] = null
      Button_State["tick"] = false
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
      UpdateUI()
      // assemble_msg(
      // 	//"You have chosen a new scheduling policy",
      // 	//"Click on the 'Tick' button to succesfully execute the schedule"
      // );
    } else if (State["clickedState"] == null) {
      if (State["Policy"] == null) {
        assemble_msg(
          //"Error! You haven't selected any scheduling policy",
          //"Please select a scheduling policy first"
          "Error! You haven't selected a scheduling policy for the simulation.",
          "The simulation can only begin once you select a scheduling policy for it. Please click on the 'Scheduling policy' dropdown and select one.",
        )
        sendalert(
          //"Please select a scheduling policy first"
          "Please select a scheduling policy to be able to start the simulation.",
        )
        return
      }
      if (State["Running"] != null) {
        assemble_msg(
          //"Oops! A process is currently running on the CPU.",
          //"Please wait for it to complete or terminate it"
          "Oops! A process that you scheduled to run is currently running on the CPU.",
          "You have many options right now. You can lead the execution of the running process to completion by using the 'Tick' button. Or you could terminate the running process using the 'Terminate' button. You can also interrupt the running process using the 'I/O Interrupt' or 'Interrupt' buttons. In case there is a process in the waiting queue, you can use the 'I/O Complete' button and select that process to bring it to ready state.",
        )
        sendalert(
          "A process is currently running on the CPU. Please take a look at the dialog box to explore your current options.",
        )
        return
      }
      if (State["Ready"].length === 0) {
        assemble_msg(
          //"Error! No ready processes to be run on the CPU.",
          //"Please create a new process."
          "Error! The process queue is empty.",
          "Please create a process first. Click on the '+ New process' button. Make sure to enter the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation. This will execute the creation and addition of a new process to the process queue.",
        )
        sendalert(
          "The process queue is empty, so nothing can be scheduled right now. Please take a look at the prompt for help.",
        )
        return
      }
      assemble_msg(
        "You have chosen the 'Schedule' button.",
        "After clicking on the 'Schedule' button, please select the process that you want to schedule, and then click on the 'Tick' button to bring the process to running state.",
      )
      State["clickedState"] = "schedule"
      Button_State["tick"] = true
      schd_btn = document.getElementById("schd-btn")
      schd_btn.classList.add("btn-loaded")
      UpdateUI()
      _schedule()
      // console.log(schd_btn.classList)
    } else {
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
  if (cmd == "io_cmpl") {
    if (State["clickedState"] == "io_cmpl") {
      State["clickedState"] = null
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
      UpdateUI()
    } else if (State["clickedState"] == null) {
      if (State["Waiting"].length == 0) {
        assemble_msg(
          //"Error! No processes are waiting for I/O.",
          //"Please wait for a process to join the waiting queue."
          "Error! There are no processes waiting for I/O completion.",
          "There is no process in the waiting queue, which means that no process is waiting for the completion of an I/O operation. Take a look at the controls to see which other external events you can generate.",
        )
        sendalert(
          //"No processes waiting for I/O!"
          "There are no processes waiting for I/O completion. Take a look at the dialog box for help.",
        )
        return
      }
      assemble_msg(
        "You have chosen the 'I/O Complete' button.",
        "After clicking on the 'I/O Complete' button, select the process from the waiting queue which is waiting for an I/O operation to complete, and click on the 'Tick' button to move it from the waiting queue to the ready queue.",
      )
      State["clickedState"] = "io_cmpl"
      Button_State["tick"] = true
      io_cmpl_btn = document.getElementById("io-cmpl-btn")
      io_cmpl_btn.classList.add("btn-loaded")
      UpdateUI()
      _schedule()
    } else {
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
  if (cmd == "newProcess") {
    if (arrow_used == 0) {
      document.getElementById("guide-tip").style.display = "none"
      document.getElementById("arw").style.display = "none"
      arrow_used = 1
    }
    if (State["clickedState"] == "newProcess") {
      State["clickedState"] = null
      newProcess_btn = document.getElementById("newProcess-btn")
      newProcess_btn.classList.remove("btn-loaded")
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
    } else if (State["clickedState"] == null) {
      // if (State["Running"] != null) {
      //     assemble_msg("A process is currently running on the CPU.", "Please wait for it to complete or terminate it.");
      //     sendalert("A process is currently running on the CPU. Please wait for it to complete or terminate it.");
      //     return;
      // }
      State["clickedState"] = "newProcess"
      assemble_msg(
        //"You have selected the 'New process' option",
        //"Please click the 'Tick' button to execute the creation of a new process"
        "You chose the '+ New process' button.",
        "Please make sure that you have entered the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation. This will execute the creation and addition of a new process to the process queue.",
      )
      UpdateUI()
      newProcess()
    } else {
      assemble_msg(
        "Oops! You can execute only one operation at a time.",
        "Please complete the previous command first or unselect it to be able to select a different command.",
      )
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
  if (cmd == "terminate") {
    if (State["clickedState"] == "terminate") {
      State["clickedState"] = null
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
      UpdateUI()
    } else if (State["clickedState"] == null) {
      if (State["Running"] == null) {
        assemble_msg(
          // "No process is currently running on the CPU.",
          // "Please schedule a process"
          "Error! No processes are currenlty running on the CPU. There is nothing to terminate.",
          "Please click on the 'Schedule' button, select the process that you want to schedule, and then click on the 'Tick' button to bring the process to running state. Once you have a running process, you can choose to terminate it using the 'Terminate' button.",
        )
        sendalert("No processes are currently running on the CPU. Please take a look at the dialog box for help.")
        return
      }
      assemble_msg(
        "You have chosen the 'Terminate' button.",
        "After clicking the 'Terminate' button, click on the 'Tick' button to terminate the currently running process.",
      )
      State["clickedState"] = "terminate"
      UpdateUI()
    } else {
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
  if (cmd == "io_int") {
    if (State["clickedState"] == "io_int") {
      State["clickedState"] = null
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
      UpdateUI()
    } else if (State["clickedState"] == null) {
      if (State["Running"] == null) {
        assemble_msg(
          "Error! There is no process running on the CPU currently.",
          "To interrupt the execution of a running process, you first need to either schedule an existing process, or create a new process and schedule it to run. To do this please click on the 'Schedule' button, select the process that you want to schedule, and then click on the 'Tick' button to bring the process to running state.",
        )
        sendalert("There is no process running on the CPU currently. Please take a look at the dialog box for help.")
        return
      }
      State["clickedState"] = "io_int"
      assemble_msg(
        "You have chosen the 'I/O Interrupt' button.",
        "After clicking on the 'I/O Interrupt' button, select the process from the running queue which you want to interrupt, and click on the 'Tick' button to move it from the running queue to the waiting queue.",
      )
      UpdateUI()
    } else {
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
  if (cmd == "int") {
    if (State["clickedState"] == "int") {
      State["clickedState"] = null
      if (getPreviousFeedback() != null && getPreviousPrompt() != null) {
        assemble_msg(getPreviousFeedback(), getPreviousPrompt())
      }
      UpdateUI()
    } else if (State["clickedState"] == null) {
      if (State["Running"] == null) {
        assemble_msg(
          "Error! There is no process running on the CPU currently.",
          "To interrupt the execution of a running process, you first need to either schedule an existing process, or create a new process and schedule it to run. To do this please click on the 'Schedule' button, select the process that you want to schedule, and then click on the 'Tick' button to bring the process to running state.",
        )
        sendalert("There is no process running on the CPU currently. Please take a look at the dialog box for help.")
        return
      }
      State["clickedState"] = "int"
      assemble_msg(
        "You have chosen the 'Interrupt' button.",
        "After clicking on the 'Interrupt' button, use the 'Tick' button to move the running process from the running queue to the waiting queue.",
      )
      UpdateUI()
    } else {
      sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
    }
  }
}

function ToggleCreateProcess() {
  if (State["clickedState"] == "newProcess") {
    State["clickedState"] = null
    UpdateState()
    UpdateTable()
  } else if (State["clickedState"] == null) {
    const burst_input = document.getElementById("burstTime")
    document.getElementById("myDropdown").classList.toggle("show")
    burst_input.placeholder = "Enter Burst Time (1-30) to create a process with Pid:" + State["id_counter"]
  } else {
    sendalert("Please complete the previous command first or unselect it to be able to select a different command.")
  }
}

function ToggleQuantum() {
  if (State["Policy"] == "RR") {
    document.getElementById("myDropdown_1").classList.toggle("show")
    const quant_inp = document.getElementById("quantum")
    quant_inp.placeholder =
      "Enter a number between 1 and 15 to set as the time quantum for round-robin scheduling policy."
  } else {
    sendalert("Please select round-robin as the scheduling policy to be able to set the quantum.")
  }
}

function newProcess() {
  document.getElementById("myDropdown").classList.toggle("show")
}

function CreateProcess() {
  const create_process_input = document.getElementById("burstTime").value
  document.getElementById("burstTime").value = ""
  if (create_process_input == "") {
    sendalert("Please enter a burst time for the process between 1 to 30.")
    return
  }
  const create_process_input_int = Number.parseInt(create_process_input)
  if (create_process_input_int < 1) {
    sendalert("Please enter a burst time for the process between 1 to 30.")
    return
  }
  if (create_process_input_int > 30) {
    sendalert("Please enter a burst time for the process between 1 to 30.")
    return
  }
  const process = new Process(State["time_counter"], create_process_input_int, "Ready")
  State["Ready"].push(process)
  UpdateState()
  UpdateTable()
  assemble_msg(
    //"Good! New process created successfully!",
    //"You can either schedule the process(s) or create another new process"
    "A new process has successfully been created and added to the process queue.",
    "Now, you can either schedule any existing process(es) by clicking on the 'Schedule' button, or you can create another process by clicking on the '+ New process' button.",
  )
}

function UpdateTable() {
  const table = document.getElementById("processes")
  table.innerHTML = "<th>Process ID</th><th>Arrival Time</th><th>Burst Time</th><th>Remaining time</th><th>Status</th>"
  // console.log(table);
  if (State["Running"] != null) {
    const row = table.insertRow(-1)
    const cell0 = row.insertCell(0)
    cell0.innerHTML = State["Running"].id
    const cell1 = row.insertCell(1)
    cell1.innerHTML = State["Running"].arrival_time
    const cell2 = row.insertCell(2)
    cell2.innerHTML = State["Running"].mapping["burst_time"]
    const cell3 = row.insertCell(3)
    cell3.innerHTML = State["Running"].mapping["burst_time"] - State["Running"].mapping["run_time"]
    const cell4 = row.insertCell(4)
    cell4.innerHTML = State["Running"].status
    cell4.className = "tag-green"
  }
  State["Ready"].forEach((process) => {
    const row = table.insertRow(-1)
    const cell0 = row.insertCell(0)
    cell0.innerHTML = process.id
    const cell1 = row.insertCell(1)
    cell1.innerHTML = process.arrival_time
    const cell2 = row.insertCell(2)
    cell2.innerHTML = process.burst_time
    const cell3 = row.insertCell(3)
    cell3.innerHTML = process.burst_time - process.mapping["run_time"]
    const cell4 = row.insertCell(4)
    cell4.innerHTML = process.status
    cell4.className = "tag-orange"
  })
  State["Waiting"].forEach((process) => {
    const row = table.insertRow(-1)
    const cell0 = row.insertCell(0)
    cell0.innerHTML = process.id
    const cell1 = row.insertCell(1)
    cell1.innerHTML = process.arrival_time
    const cell2 = row.insertCell(2)
    cell2.innerHTML = process.burst_time
    const cell3 = row.insertCell(3)
    cell3.innerHTML = process.burst_time - process.mapping["run_time"]
    const cell4 = row.insertCell(4)
    cell4.innerHTML = process.status
    cell4.className = "tag-blue"
  })
  State["Completed"].forEach((process) => {
    const row = table.insertRow(-1)
    const cell0 = row.insertCell(0)
    cell0.innerHTML = process.id
    const cell1 = row.insertCell(1)
    cell1.innerHTML = process.arrival_time
    const cell2 = row.insertCell(2)
    cell2.innerHTML = process.burst_time
    const cell3 = row.insertCell(3)
    cell3.innerHTML = 0
    const cell4 = row.insertCell(4)
    cell4.innerHTML = process.status
    cell4.className = "tag-grey"
  })
  State["Terminated"].forEach((process) => {
    const row = table.insertRow(-1)
    const cell0 = row.insertCell(0)
    cell0.innerHTML = process.id
    const cell1 = row.insertCell(1)
    cell1.innerHTML = process.arrival_time
    const cell2 = row.insertCell(2)
    cell2.innerHTML = process.burst_time
    const cell3 = row.insertCell(3)
    cell3.innerHTML = 0
    const cell4 = row.insertCell(4)
    cell4.innerHTML = process.status
    cell4.className = "tag-red"
  })
}

function updateCPU() {
  if (State["Running"] != null) {
    const cpuTable = document.getElementById("CPU")
    // console.log(State["Running"].mapping["run_time"])
    if (State["Running"].mapping["run_time"] == 0) {
      cpuTable.innerHTML = ""
      State["Running"].status = "Ready"
      UpdateTable()
      return
    }
    cpuTable.innerHTML = "<th>Process ID</th><th>Burst Time</th><th>Run Time</th>"
    // Add State["Ready"][0] to cpuTable
    const row = cpuTable.insertRow(-1)
    const cell1 = row.insertCell(0)
    cell1.innerHTML = State["Running"].id

    const cell2 = row.insertCell(1)
    cell2.innerHTML = State["Running"].mapping["burst_time"]
    const cell3 = row.insertCell(2)
    cell3.innerHTML = State["Running"].mapping["run_time"]

    assemble_msg(
      "The process having PID " + State["Running"].id + " is now running on the CPU!",
      "Click on the 'Tick' button to advance the simulation by one clock cycle and continue the execution of the process.",
    )
    UpdateUI()
  } else {
    const cpuTable = document.getElementById("CPU")
    cpuTable.innerHTML = ""
  }
}

function _schedule() {
  var pTable = document.getElementById("processes")
  var tbody = pTable.getElementsByTagName("tbody")[0]
  var rows = tbody.rows
  for (var i = 1; i < rows.length; i++) {
    var checkboxcell = rows[i].insertCell(0)
    var checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.name = "rowCheckbox"
    checkboxcell.appendChild(checkbox)
    // Add event listener to handle single-choice behavior
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        for (var j = 1; j < rows.length; j++) {
          if (rows[j] !== this.parentNode.parentNode) {
            rows[j].getElementsByTagName("input")[0].checked = false
          }
        }
      }
    })
  }
  var headerRow = pTable.rows[0].insertCell(0)
  headerRow.innerHTML = "<b>Select</b>"
}

function scheduleFCFS() {
  if (State["Running"] == null) {
    _getCheckedRow()
    if (checkedRow == null) {
      assemble_msg(
        "Error! You haven't selected any process to schedule.",
        "Please click on the 'Schedule' button. Then select the process from the process queue that should be scheduled according to FCFS scheduling policy.",
      )
      sendalert(
        "You forgot to choose which process you want to schedule. Please take a look at the dialog box for help.",
      )
      return
    }
    const cpuTable = document.getElementById("CPU")
    const readyTable = document.getElementById("processes")
    if (State["Ready"].length != 0) {
      if (checkedRow[0] != State["Ready"][0].id) {
        assemble_msg(
          "Error! You have chosen the wrong process according to FCFS.",
          "Please click on the 'Schedule' button. Then select the process from the process queue that should be scheduled according to FCFS scheduling policy.",
        )
        sendalert(
          "The process you chose isn't right according to FCFS scheduling. Please take a look at the dialog box for help.",
        )
        return
      }
      cpuTable.innerHTML = "<th>Process ID</th><th>Burst Time</th><th>Run Time</th>"
      // Add State["Ready"][0] to cpuTable
      const row = cpuTable.insertRow(-1)
      const cell1 = row.insertCell(0)
      cell1.innerHTML = State["Ready"][0].id

      const cell2 = row.insertCell(1)
      cell2.innerHTML = State["Ready"][0].mapping["burst_time"]
      const cell3 = row.insertCell(2)
      cell3.innerHTML = State["Ready"][0].mapping["run_time"]

      // Remove State["Ready"][0] from State["Ready"] and add to State["Running"]
      assemble_msg(
        "The process having PID " + State["Ready"][0].id + " is now running on the CPU!",
        "Use the 'Tick' button to advance the simulation by a clock cycle and continue the execution of this process.",
      )
      tmp = State["Ready"][0]
      State["Running"] = tmp

      State["Ready"].shift()
      State["Running"].status = "Running"
      UpdateUI()
    } else {
      // assemble_msg("No ready processes to be run on the CPU. Please create a new process.", "red");
      sendalert("No process is ready to be run on the CPU. Please create a new process and schedule it to run.")
      return null
    }
    UpdateUI()
  } else {
    // assemble_msg("A process is currently running on the CPU. Either wait for it to complete or terminate that process.", "red");
    sendalert(
      "A process is already running on the CPU. Either wait for it to fully execute, or terminate that process to be able to schedule another one.",
    )
    return null
  }
}

function getShortestJob() {
  let minIndex = 0
  let minBurstTime = State["Ready"][0].mapping["burst_time"] - State["Ready"][0].mapping["run_time"]
  for (let i = 1; i < State["Ready"].length; i++) {
    if (State["Ready"][i].mapping["burst_time"] - State["Ready"][i].mapping["run_time"] < minBurstTime) {
      minBurstTime = State["Ready"][i].mapping["burst_time"] - State["Ready"][i].mapping["run_time"]
      minIndex = i
    }
  }
  return minIndex
}
function scheduleSJF() {
  if (State["Running"] == null) {
    _getCheckedRow()
    if (checkedRow == null) {
      assemble_msg(
        "Error! You haven't selected any process to schedule.",
        "Please click on the 'Schedule' button. Then select the process from the process queue that should be scheduled according to SJF scheduling policy.",
      )
      sendalert(
        "You forgot to choose which process you want to schedule. Please take a look at the dialog box for help.",
      )
      return
    }
    const cpuTable = document.getElementById("CPU")
    if (State["Ready"].length != 0) {
      idx = getShortestJob()
      if (checkedRow[0] != State["Ready"][idx].id) {
        assemble_msg(
          "Error! You have chosen the wrong process according to SJF.",
          "Please click on the 'Schedule' button. Then select the process from the process queue that should be scheduled according to SJF scheduling policy.",
        )
        return
      }
      console.log(State["Ready"][idx])
      tmp = State["Ready"][idx]
      State["Ready"].splice(idx, 1)
      console.log(tmp)
      cpuTable.innerHTML = "<th>Process ID</th><th>Burst Time</th><th>Run Time</th>"
      // Add State["Ready"][0] to cpuTable
      const row = cpuTable.insertRow(-1)
      const cell1 = row.insertCell(0)
      cell1.innerHTML = tmp.id

      const cell2 = row.insertCell(1)
      cell2.innerHTML = tmp.mapping["burst_time"]
      const cell3 = row.insertCell(2)
      cell3.innerHTML = tmp.mapping["run_time"]

      // Remove tmp from State["Ready"] and add to State["Running"]
      assemble_msg("Process with pid " + tmp.id + " now running on the CPU!")

      State["Running"] = tmp
      // Remove State["Ready"][idx]

      State["Running"].status = "Running"
      UpdateUI()
    } else {
      // assemble_msg("No ready processes to be run on the CPU. Please create a new process.", "red");
      sendalert("No ready processes to be run on the CPU. Please create a new process.")
      return null
    }
    UpdateUI()
  } else {
    // assemble_msg("A process is currently running on the CPU. Either wait for it to complete or terminate that process.", "red");
    sendalert(
      "A process is already running on the CPU. Either wait for it to fully execute, or terminate that process to be able to schedule another one.",
    )
    return null
  }
}

function UpdateState() {
  const readyQueue = document.getElementById("rQ")
  const waitingQueue = document.getElementById("wQ")
  const TerminatedQueue = document.getElementById("tQ")
  const completedQueue = document.getElementById("cQ")
  const running = document.getElementById("cpu_p")
  const policy = document.getElementById("schd_p")
  const map = document.getElementById("map")
  const timer = document.getElementById("timer")
  const ticker = document.getElementById("ticker")
  const schd_btn = document.getElementById("schd-btn")
  const newProcess_btn = document.getElementById("newProcess-btn")
  const end_btn = document.getElementById("end-btn")
  const io_btn = document.getElementById("io-btn")
  const io_cmpl_btn = document.getElementById("io-cmpl-btn")
  const int_btn = document.getElementById("int-btn")
  readyQueue.innerHTML = ""
  temp = []
  State["Ready"].forEach((process) => {
    temp.push(process.id)
  })
  readyQueue.innerHTML = "[ " + temp.join(",") + " ]"
  waitingQueue.innerHTML = ""
  temp = []
  State["Waiting"].forEach((process) => {
    temp.push(process.id)
  })
  waitingQueue.innerHTML = "[ " + temp.join(",") + " ]"
  TerminatedQueue.innerHTML = ""
  temp = []
  State["Terminated"].forEach((process) => {
    temp.push(process.id)
  })
  TerminatedQueue.innerHTML = "[ " + temp.join(",") + " ]"
  running.innerHTML = ""
  completedQueue.innerHTML = ""
  temp = []
  State["Completed"].forEach((process) => {
    temp.push(process.id)
  })
  completedQueue.innerHTML = "[ " + temp.join(",") + " ]"
  if (State["Running"] == null) {
    running.innerHTML = "None"
    map.innerHTML = "-"
  } else {
    running.innerHTML = State["Running"].id
    map.innerHTML =
      State["Running"].id + "->" + State["Running"].mapping["run_time"] + ":" + State["Running"].mapping["burst_time"]
    State["Map"] = {
      id: State["Running"].id,
      run_time: State["Running"].mapping["run_time"],
      burst_time: State["Running"].mapping["burst_time"],
    }
  }
  timer.innerHTML = State["Timer"] != null ? State["Timer"] : "-"
  policy.innerHTML = State["Policy"] ? State["Policy"] : "None"
  ticker.innerHTML = State["time_counter"]
  if (State["clickedState"] == "schedule") {
    schd_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == "newProcess") {
    newProcess_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == "terminate") {
    end_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == "io_int") {
    io_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == "io_cmpl") {
    io_cmpl_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == "int") {
    int_btn.classList.add("btn-loaded")
  } else if (State["clickedState"] == null) {
    schd_btn.classList.remove("btn-loaded")
    newProcess_btn.classList.remove("btn-loaded")
    end_btn.classList.remove("btn-loaded")
    io_btn.classList.remove("btn-loaded")
    io_cmpl_btn.classList.remove("btn-loaded")
    int_btn.classList.remove("btn-loaded")
  }
}

function Schedule() {
  if (State["Policy"] == "FCFS") {
    FCFS()
    document.getElementById("sch_algo").innerHTML = "FCFS"
  } else {
    State["Running"].mapping["run_time"]++
    State["Timer"]--
    UpdateState()
    UpdateTable()
    if (State["Running"].mapping["burst_time"] == State["Running"].mapping["run_time"]) {
      State["Completed"].push(State["Running"])
      alert("Process " + State["Running"].id + " Completed")
      State["Running"] = null
      State["Timer"] = null
      UpdateState()
      UpdateTable()
      SchedulePolicy()
    } else if (State["Timer"] == 0) {
      State["Ready"].push(State["Running"])
      State["Running"] = null
      State["Timer"] = null
      alert("Timer Interrupt Occured")
      SchedulePolicy()
    }
  }
}

function SchedulePolicy() {
  if (State["Policy"] == "FCFS") {
    FCFS()
    document.getElementById("schd_p").innerHTML = "FCFS"
  } else if (State["Policy"] == "SJF") {
    SJF()
    document.getElementById("schd_p").innerHTML = "SJF"
  } else if (State["Policy"] == "SRTF") {
    SRTF()
    document.getElementById("schd_p").innerHTML = "SRTF"
  } else if (State["Policy"] == "Priority") {
    Priority()
    document.getElementById("schd_p").innerHTML = "Priority scheduling"
  } else if (State["Policy"] == "RR") {
    RoundRobin()
    document.getElementById("schd_p").innerHTML = "Round Robin"
  }
}

function FCFS() {
  if (State["Running"] == null) {
    if (State["Ready"].length == 0) {
      return
    }
    scheduleFCFS()
    UpdateState()
  }
}

function SJF() {
  if (State["Running"] == null) {
    if (State["Ready"].length == 0) {
      return
    }
    scheduleSJF()
    UpdateState()
  }
}

function SRTF() {
  if (State["Running"] == null) {
    if (State["Ready"].length == 0) {
      return
    }
    scheduleSJF()
    UpdateState()
  }
}

function RoundRobin() {
  if (State["Running"] == null) {
    if (State["Ready"].length == 0) {
      console.log("hi")
      return
    }
    quant_counter = 0
    console.log("hi")
    scheduleFCFS()
    UpdateState()
  }
}

function ContextSwitch(n = 0) {
  if (n == 1) {
    if (State["Running"] != null) {
      State["Running"].status = "Ready"
      State["Running"].arrival_time = State["time_counter"] + 1
      State["Ready"].push(State["Running"])
      State["Running"] = null
      UpdateState()
      UpdateTable()
      updateCPU()
    }
  } else {
    if (State["Running"] != null) {
      State["Running"].status = "Waiting"
      State["Waiting"].push(State["Running"])
      State["Running"] = null
      UpdateState()
      UpdateTable()
      updateCPU()
    }
  }
}

function Terminate(n = 1) {
  if (State["Running"] != null) {
    const cpuTable = document.getElementById("CPU")
    tmp = State["Running"]
    if (n == 1) {
      tmp.status = "Terminated"
      State["Terminated"].push(tmp)
    } else {
      tmp.status = "Completed"
      State["Completed"].push(tmp)
    }
    assemble_msg(
      "The process that was running has successfully been completed or terminated.",
      "Now, you can either schedule any existing process(es) by clicking on the 'Schedule' button, or you can create another process by clicking on the '+ New process' button.",
    )
    State["Running"] = null
    cpuTable.deleteRow(0)
    cpuTable.deleteRow(0)
  } else {
    assemble_msg(
      "Error! No processes are currenlty running on the CPU. There is nothing to terminate.",
      "Please click on the 'Schedule' button, select the process that you want to schedule, and then click on the 'Tick' button to bring the process to running state. Once you have a running process, you can choose to terminate it using the 'Terminate' button.",
    )
    sendalert("No processes are currently running on the CPU. Please take a look at the dialog box for help.")
    // return null;
  }
  UpdateTable()
}

function SelectIO() {
  if (State["Waiting"].length > 0) {
    _getCheckedRow()
    if (checkedRow == null) {
      assemble_msg(
        "Error! You haven't selected which process you want to move from the waiting queue to the ready queue.",
        "After clicking on the 'I/O Complete' button, select the process from the waiting queue which is waiting for an I/O operation to complete, and click on the 'Tick' button to move it from the waiting queue to the ready queue.",
      )
      sendalert("Please select which process you want to move from the waiting queue to the ready queue.")
      return
    }
    if (checkedRow[4] != "Waiting") {
      assemble_msg(
        "Error! You have choosen the wrong process for this action.",
        "After clicking on the 'I/O Complete' button, select the process from the waiting queue which is waiting for an I/O operation to complete, and click on the 'Tick' button to move it from the waiting queue to the ready queue.",
      )
      return
    }
    for (var i = 0; i < State["Waiting"].length; i++) {
      if (checkedRow[0] == State["Waiting"][i].id) {
        State["Waiting"][i].status = "Ready"
        State["Ready"].push(State["Waiting"][i])
        // Remove State["Waiting"][i]
        State["Waiting"].pop(i)
        UpdateUI()
        return
      }
    }
    if (State["Waiting"].length == 0) {
      Button_State["io_cmpl"] = false
    }
  } else {
    Button_State["io_cmpl"] = false
    sendalert("There are no processes waiting for I/O completion.")
  }
}

function Tick() {
  if (State["Ready"].length > 0 && State["Running"] != null && State["Policy"] == "SRTF") {
    idx = getShortestJob()
    if (
      State["Ready"][idx].mapping["burst_time"] - State["Ready"][idx].mapping["run_time"] <
      State["Running"].mapping["burst_time"] - State["Running"].mapping["run_time"]
    ) {
      if (State["clickedState"] != "int") {
        sendalert("Schedule the job with shortest remaining time!")
        return
      }
    }
  }
  if (State["Running"] != null && State["Policy"] == "RR") {
    if (quant_counter >= State["quantum"] && State["clickedState"] != "int") {
      assemble_msg(
        "The quantum has expired.",
        "Interrupt the current process using the 'Interrupt' button, then schedule the next one.",
      )
      sendalert("The quantum has expired. Interrupt this process and schedule the next process.")
      return
    } else {
      assemble_msg(
        "The process having PID " + State["Running"].id + " is now running on the CPU!",
        "You can click on 'Tick' and continue executing this process until the quantum expries. You also have the option of using the 'I/O interrupt' or 'Interrupt' buttons on this process. In case the process is in the waiting queue, you can use the 'I/O Complete' button and select that process to bring it to ready state.",
      )
    }
    quant_counter++
  }
  if (State["clickedState"] == null) {
    if (State["Running"] != null) {
      Redo_log = []
      State["time_counter"]++
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      State["Running"].mapping["run_time"]++
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    } else {
      sendalert(
        "No process is running on the CPU, so nothing can be ticked. Create and/or schedule a process to tick (or execute) it. ",
        "red",
      )
      // return null;
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    UpdateUI()
    // UpdatePreviousState();
  } else if (State["clickedState"] == "newProcess") {
    Redo_log = []
    CreateProcess()
    State["time_counter"]++
    State["clickedState"] = null
    StateAction_log.push(new Action("newProcess", JSON.parse(JSON.stringify(State))))
    // Previous_States.push(JSON.parse(JSON.stringify(State)));
    // Action_log.push(new Action("newProcess",State));
    if (State["Running"] != null) {
      Redo_log = []
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      State["Running"].mapping["run_time"]++
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    UpdateUI()
    // UpdatePreviousState();
  } else if (State["clickedState"] == "schedule") {
    Redo_log = []

    SchedulePolicy()

    State["time_counter"]++
    State["clickedState"] = null
    StateAction_log.push(new Action("schedule", JSON.parse(JSON.stringify(State))))

    State["clickedState"] = null
    Button_State["schedule"] = false
    UpdateUI()
  } else if (State["clickedState"] == "io_cmpl") {
    Redo_log = []

    SelectIO()

    State["time_counter"]++
    State["clickedState"] = null
    StateAction_log.push(new Action("io_cmpl", JSON.parse(JSON.stringify(State))))
    Button_State["io_cmpl"] = false
    assemble_msg(
      "I/O Complete signal has been sent.",
      "The I/O operation has been completed and the process is now moved to the ready queue. Take a look at the available controls to see what you can do next.",
    )
    if (State["Running"] != null) {
      Redo_log = []
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      State["Running"].mapping["run_time"]++
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    UpdateUI()
  } else if (State["clickedState"] == "terminate") {
    if (Terminate() !== null) {
      Redo_log = []
      State["time_counter"]++
      StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
      // Previous_States.push(JSON.parse(JSON.stringify(State)));
      // Action_log.push(new Action("terminate",JSON.parse(JSON.stringify(State))));
    }
    State["clickedState"] = null
    assemble_msg(
      "You chose to terminate the process.",
      "The process has been terminated and removed from the CPU. Take a look at the available controls to see what you can do next.",
    )
    if (State["Running"] != null) {
      Redo_log = []
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      State["Running"].mapping["run_time"]++
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    UpdateUI()
  } else if (State["clickedState"] == "io_int") {
    Redo_log = []
    ContextSwitch()
    State["time_counter"]++
    StateAction_log.push(new Action("io_int", JSON.parse(JSON.stringify(State))))
    // Previous_States.push(JSON.parse(JSON.stringify(State)));
    // Action_log.push(new Action("io_int",JSON.parse(JSON.stringify(State))));
    State["clickedState"] = null
    assemble_msg(
      "I/O Interrupt signal has been sent.",
      "The process has been interrupted for an I/O operation and moved to the waiting queue. Take a look at the available controls to see what you can do next.",
    )
    updateCPU()
    if (State["Running"] != null) {
      Redo_log = []
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      State["Running"].mapping["run_time"]++
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    UpdateUI()
  } else if (State["clickedState"] == "int") {
    Redo_log = []
    if (State["Running"] != null) {
      Redo_log = []
      const ticker = document.getElementById("ticker")
      ticker.innerHTML = State["time_counter"]
      // State["Running"].mapping["run_time"]++;
      const cpuTable = document.getElementById("CPU")
      cpuTable.rows[1].cells[1].innerHTML = State["Running"].mapping["burst_time"]
      cpuTable.rows[1].cells[2].innerHTML = State["Running"].mapping["run_time"]

      if (State["Running"].mapping["burst_time"] <= State["Running"].mapping["run_time"]) {
        Terminate(0)
        StateAction_log.push(new Action("terminate", JSON.parse(JSON.stringify(State))))
        assemble_msg(
          "The process has completed.",
          "The process has completed its execution and has been terminated. It has been removed from the CPU. Take a look at the available controls to see what you can do next.",
        )
      }
    }
    if (State["Running"] != null) {
      StateAction_log.push(new Action("tick", JSON.parse(JSON.stringify(State))))
    }
    ContextSwitch(1)
    quant_counter = 0
    State["time_counter"]++
    StateAction_log.push(new Action("int", JSON.parse(JSON.stringify(State))))
    State["clickedState"] = null
    updateCPU()
    assemble_msg(
      "Interrupt signal has been sent.",
      "The process has been interrupted and is now moved to the ready queue. Take a look at the available controls to see what you can do next.",
    )
    UpdateUI()
  }
}

function UpdatePreviousState() {
  const container = document.getElementById("prev_state")
  container.innerHTML = ""
  // console.clear();
  for (let i = StateAction_log.length - 1; i >= 0; i--) {
    const state = JSON.parse(JSON.stringify(StateAction_log[i].state))
    const policy = state["Policy"] == null ? "None" : state["Policy"]
    // console.log(state)
    let temp = []
    state["Ready"].forEach((process) => {
      temp.push(process.id)
    })
    ready = "[ " + temp.join(",") + " ]"
    const running = state["Running"] == null ? "None" : state["Running"].id
    temp = []
    state["Waiting"].forEach((process) => {
      temp.push(process.id)
    })
    const waiting = "[ " + temp.join(",") + " ]"
    temp = []
    state["Terminated"].forEach((process) => {
      temp.push(process.id)
    })
    terminated = "[ " + temp.join(",") + " ]"
    temp = []
    state["Completed"].forEach((process) => {
      temp.push(process.id)
    })
    completed = "[ " + temp.join(",") + " ]"
    map =
      state["Running"] != null
        ? state["Map"]["id"] + "->" + state["Map"]["run_time"] + ":" + state["Map"]["burst_time"]
        : ""
    timer = state["Timer"] != null ? state["Timer"] : "None"
    const button = document.createElement("button")
    button.className = "collapsible"
    button.innerHTML = "Tick " + (i + 1) + " State"
    button.onclick = createToggleFunction(i)
    container.appendChild(button)
    const table = document.createElement("table")
    table.className = "content"
    table.id = "state" + (i + 1)
    table.innerHTML =
      '<tr>    <td class="ts_cell">Ready:</td>    <td class="ts_cell">' +
      ready +
      '</td></tr><tr>    <td class="ts_cell">Waiting for I/O:</td>    <td class="ts_cell">' +
      waiting +
      '</td></tr><tr>    <td class="ts_cell">Terminated:</td>    <td class="ts_cell">' +
      terminated +
      '</td></tr><tr>    <td class="ts_cell">Completed:</td>    <td class="ts_cell">' +
      completed +
      '</td></tr><tr><tr>    <td class="ts_cell">cpu:</td>    <td class="ts_cell">' +
      running +
      '</td></tr><tr>    <td class="ts_cell">Map:</td>    <td class="ts_cell">' +
      map +
      '</td></tr><tr>    <td class="ts_cell">Timer:</td>    <td class="ts_cell">' +
      timer +
      '</td></tr><tr>    <td class="ts_cell">Scheduling policy:</td>    <td class="ts_cell">' +
      policy +
      "</td></tr>"
    container.appendChild(table)
  }
}

function createToggleFunction(i) {
  return () => {
    const content = document.getElementById("state" + (i + 1))
    content.classList.toggle("content")
  }
}

function UpdateBtnState() {
  if (State["Running"] != null) {
    Button_State = {
      tick: true,
      schedule: false,
      newProcess: true,
      terminate: true,
      undo: false,
      redo: false,
      io: true,
      int: true,
    }
  } else if (State["Running"] == null && State["clickedState"] == null && State["Ready"].length != 0) {
    Button_State = {
      tick: false,
      schedule: true,
      newProcess: true,
      terminate: false,
      undo: false,
      redo: false,
      io: false,
      int: false,
    }
  } else {
    if (State["clickedState"] == "schedule") {
      Button_State = {
        tick: true,
        schedule: true,
        newProcess: true,
        terminate: false,
        undo: false,
        redo: false,
        io: false,
        int: false,
      }
    } else if (State["clickedState"] == "newProcess") {
      Button_State = {
        tick: true,
        schedule: false,
        newProcess: true,
        terminate: false,
        undo: false,
        redo: false,
        io: false,
        int: false,
      }
    } else if (State["clickedState"] == "terminate") {
      Button_State = {
        tick: true,
        schedule: false,
        newProcess: false,
        terminate: true,
        undo: false,
        redo: false,
        io: false,
        int: false,
      }
    } else if (State["clickedState"] == "io_cmpl") {
      Button_State = {
        tick: true,
        schedule: false,
        newProcess: false,
        terminate: false,
        undo: false,
        redo: false,
        io: false,
        int: false,
      }
    } else {
      Button_State = {
        tick: false,
        schedule: false,
        newProcess: true,
        terminate: false,
        undo: false,
        redo: false,
        io: false,
        int: false,
      }
    }
  }
  if (StateAction_log.length > 0) {
    Button_State["undo"] = true
  } else {
    Button_State["undo"] = false
  }
  if (Redo_log.length > 0) {
    Button_State["redo"] = true
  } else {
    Button_State["redo"] = false
  }
}

function UpdateBtnUI() {
  const tick = document.getElementById("tick-btn")
  const schedule = document.getElementById("schd-btn")
  const newProcess = document.getElementById("newProcess-btn")
  const terminate = document.getElementById("end-btn")
  const undo = document.getElementById("undo-btn")
  const redo = document.getElementById("redo-btn")
  const io = document.getElementById("io-btn")
  const io_cmpl = document.getElementById("io-cmpl-btn")
  const int = document.getElementById("int-btn")
  if (Button_State["tick"] == false) {
    tick.classList.add("disabled")
  } else {
    tick.classList.remove("disabled")
  }
  if (Button_State["io"] == false) {
    io.classList.add("disabled")
  } else {
    io.classList.remove("disabled")
  }
  if (Button_State["int"] == false) {
    int.classList.add("disabled")
  } else {
    int.classList.remove("disabled")
  }
  if (State["Waiting"].length == 0 || Button_State["io_cmpl"] == false) {
    io_cmpl.classList.add("disabled")
  } else {
    io_cmpl.classList.remove("disabled")
  }
  if (State["clickedState"] != "schedule") {
    if (Button_State["schedule"] == false) {
      schedule.classList.add("disabled")
    } else {
      schedule.classList.remove("disabled")
    }
  }
  if (State["clickedState"] != "newProcess") {
    if (Button_State["newProcess"] == false) {
      newProcess.classList.add("disabled")
    } else {
      newProcess.classList.remove("disabled")
    }
  }
  if (State["clickedState"] != "terminate") {
    if (Button_State["terminate"] == false) {
      terminate.classList.add("disabled")
    } else {
      terminate.classList.remove("disabled")
    }
  }

  if (Button_State["undo"] == false) {
    undo.classList.add("disabled")
  } else {
    undo.classList.remove("disabled")
  }
  if (Button_State["redo"] == false) {
    redo.classList.add("disabled")
  } else {
    redo.classList.remove("disabled")
  }
}

function UpdateUI() {
  UpdateState()
  UpdateTable()
  // UpdateCPU();
  UpdateBtnState()
  UpdateBtnUI()
  UpdatePreviousState()
}

function Undo() {
  if (StateAction_log.length < 1) {
    Button_State["undo"] = false
    assemble_msg(
      "'Undo' failed! You are already at the initial state of the system.",
      "You can either the 'Redo' the changes, or proceed from the current state.",
    )
    updateCPU()
    UpdateUI()
    return
  }
  Button_State["redo"] = true
  // console.log(Button_State)

  Redo_log.push(JSON.parse(JSON.stringify(StateAction_log.pop())))
  State = JSON.parse(JSON.stringify(StateAction_log[StateAction_log.length - 1].state))
  // console.log(StateAction_log.length);
  assemble_msg(
    "The 'Undo' operation was successfully completed.",
    "You can either the 'Redo' the changes, or proceed from the current state.",
  )
  // Action_log.push(new Action("Undo",State));
  UpdateUI()
  updateCPU()
}

function Redo() {
  if (Redo_log.length < 1) {
    assemble_msg(
      "'Redo' failed! You are already at the latest state of the system.",
      "You can either the 'Undo' the changes, or proceed from the current state.",
    )
    return
  }
  State = JSON.parse(JSON.stringify(Redo_log.pop().state))
  StateAction_log.push(new Action("Redo", State))
  assemble_msg(
    "The 'Redo' operation was successfully completed.",
    "You can either the 'Undo' the changes, or proceed from the current state.",
  )
  UpdateUI()
  updateCPU()
}
