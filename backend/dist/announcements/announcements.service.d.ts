import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createdBy: string, dto: CreateAnnouncementDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        createdBy: string;
    }>;
    getAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        createdBy: string;
    }[]>;
}
