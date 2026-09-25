import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    verifyAndIssue(idToken: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            designation: string;
            role: import(".prisma/client").$Enums.Role;
            profileImage: string | null;
            isActive: boolean;
            points: number;
            createdAt: Date;
        };
    }>;
}
