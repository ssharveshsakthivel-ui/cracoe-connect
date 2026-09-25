import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    create(req: any, dto: CreateAnnouncementDto): Promise<{
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
