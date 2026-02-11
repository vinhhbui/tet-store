export interface BannerPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    author: string;
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
    isActive: boolean;
    tags: string[];
}
