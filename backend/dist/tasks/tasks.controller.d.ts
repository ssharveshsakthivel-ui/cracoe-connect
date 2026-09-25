import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(req: any, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        deadline: Date;
        priority: string;
        status: string;
        assignedToId: string;
        isUrgent: boolean;
        assignedById: string;
    }>;
    getByUser(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        deadline: Date;
        priority: string;
        status: string;
        assignedToId: string;
        isUrgent: boolean;
        assignedById: string;
    }[]>;
    updateStatus(req: any, id: string, dto: UpdateStatusDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        deadline: Date;
        priority: string;
        status: string;
        assignedToId: string;
        isUrgent: boolean;
        assignedById: string;
    }>;
}
