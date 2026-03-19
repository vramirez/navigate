# CLAUDE.md

This repository is for an app called NaviGate. The idea is to help small businesses by generating alerts based on events posted in news articles and social media events, 
after extracting and successfully identifying an event it will be compared against all businesses type and matched according to the business features like type and location


## Tasks management

Use the `backlog` CLI (available system-wide) to manage tasks.

```bash
# List all tasks
backlog task list --plain

# List only pending/in-progress tasks
backlog task list -s "in progress" --plain

# Create a new task
backlog task create "Task title" -d "Description" --priority high

# View a task
backlog task view 12

# Edit task status
backlog task edit 12 -s "in progress"

# View the Kanban board
backlog board
```

Tasks are stored as markdown files under `backlog/tasks/`. Completed tasks live in `backlog/completed/`.
