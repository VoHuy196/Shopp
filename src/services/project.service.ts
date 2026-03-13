import type { Project, ProjectStatus, ProjectTask, TaskStatus, Member, TaskAssignment, WorkEntry } from "../types/project";

const STORAGE_KEY_PROJECTS = "wms_projects";
const STORAGE_KEY_MEMBERS = "wms_members";
const STORAGE_KEY_ASSIGNMENTS = "wms_assignments";
const STORAGE_KEY_WORK_ENTRIES = "wms_work_entries";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ProjectService = {
    // Projects
    getAll: async (): Promise<Project[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
        return data ? JSON.parse(data) : [];
    },

    getById: async (id: string): Promise<Project | undefined> => {
        const projects = await ProjectService.getAll();
        return projects.find((p) => p.id === id);
    },

    create: async (project: Omit<Project, 'id' | 'tasks'>): Promise<Project> => {
        await delay(500);
        const projects = await ProjectService.getAll();
        const newProject: Project = {
            ...project,
            id: crypto.randomUUID(),
            tasks: []
        };
        projects.unshift(newProject);
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        return newProject;
    },

    update: async (id: string, updates: Partial<Omit<Project, 'id' | 'tasks'>>): Promise<void> => {
        const projects = await ProjectService.getAll();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updates };
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        }
    },

    updateStatus: async (id: string, status: ProjectStatus): Promise<void> => {
        await ProjectService.update(id, { status });
    },

    // Tasks
    addTask: async (projectId: string, task: Omit<ProjectTask, 'id' | 'projectId'>): Promise<void> => {
        const projects = await ProjectService.getAll();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            project.tasks.push({
                ...task,
                id: crypto.randomUUID(),
                projectId
            });
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        }
    },

    updateTask: async (projectId: string, taskId: string, updates: Partial<Omit<ProjectTask, 'id' | 'projectId'>>): Promise<void> => {
        const projects = await ProjectService.getAll();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                Object.assign(task, updates);
                localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
            }
        }
    },

    updateTaskStatus: async (projectId: string, taskId: string, status: TaskStatus): Promise<void> => {
        await ProjectService.updateTask(projectId, taskId, { status });
    },

    deleteTask: async (projectId: string, taskId: string): Promise<void> => {
        const projects = await ProjectService.getAll();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            project.tasks = project.tasks.filter(t => t.id !== taskId);
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        }
    },

    // Members
    getMembers: async (): Promise<Member[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_MEMBERS);
        return data ? JSON.parse(data) : [];
    },

    createMember: async (member: Omit<Member, 'id'>): Promise<Member> => {
        await delay(500);
        const members = await ProjectService.getMembers();
        const newMember: Member = {
            ...member,
            id: crypto.randomUUID()
        };
        members.push(newMember);
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
        return newMember;
    },

    updateMember: async (id: string, updates: Partial<Omit<Member, 'id'>>): Promise<void> => {
        const members = await ProjectService.getMembers();
        const index = members.findIndex(m => m.id === id);
        if (index !== -1) {
            members[index] = { ...members[index], ...updates };
            localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
        }
    },

    deleteMember: async (id: string): Promise<void> => {
        const members = await ProjectService.getMembers();
        const filtered = members.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(filtered));
    },

    // Task Assignments
    getAssignments: async (): Promise<TaskAssignment[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
        return data ? JSON.parse(data) : [];
    },

    assignTask: async (taskId: string, memberId: string): Promise<TaskAssignment> => {
        await delay(500);
        const assignments = await ProjectService.getAssignments();
        const newAssignment: TaskAssignment = {
            id: crypto.randomUUID(),
            taskId,
            memberId,
            assignedDate: new Date().toISOString().split('T')[0]
        };
        assignments.push(newAssignment);
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
        return newAssignment;
    },

    unassignTask: async (taskId: string, memberId: string): Promise<void> => {
        const assignments = await ProjectService.getAssignments();
        const filtered = assignments.filter(a => !(a.taskId === taskId && a.memberId === memberId));
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(filtered));
    },

    // Work Entries
    getWorkEntries: async (): Promise<WorkEntry[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_WORK_ENTRIES);
        return data ? JSON.parse(data) : [];
    },

    addWorkEntry: async (entry: Omit<WorkEntry, 'id'>): Promise<WorkEntry> => {
        await delay(500);
        const entries = await ProjectService.getWorkEntries();
        const newEntry: WorkEntry = {
            ...entry,
            id: crypto.randomUUID()
        };
        entries.push(newEntry);
        localStorage.setItem(STORAGE_KEY_WORK_ENTRIES, JSON.stringify(entries));
        return newEntry;
    },

    updateWorkEntry: async (id: string, updates: Partial<Omit<WorkEntry, 'id'>>): Promise<void> => {
        const entries = await ProjectService.getWorkEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index !== -1) {
            entries[index] = { ...entries[index], ...updates };
            localStorage.setItem(STORAGE_KEY_WORK_ENTRIES, JSON.stringify(entries));
        }
    },

    deleteWorkEntry: async (id: string): Promise<void> => {
        const entries = await ProjectService.getWorkEntries();
        const filtered = entries.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY_WORK_ENTRIES, JSON.stringify(filtered));
    }
};

