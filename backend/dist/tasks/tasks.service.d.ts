import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(assignedById: string, dto: CreateTaskDto): Promise<{
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
    updateStatus(id: string, status: string, updatedById: string): Promise<{
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
