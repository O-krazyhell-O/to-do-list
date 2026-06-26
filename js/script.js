let tasks = []

const addButtonElement = document.querySelector('[data-add-button]')
const inputElement = document.querySelector('[data-input]')
const tasksElement = document.querySelector('[data-tasks]')
const placeholderElement = document.querySelector('[data-placeholder]')
const tasksTopElement = document.querySelector('[data-top]')
const tasksCountElement = document.querySelector('[data-tasks-count]')

const TASKS_KEY = 'tasks'
const LAST_ID_KEY = 'last-id'
let lastId = 0
let lastLabelEdited = null

let currentFilter = 'all'

function save() {
    try {
        const tasksJson = JSON.stringify(tasks)
        localStorage.setItem(TASKS_KEY, tasksJson)
        localStorage.setItem(LAST_ID_KEY, lastId)
    } catch {
        console.error('Не удалось сохранить задачи')
    }
}

function load() {
    const tasksJson = localStorage.getItem(TASKS_KEY)
    const lastIdJson = localStorage.getItem(LAST_ID_KEY)
    tasks = JSON.parse(tasksJson)
    lastId = JSON.parse(lastIdJson)
    if (!tasks) {
        tasks = []
    }
}

function onCheckBoxClick(event) {
    const checkboxEmulatorElement = event.target.closest('[data-checkbox-emulator]')
    if (!checkboxEmulatorElement) {
        return
    }
    const taskElement = checkboxEmulatorElement.parentElement
    const inputElement = taskElement.querySelector('[data-task-input]')
    const taskId = Number(inputElement.getAttribute('id'))
    tasks.forEach(task => {
        if (task.id === taskId) {
            task.ready = !task.ready
        }
    })
    render()
    save()
}

function onRemoveButtonClick(event) {
    const removeButtonElement = event.target.closest('[data-button-remove]')
    if (!removeButtonElement) {
        return
    }
    tasks = tasks.filter(task => task.id !== Number(removeButtonElement.dataset.buttonRemove))
    save()
    render()
}

function onEditButtonClick(event) {
    const editButtonElement = event.target.closest('[data-button-edit]')
    if (!editButtonElement) {
        return
    }
    const taskElement = editButtonElement.parentElement.parentElement
    const labelElement = taskElement.querySelector('[data-label]')
    if (labelElement.textContent === '-') {
        labelElement.textContent = ''
    }
    labelElement.setAttribute('contenteditable', 'true')
    moveCursorToEnd(labelElement)
    labelElement.focus()
}

function moveCursorToEnd(element) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function onLabelFocusOut(event) {
    const labelElement = event.target.closest('[data-label]')
    if (!labelElement) {
        return
    }
    labelElement.setAttribute('contenteditable', 'false')
    if (labelElement.textContent === '') {
        labelElement.textContent = '-'
    }
    tasks.forEach(task => {
        if (task.id === Number(labelElement.dataset.label)) {
            task.text = labelElement.textContent
        }
    })
    save()
}

function onLabelKeyDown(event) {
    const labelElement = event.target.closest('[data-label]')
    if (!labelElement || labelElement.getAttribute('contenteditable') === 'false'
    ) {
        return
    }
    if (event.code !== 'Enter' && event.code !== 'Escape') {
        return
    }
    console.log('жопа')
    labelElement.setAttribute('contenteditable', 'false')
    save()
}

function onLabelDoubleClick(event) {
    const labelElement = event.target.closest('[data-label]')
    if (!labelElement) {
        return
    }
    if (labelElement.textContent === '-') {
        labelElement.textContent = ''
    }
    labelElement.setAttribute('contenteditable', 'true')
    moveCursorToEnd(labelElement)
    labelElement.focus()
}

function updateTaskText(task, text) {
    task.text = text
}

function onFilterClick(event) {
    const filterElement = event.target.closest('[data-filter]')
    if (!filterElement) {
        return
    }
    const clickedFilterButton = event.target.closest('[data-filter-button]')
    if (!clickedFilterButton) {
        return
    }
    const filterButtonElements = filterElement.querySelectorAll('[data-filter-button]')
    Array.from(filterButtonElements).forEach(buttonElement => {
        buttonElement.classList.remove('is-active')
    })
    clickedFilterButton.classList.add('is-active')
    currentFilter = clickedFilterButton.textContent.toLowerCase()
    render()
    save()
}

function render() {
    if (tasks.length) {
        placeholderElement.classList.remove('is-active')
        tasksTopElement.classList.add('is-active')
    } else {
        placeholderElement.classList.add('is-active')
        tasksTopElement.classList.remove('is-active')
    }
    tasksElement.innerHTML = ""
    tasks.filter((task) => {
        if (currentFilter === 'active') {
            return !task.ready
        } else if (currentFilter === 'completed') {
            return task.ready
        } else {
            return true
        }
    }).forEach(task => {
        tasksElement.insertAdjacentHTML('beforeend', `
            <div class="todo-list__task">
                <input class="todo-list__task-checkbox" ${task.ready ? "checked" : ""} type="checkbox" id="${task.id}" data-task-input>
                <span class="todo-list__task-checkbox-emulator" data-checkbox-emulator>
                    <img class="todo-list__task-checkbox-img" src="images/arrow.svg" alt="">
                </span>
                <p class="todo-list__task-label" data-label=${task.id}>${task.text}</p>
                <div class="todo-list__task-buttons">
                    <button class="todo-list__task-button" data-button-edit="${task.id}">
                        <img src="images/pencil.svg" alt="" width="24" height="24">
                    </button>
                    <button class="todo-list__task-button" data-button-remove="${task.id}">
                        <img src="images/trash.svg" alt="" width="24" height="24">
                    </button>
                </div>
            </div>
        `)
    })
    let completedTasksCount = 0
    tasks.forEach(task => {
        if (!task.ready) {
            completedTasksCount++
        }
    })
    tasksCountElement.textContent = `${completedTasksCount} tasks left`
}

function addTask() {
    if (inputElement.value === "") {
        return
    }
    tasks.unshift({
        id: lastId++,
        text: inputElement.value,
        ready: false
    })
    inputElement.value = ""
    inputElement.focus()
    save()
    render()
}

addButtonElement.addEventListener('click', () =>  {
    addTask()
})

inputElement.addEventListener('keydown', (event) => {
    if (event.code !== 'Enter') {
        return
    }
    addTask()
})

tasksElement.addEventListener('click', (event) => {
    onCheckBoxClick(event)
    onRemoveButtonClick(event)
    onEditButtonClick(event)
})

tasksElement.addEventListener('dblclick', (event) => {
    onLabelDoubleClick(event)
})

tasksElement.addEventListener('keydown', (event) => {
    onLabelKeyDown(event)
})

document.addEventListener('click', (event) => {
    onFilterClick(event)
})
document.addEventListener('focusout', (event) => {
    onLabelFocusOut(event)
})

load()
render()