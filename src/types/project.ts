export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskType = 'STORY' | 'BUG' | 'TASK' | 'EPIC';

export interface ProjectTask {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    startDate?: string;
    dueDate?: string;
    sprint?: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string;
    endDate?: string;
    department?: string;
    budget?: number;
    tasks: ProjectTask[];
}

export interface Member {
    id: string;
    employeeCode: string;
    name: string;
    birthday?: string;
    joinDate?: string;
}

export interface TaskAssignment {
    id: string;
    taskId: string;
    memberId: string;
    assignedDate: string;
}

export interface WorkEntry {
    id: string;
    taskId: string;
    memberId: string;
    entryDate: string;
    hours: number;
    description?: string;
}
